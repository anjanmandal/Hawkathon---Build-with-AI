// server/controllers/expressionQuizController.js
require('dotenv').config();

const QuizSession = require('../models/QuizSession');
const Expression = require('../models/Expression');
const openaiService = require('../services/openaiService');  // <-- use your service here

/**
 * POST /expressionQuiz/start
 * Body: { numberOfExpressions } (optional)
 * - Create a new session with random expressions
 */
exports.startSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const numberOfExpressions = req.body.numberOfExpressions || 5;

    // 1) Pick random expressions
    const total = await Expression.countDocuments();
    if (total === 0) {
      return res.status(400).json({ message: 'No expressions found in DB!' });
    }
    const limit = Math.min(numberOfExpressions, total);

    // e.g. pick random with an aggregation sample
    const randomExpressions = await Expression.aggregate([
      { $sample: { size: limit } },
    ]);

    // 2) Build sub-doc array
    const expressionItems = randomExpressions.map((expr) => ({
      expressionId: expr._id,
      isCorrect: false,
      attempts: 0,
    }));

    // 3) Create session
    const session = await QuizSession.create({
      userId,
      expressions: expressionItems,
      currentIndex: 0,
      points: 0,
      isOpen: true,
      finalSummary: '',
    });

    return res.json({
      message: 'Quiz session started',
      sessionId: session._id,
      totalExpressions: expressionItems.length,
    });
  } catch (err) {
    console.error('Error starting session:', err);
    return res.status(500).json({ message: 'Failed to start session.' });
  }
};

/**
 * GET /expressionQuiz/current/:sessionId
 * - Returns the current expression's image + some details
 */
exports.getCurrentExpression = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await QuizSession.findOne({ _id: sessionId, userId }).populate(
      'expressions.expressionId'
    );
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (!session.isOpen) {
      return res.status(400).json({ message: 'Session is already closed' });
    }

    // If we've exceeded the total expressions, user is effectively done
    if (session.currentIndex >= session.expressions.length) {
      return res.json({
        message: 'All expressions completed!',
        done: true,
      });
    }

    const currentItem = session.expressions[session.currentIndex];
    const expressionDoc = currentItem.expressionId; // the Expression doc

    return res.json({
      done: false,
      currentIndex: session.currentIndex,
      totalExpressions: session.expressions.length,
      imageUrl: expressionDoc.imageUrl,
      // We do NOT send the correct label to the user, obviously
    });
  } catch (err) {
    console.error('Error getting current expression:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /expressionQuiz/guess
 * Body: { sessionId, userGuess }
 * - Check correctness
 * - If incorrect, provide ChatGPT hint (but do NOT move to next expression)
 * - If correct, update points, move to next expression, provide ChatGPT "congrats"
 */
exports.submitGuess = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, userGuess } = req.body;

    if (!sessionId || !userGuess) {
      return res
        .status(400)
        .json({ message: 'Missing sessionId or userGuess' });
    }

    const session = await QuizSession.findOne({ _id: sessionId, userId }).populate(
      'expressions.expressionId'
    );
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (!session.isOpen) {
      return res.status(400).json({ message: 'Session is closed' });
    }

    // Are we done with all expressions?
    if (session.currentIndex >= session.expressions.length) {
      return res.json({ message: 'No more expressions left!', done: true });
    }

    const currentItem = session.expressions[session.currentIndex];
    const correctLabel = currentItem.expressionId.label; // e.g. "laughing"

    // Increment attempts
    currentItem.attempts += 1;

    // Check correctness
    let isCorrect = correctLabel.toLowerCase() === userGuess.toLowerCase();
    if (isCorrect) {
      currentItem.isCorrect = true;

      // Award points: e.g. 10 points if correct on first attempt, 5 on second
      const pointsAwarded = currentItem.attempts === 1 ? 10 : 5;
      session.points += pointsAwarded;

      // Move on to next expression
      session.currentIndex += 1;
    }

    // Build system & user messages for ChatGPT
    const systemMsg = {
      role: 'system',
      content: `You are a helpful assistant that helps a user identify facial expressions. 
If the guess is correct, provide positive feedback. 
If it's incorrect, provide a hint or clue to help them guess properly next time (but do not reveal the actual label).`,
    };

    let userPrompt;
    if (isCorrect) {
      userPrompt = `The user guessed the expression correctly as ${userGuess}. 
Provide a short positive feedback, mention they earned some points, 
and a brief explanation of why ${userGuess} is recognized as that expression.`;
    } else {
      userPrompt = `The user guessed ${userGuess}, 
but the correct expression is ${correctLabel}. 
Provide a short hint on how to identify ${correctLabel} vs ${userGuess}, 
without explicitly saying the correct label if they want to guess again, 
and give encouragement to try again.`;
    }

    // **Use your openaiService** to get the chat completion
    const feedback = await openaiService.getChatCompletion([
      { role: 'system', content: systemMsg.content },
      { role: 'user', content: userPrompt },
    ]);

    // Save
    await session.save();

    return res.json({
      correct: isCorrect,
      attempts: currentItem.attempts,
      currentIndex: session.currentIndex,
      totalExpressions: session.expressions.length,
      points: session.points,
      feedback,
      // done if we've moved beyond the last expression
      done: session.currentIndex >= session.expressions.length,
    });
  } catch (err) {
    console.error('Error submitting guess:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /expressionQuiz/close
 * Body: { sessionId }
 * - Mark session closed
 * - Summarize user performance with ChatGPT
 * - Return final results (points, summary)
 */
exports.closeSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing sessionId' });
    }

    const session = await QuizSession.findOne({ _id: sessionId, userId }).populate(
      'expressions.expressionId'
    );
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (!session.isOpen) {
      // Already closed
      return res.json({
        message: 'Session already closed',
        finalSummary: session.finalSummary,
        points: session.points,
      });
    }

    // Mark closed
    session.isOpen = false;

    // Summarize user performance for ChatGPT
    let summaryText = `User's session results:\n`;
    session.expressions.forEach((item, idx) => {
      const exprLabel = item.expressionId.label;
      const correctness = item.isCorrect ? 'correct' : 'incorrect';
      summaryText += `Expression #${idx + 1}: ${exprLabel}, attempts: ${
        item.attempts
      }, ${correctness}\n`;
    });
    summaryText += `Total points: ${session.points}\n`;

    // Build system & user messages for final summary
    const systemMsg = {
      role: 'system',
      content: `You are a helpful assistant. The user just finished a facial expression quiz. 
Summarize their performance, praising correct answers and gently mentioning incorrect ones. Provide a short final note or tips for improvement.`,
    };

    // Ask ChatGPT for final summary
    const finalSummary = await openaiService.getChatCompletion([
      { role: 'system', content: systemMsg.content },
      { role: 'user', content: summaryText },
    ]);

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
