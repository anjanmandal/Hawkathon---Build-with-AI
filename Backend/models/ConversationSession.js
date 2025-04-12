// server/models/ConversationSession.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scenarioId: { type: String }, // e.g., 'child_chat', 'job_interview', etc.
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ConversationSession', conversationSessionSchema);
