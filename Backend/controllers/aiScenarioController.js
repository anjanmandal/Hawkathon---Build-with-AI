// server/controllers/aiScenarioController.js
require('dotenv').config();
const ScenarioSession = require('../models/ScenarioSession');
const { getChatCompletion } = require('../services/openaiService');
// or directly import { Configuration, OpenAIApi } if not using openaiService.

exports.startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const numberOfScenarios = req.body.numberOfScenarios || 3;

    // Prompt ChatGPT for an array of scenario descriptions
    const systemMsg = {
      role: 'system',
      content: `
        You are an AI that strictly returns a JSON array.
        The user wants ${numberOfScenarios} real-world scenarios.
        Each array element must have exactly one field:
          "scenarioDescription"
        Example:
        [
          {
            "scenarioDescription": "You're at a grocery store and you need to ask for help finding an item..."
          },
          ...
        ]
        
        Return ONLY valid JSON, nothing else.
      `,
    };
    const userMsg = {
      role: 'user',
      content: 'Generate some random real-life scenarios with only scenarioDescription.'
    };

    // 1) Call GPT
    const rawJson = await getChatCompletion([systemMsg, userMsg]);
    console.log('Raw GPT response:', rawJson);

    // 2) Parse the JSON
    let scenarioArray;
    try {
      scenarioArray = JSON.parse(rawJson);
      if (!Array.isArray(scenarioArray)) {
        throw new Error('GPT did not return a JSON array');
      }
    } catch (err) {
      console.error('Error parsing scenario JSON:', err);
      return res.status(500).json({ message: 'Failed to parse AI-generated scenarios.' });
    }

    // 3) Build scenario sub-docs
    const finalScenarios = scenarioArray.slice(0, numberOfScenarios).map((sc) => ({
      scenarioDescription: sc.scenarioDescription || sc.description || 'No scenario given',
      userResponse: '',
      isCorrect: false,
      attempts: 0
    }));

    // 4) Create the session doc
    const session = await ScenarioSession.create({
      userId,
      scenarios: finalScenarios,
      currentIndex: 0,
      points: 0,
      isOpen: true,
      finalSummary: ''
    });

    return res.json({
      message: 'AI scenario session started',
      sessionId: session._id,
      totalScenarios: finalScenarios.length
    });
  } catch (err) {
    console.error('Error starting scenario session:', err);
    return res.status(500).json({ message: 'Failed to start AI scenario session.' });
  }
};

exports.getCurrentScenario = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await ScenarioSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (!session.isOpen) {
      return res.status(400).json({ message: 'Session already closed' });
    }

    if (session.currentIndex >= session.scenarios.length) {
      return res.json({ done: true, message: 'All scenarios completed!' });
    }

    const currentItem = session.scenarios[session.currentIndex];

    return res.json({
      done: false,
      currentIndex: session.currentIndex,
      totalScenarios: session.scenarios.length,
      scenarioDescription: currentItem.scenarioDescription
    });
  } catch (err) {
    console.error('Error getting current scenario:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.submitResponse = async (req, res) => {
    try {
      const userId = req.user._id;
      const { sessionId, userResponse } = req.body;
  
      // 1) Validate input
      if (!sessionId || !userResponse) {
        return res.status(400).json({ message: 'Missing sessionId or userResponse' });
      }
  
      // 2) Find session
      const session = await ScenarioSession.findOne({ _id: sessionId, userId });
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      if (!session.isOpen) {
        return res.status(400).json({ message: 'Session is closed' });
      }
  
      // 3) Check if scenarios are exhausted
      if (session.currentIndex >= session.scenarios.length) {
        return res.json({ message: 'No more scenarios left!', done: true });
      }
  
      // 4) Get current scenario sub-doc
      const currentItem = session.scenarios[session.currentIndex];
      // Mark attempt & store user response
      currentItem.attempts += 1;
      currentItem.userResponse = userResponse;
  
      // 5) Ask GPT to evaluate correctness
      const systemMsg = {
        role: 'system',
        content: `
          You are a communication coach. 
          The scenario is:
          ${currentItem.scenarioDescription}
  
          The user responded: "${userResponse}"
  
          Evaluate if it's correct or appropriate for the scenario. Also, in the message add how the tone and good way should be.
          Return valid JSON with exactly two fields:
            "verdict": "correct" or "incorrect"
            "message": a short explanation or suggestion
          
          Example:
          {
            "verdict": "correct",
            "message": "Great job. You used polite language. You might also add a friendly greeting."
          }
        `,
      };
  
      // Call your openaiService or direct OpenAI
      const gptReply = await getChatCompletion([systemMsg]);
      console.log("Raw GPT reply for evaluation:", gptReply);
  
      // 6) Parse GPT JSON: { verdict: "...", message: "..." }
      let verdict = 'incorrect';
      let message = 'Something went wrong.';
  
      try {
        const parsed = JSON.parse(gptReply);
        if (parsed.verdict === 'correct') {
          verdict = 'correct';
        } else {
          verdict = 'incorrect';
        }
        message = parsed.message || 'No detailed feedback.';
      } catch (err) {
        console.error("Failed to parse GPT JSON. Using entire gptReply as fallback.");
        message = gptReply;
      }
  
      // 7) If correct, update points & move to next scenario
      const isCorrect = (verdict === 'correct');
      if (isCorrect) {
        currentItem.isCorrect = true;
        const pointsAwarded = currentItem.attempts === 1 ? 10 : 5;
        session.points += pointsAwarded;
        session.currentIndex += 1;
      }
  
      // 8) Save updates
      await session.save();
  
      // 9) Return response
      return res.json({
        correct: isCorrect,
        feedback: message,
        attempts: currentItem.attempts,
        currentIndex: session.currentIndex,
        totalScenarios: session.scenarios.length,
        points: session.points,
        done: (session.currentIndex >= session.scenarios.length),
      });
    } catch (err) {
      console.error('Error in submitResponse:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
exports.closeSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing sessionId' });
    }

    const session = await ScenarioSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (!session.isOpen) {
      return res.json({
        message: 'Session already closed',
        finalSummary: session.finalSummary,
        points: session.points
      });
    }

    session.isOpen = false;

    // Summarize user performance
    let summaryText = 'User scenario session results:\n';
    session.scenarios.forEach((sc, idx) => {
      const correctness = sc.isCorrect ? 'correct' : 'incorrect';
      summaryText += `Scenario #${idx + 1}: attempts=${sc.attempts}, ${correctness}, userResponse="${sc.userResponse}"\n`;
    });
    summaryText += `Total points: ${session.points}\n`;

    const systemMsg = {
      role: 'system',
      content: `
        Summarize how the user performed on these scenarios, praising correct answers
        and noting incorrect ones. 
      `
    };
    const userMsg = {
      role: 'user',
      content: summaryText
    };

    const finalSummary = await getChatCompletion([systemMsg, userMsg]);
    session.finalSummary = finalSummary;
    await session.save();

    return res.json({
      message: 'Session closed',
      points: session.points,
      finalSummary
    });
  } catch (err) {
    console.error('Error closing session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
