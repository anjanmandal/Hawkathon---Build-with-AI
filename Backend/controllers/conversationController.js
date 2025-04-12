// server/controllers/conversationController.js
const ConversationSession = require('../models/ConversationSession');
const openaiService = require('../services/openaiService'); // your GPT-4 or Gemini logic
const scenarioData = require('../scenarios/conversationScenarios'); 
const SkillProgress = require('../models/Skillprogress');
// Or you can also fetch from DB if using the Scenario model

exports.listScenarios = (req, res) => {
  // If you're storing scenario definitions in a plain file, we just send them
  // If you're using the DB-based Scenario model, you can do scenarioController.getAllScenarios
  res.json(scenarioData);
};
exports.getOrCreateScenarioSession = async (req, res) => {
    try {
      const { scenarioId } = req.params;
      // Check if user already has a session for that scenario
      let session = await ConversationSession.findOne({
        userId: req.user._id,
        scenarioId,
      });
      if (!session) {
        // create one with only system instructions if needed
        session = await ConversationSession.create({
          userId: req.user._id,
          scenarioId,
          messages: [], 
        });
      }
      return res.json(session);
    } catch (error) {
      console.error('Error in getOrCreateScenarioSession:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  // DELETE scenario session to reset chat
exports.resetScenarioSession = async (req, res) => {
    try {
      const { scenarioId } = req.params;
      // remove session for user + scenario
      await ConversationSession.deleteOne({
        userId: req.user._id,
        scenarioId,
      });
      return res.json({ message: 'Session reset successfully' });
    } catch (error) {
      console.error('Error in resetScenarioSession:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


// The handleConversation remains mostly the same...
// but we might also want it to find or create session automatically if none found
exports.handleConversation = async (req, res) => {
  try {
    const { scenarioId, userMessage, sessionId } = req.body;

    // (1) find or create session 
    let session;
    if (sessionId) {
      session = await ConversationSession.findById(sessionId);
    } else {
      // If not passing sessionId, find by (userId, scenarioId)
      session = await ConversationSession.findOne({
        userId: req.user._id,
        scenarioId,
      });
    }
    // If still no session, create new
    if (!session) {
      session = await ConversationSession.create({
        userId: req.user._id,
        scenarioId,
        messages: [],
      });
    }

    // (2) add user message
    session.messages.push({ role: 'user', content: userMessage });
    await session.save();

    // (3) call AI
    const messagesForAI = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const aiReply = await openaiService.getChatCompletion(messagesForAI);

    // (4) save AI reply
    session.messages.push({ role: 'assistant', content: aiReply });
    await session.save();

    // (5) update skill progress automatically (like before)
    let progress = await SkillProgress.findOne({
      userId: req.user._id,
      scenarioId,
    });
    if (!progress) {
      progress = await SkillProgress.create({
        userId: req.user._id,
        scenarioId,
        attempts: 0,
        badges: [],
      });
    }
    // e.g. increment attempts
    progress.attempts += 1;
    // example badge awarding
    if (progress.attempts >= 5 && !progress.badges.includes('ChatterBox')) {
      progress.badges.push('ChatterBox');
    }
    if (progress.attempts >= 10 && !progress.badges.includes('Conversation Pro')) {
      progress.badges.push('Conversation Pro');
    }
    await progress.save();

    return res.json({
      sessionId: session._id,
      reply: aiReply,
      skillProgress: {
        attempts: progress.attempts,
        badges: progress.badges,
      },
    });
  } catch (error) {
    console.error('Error in handleConversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.listSessions = async (req, res) => {
  try {
    const sessions = await ConversationSession.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('Error listing sessions:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// server/controllers/conversationController.js
exports.getSession = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await ConversationSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      // Optionally verify it belongs to the requesting user
      if (!session.userId.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not your session' });
      }
  
      return res.json(session);
    } catch (error) {
      console.error('Error in getSession:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  