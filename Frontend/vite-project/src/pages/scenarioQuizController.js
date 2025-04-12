// server/controllers/aiScenarioController.js
require('dotenv').config();
const ScenarioSession = require('../models/ScenarioSession');
const { getChatCompletion } = require('../services/openaiService');
// If you aren't using a separate service, you can directly import { Configuration, OpenAIApi } from 'openai' here.

exports.startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const numberOfScenarios = req.body.numberOfScenarios || 3;

    // 1) Ask ChatGPT to produce 'numberOfScenarios' real-life scenarios in JSON format
    // We'll prompt for an array of objects with { title, description, relationship } fields.
    const systemMsg = {
      role: 'system',
      content: `
        You are an AI that generates real-life communication scenarios. 
        The user wants ${numberOfScenarios} different scenarios. 
        Each scenario should be returned as a JSON array element with fields: 
          title, description, relationship. 
        The "relationship" might be friend, coworker, teacher, etc.
        
        EXAMPLE of desired JSON:
        [
          {
            "title": "Asking a friend for help",
            "description": "You need help moving furniture, and your friend is available on Saturday. How do you ask politely?",
            "relationship": "friend"
          },
          ...
        ]
        
        Do not include any extra text outside the JSON. Just provide valid JSON.
      `,
    };
    const userMsg = { role: 'user', content: 'Generate random real-life scenarios please.' };

    // 2) We'll call getChatCompletion() with those messages
    const rawJson = await getChatCompletion([systemMsg, userMsg]);
    // The AI reply is presumably a JSON string. We need to parse it.
    let scenarioArray;
    try {
      scenarioArray = JSON.parse(rawJson);
      // ensure it's an array
      if (!Array.isArray(scenarioArray)) {
        throw new Error('GPT did not return a JSON array');
      }
    } catch (err) {
      console.error('Error parsing scenario JSON from GPT:', err);
      console.error('Raw response was:', rawJson);
      return res.status(500).json({ message: 'Failed to parse AI-generated scenarios.' });
    }

    // 3) For safety, slice to the desired count
    const finalScenarios = scenarioArray.slice(0, numberOfScenarios).map((sc) => ({
      title: sc.title || 'Untitled',
      description: sc.description || '',
      relationship: sc.relationship || '',
    }));

    // 4) Create a new ScenarioSession doc
    const session = await ScenarioSession.create({
      userId,
      scenarios: finalScenarios,  // sub-docs
      currentIndex: 0,
      points: 0,
      isOpen: true,
      finalSummary: '',
    });

    return res.json({
      message: 'Scenario session started (AI-generated)',
      sessionId: session._id,
      totalScenarios: finalScenarios.length,
    });
  } catch (err) {
    console.error('Error starting AI scenario session:', err);
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

    // If done with all scenarios
    if (session.currentIndex >= session.scenarios.length) {
      return res.json({ done: true, message: 'All scenarios completed!' });
    }

    const currentItem = session.scenarios[session.currentIndex];
    return res.json({
      done: false,
      currentIndex: session.currentIndex,
      totalScenarios: session.scenarios.length,
      title: currentItem.title,
      description: currentItem.description,
      relationship: currentItem.relationship,
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
    if (!sessionId || !userResponse) {
      return res.status(400).json({ message: 'Missing sessionId or userResponse' });
    }

    const session = await ScenarioSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (!session.isOpen) {
      return res.status(400).json({ message: 'Session is closed' });
    }
    if (session.currentIndex >= session.scenarios.length) {
      return res.json({ done: true, message: 'No more scenarios left!' });
    }

    const currentItem = session.scenarios[session.currentIndex];
    currentItem.attempts += 1;
    currentItem.userResponse = userResponse;

    // We'll let ChatGPT evaluate if it's correct or not
    const systemMsg = {
      role: 'system',
      content: `
        You are a communication coach. 
        The scenario is:
        Title: ${currentItem.title}
        Relationship: ${currentItem.relationship}
        Description: ${currentItem.description}

        The user responded: "${userResponse}"

        Evaluate if it is correct or appropriate. 
        Decide if it's "correct|" or "incorrect|" 
        then provide short feedback. 
        For example:
        "correct|Good job, you used a polite tone..."
        or 
        "incorrect|You might need to greet them more politely..."
      `,
    };

    const gptReply = await getChatCompletion([systemMsg]);
    let isCorrect = false;
    let feedback = '';

    // parse the reply
    if (gptReply.toLowerCase().startsWith('correct|')) {
      isCorrect = true;
      feedback = gptReply.substring('correct|'.length).trim();
    } else if (gptReply.toLowerCase().startsWith('incorrect|')) {
      isCorrect = false;
      feedback = gptReply.substring('incorrect|'.length).trim();
    } else {
      // fallback
      isCorrect = false;
      feedback = gptReply;
    }

    if (isCorrect) {
      currentItem.isCorrect = true;
      // Award points (10 if correct on first try, else 5)
      const pointsAwarded = (currentItem.attempts === 1) ? 10 : 5;
      session.points += pointsAwarded;

      session.currentIndex += 1; // move to next scenario
    }

    await session.save();

    return res.json({
      correct: isCorrect,
      feedback,
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
        points: session.points,
      });
    }

    session.isOpen = false;

    // Summarize the user’s scenario attempts
    let summaryText = 'User scenario session summary:\n';
    session.scenarios.forEach((sc, idx) => {
      const correctness = sc.isCorrect ? 'correct' : 'incorrect';
      summaryText += `Scenario #${idx + 1} (${sc.title}): attempts=${sc.attempts}, ${correctness}, response="${sc.userResponse}"\n`;
    });
    summaryText += `Total points: ${session.points}\n`;

    const systemMsg = {
      role: 'system',
      content: `
        You are a helpful assistant reviewing scenario-based practice. 
        Summarize how the user did, praising correct answers and noting incorrect ones. 
        Provide a final note for improvement.
      `,
    };
    const userMsg = {
      role: 'user',
      content: summaryText,
    };

    const finalSummary = await getChatCompletion([systemMsg, userMsg]);
    session.finalSummary = finalSummary;
    await session.save();

    return res.json({
      message: 'Session closed',
      points: session.points,
      finalSummary,
    });
  } catch (err) {
    console.error('Error closing session:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
