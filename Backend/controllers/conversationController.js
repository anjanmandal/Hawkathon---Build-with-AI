// server/controllers/conversationController.js
const ConversationSession = require('../models/ConversationSession');
const openaiService = require('../services/openaiService');
const Scenario = require('../models/Scenario');
const SkillProgress = require('../models/Skillprogress');

/**
 * Build the initial assistant message solely from the DB.
 * If the scenario isn’t found, fall back to a generic greeting.
 */
async function buildIntroMessage(scenarioId) {
  const scenario = await Scenario.findOne({ scenarioId }).lean();

  if (!scenario) {
    return '👋 Hi! I\'m your conversation coach. Ready to practise?';
  }

  const firstStage = scenario.difficultyStages?.[0]?.stageDescription || '';
  return [
    `👋 **${scenario.title}**`,
    scenario.description,
    firstStage && `⭐ *Today\'s goal:* ${firstStage}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------

/**
 * GET /scenario – list all scenarios straight from the DB.
 */
exports.listScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find().lean();
    res.json(scenarios);
  } catch (err) {
    console.error('Error listing scenarios:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /conversation/scenarioSession/:scenarioId
 * Creates a new session with an intro message if none exists.
 */
exports.getOrCreateScenarioSession = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    let session = await ConversationSession.findOne({
      userId: req.user._id,
      scenarioId,
    });

    if (!session) {
      session = await ConversationSession.create({
        userId: req.user._id,
        scenarioId,
        messages: [
          {
            role: 'assistant',
            content: await buildIntroMessage(scenarioId),
          },
        ],
      });
    }

    res.json(session);
  } catch (error) {
    console.error('Error in getOrCreateScenarioSession:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE /conversation/scenarioSession/:scenarioId – reset chat for a scenario.
 */
exports.resetScenarioSession = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    await ConversationSession.deleteOne({
      userId: req.user._id,
      scenarioId,
    });
    res.json({ message: 'Session reset successfully' });
  } catch (error) {
    console.error('Error in resetScenarioSession:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /conversation/chat – user sends a message and receives an AI reply.
 */
exports.handleConversation = async (req, res) => {
  try {
    const { scenarioId, userMessage, sessionId } = req.body;

    // 1️⃣ Locate or create session (seed intro if needed)
    let session;
    if (sessionId) {
      session = await ConversationSession.findById(sessionId);
    } else {
      session = await ConversationSession.findOne({
        userId: req.user._id,
        scenarioId,
      });
    }

    if (!session) {
      session = await ConversationSession.create({
        userId: req.user._id,
        scenarioId,
        messages: [
          { role: 'assistant', content: await buildIntroMessage(scenarioId) },
        ],
      });
    }

    // 2️⃣ Append user message
    session.messages.push({ role: 'user', content: userMessage });
    await session.save();

    // 3️⃣ AI completion
    const aiReply = await openaiService.getChatCompletion(
      session.messages.map((m) => ({ role: m.role, content: m.content }))
    );

    // 4️⃣ Store and return reply
    session.messages.push({ role: 'assistant', content: aiReply });
    await session.save();

    // 5️⃣ Update progress
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
    progress.attempts += 1;
    if (progress.attempts >= 5 && !progress.badges.includes('ChatterBox')) {
      progress.badges.push('ChatterBox');
    }
    if (progress.attempts >= 10 && !progress.badges.includes('Conversation Pro')) {
      progress.badges.push('Conversation Pro');
    }
    await progress.save();

    res.json({
      sessionId: session._id,
      reply: aiReply,
      skillProgress: {
        attempts: progress.attempts,
        badges: progress.badges,
      },
    });
  } catch (error) {
    console.error('Error in handleConversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------

exports.listSessions = async (req, res) => {
  try {
    const sessions = await ConversationSession.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error('Error listing sessions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ConversationSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!session.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not your session' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error in getSession:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
