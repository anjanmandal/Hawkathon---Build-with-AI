// server/models/TherapySession.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const therapySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, unique: true }, // e.g. random or auto-generated
  messages: [messageSchema], // now includes "system" messages as well
  isOpen: { type: Boolean, default: true }, // if session is still open
  report: { 
    type: String, 
    default: '', // final summary or recommendations
  },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
});

module.exports = mongoose.model('TherapySession', therapySessionSchema);
