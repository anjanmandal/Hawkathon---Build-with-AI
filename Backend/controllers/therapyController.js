// server/controllers/therapyController.js
const TherapySession = require('../models/TherapySession');
const openaiService = require('../services/openaiService');
const { v4: uuidv4 } = require('uuid'); // to generate session IDs

// Start a new therapy session or resume an existing one if it's open
exports.startSession = async (req, res) => {
  try {
    const userId = req.user._id; // or from your auth
    // Optionally: check if there's an already open session. 
    let session = await TherapySession.findOne({ userId, isOpen: true });
    if (session) {
      // session already in progress
      return res.json({
        sessionId: session.sessionId,
        message: 'Session already in progress',
      });
    }
    // If none, create new
    const newSessionId = uuidv4();
    const systemPrompt = `
     Act as a virtual therapist specializing in anxiety support for autistic individuals. 
     Use a warm, patient, and supportive tone. 
     Provide evidence-based cognitive-behavioral therapy (CBT) techniques, such as guided relaxation, thought challenging, and psychoeducation about anxiety. 
     Allow users to express their feelings in their own words and adapt your responses to their unique needs. Offer step-by-step guidance for anxiety management, real-time encouragement
      Greet the user by saying "I am your virtual therapist. How can I help you today?"
    `;
    const sessionDoc = await TherapySession.create({
      userId,
      sessionId: newSessionId,
      messages: [
        { role: 'system', content: systemPrompt },
      ],
      isOpen: true,
    });
    return res.json({
      sessionId: newSessionId,
      message: 'Session started',
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Send a user message, get the assistant reply
exports.sendMessage = async (req, res) => {
    try {
      console.log('sendMessage: route hit');
      const userId = req.user._id;
      const { sessionId, userMessage } = req.body;
      console.log('Looking up session for', sessionId);
  
      const sessionDoc = await TherapySession.findOne({ userId, sessionId, isOpen: true });
      if (!sessionDoc) {
        console.log('No open session found');
        return res.status(404).json({ message: 'Open session not found' });
      }
  
      // Append user message
      sessionDoc.messages.push({ role: 'user', content: userMessage });
      await sessionDoc.save();
      console.log('User message saved');
  
      // Construct conversation for OpenAI
      const openaiMessages = sessionDoc.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      console.log('OpenAI messages:', JSON.stringify(openaiMessages));
  
      // Get AI reply
      const aiReply = await openaiService.getChatCompletion(openaiMessages);
      console.log('Received AI reply:', aiReply);
  
      // Save AI reply in messages
      sessionDoc.messages.push({ role: 'assistant', content: aiReply });
      await sessionDoc.save();
  
      console.log('Session updated with AI reply');
      return res.json({ reply: aiReply });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  

// Close session, generate a short report
exports.closeSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;
    const sessionDoc = await TherapySession.findOne({ userId, sessionId, isOpen: true });
    if (!sessionDoc) {
      return res.status(404).json({ message: 'Session not found or already closed' });
    }

    // Generate a short summary using ChatGPT or a naive approach
    // Let's do a naive approach: 
    // We'll pass the conversation to GPT with "Summarize the conversation"
    // Or store a simpler summary ourselves.

    const summaryPrompt = `
      Summarize this therapy session in a short, gentle tone. 
      The user and you discussed coping or daily stress. 
      Emphasize a supportive conclusion and a note of encouragement.
    `;

    // combine session messages with summary prompt
    const messagesForSummary = [
      { role: 'system', content: summaryPrompt },
      ...sessionDoc.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const summary = await openaiService.getChatCompletion(messagesForSummary);

    // store summary in doc
    sessionDoc.report = summary;
    sessionDoc.isOpen = false;
    sessionDoc.closedAt = new Date();
    await sessionDoc.save();

    return res.json({
      message: 'Session closed',
      report: summary,
    });
  } catch (error) {
    console.error('Error in closeSession:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// for parents or user to view session stats
exports.getSessionReports = async (req, res) => {
  try {
    const userId = req.user._id; 
    // or if a parent, you might pass a child's userId in query
    const sessions = await TherapySession.find({ userId, isOpen: false })
      .sort({ closedAt: -1 });
    // you can also build stats like total sessions, or how many times 'breathing exercise' was used
    // For simplicity, just return session docs
    return res.json(sessions);
  } catch (error) {
    console.error('Error in getSessionReports:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



/**
 * Get closed therapy sessions (reports) for a specific user (targetUserId).
 * Typically parents / providers can view these if authorized.
 */
exports.getSessionReportsForUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    // If needed, you can add checks here:
    // 1) ensure the requesting user is a parent/healthcareProvider
    // 2) verify that targetUserId is actually related to this user, etc.

    const sessions = await TherapySession.find({
      userId: targetUserId,
      isOpen: false
    }).sort({ closedAt: -1 });

    return res.json(sessions);
  } catch (error) {
    console.error('Error in getSessionReportsForUser:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};