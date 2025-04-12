// server/models/ExpressionSession.js
const mongoose = require('mongoose');

// Each expression in the session
const expressionSubSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  correctEmotion: { type: String, required: true },
  userGuess: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Main session model
const expressionSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // List of expression attempts in this session
  expressions: [expressionSubSchema],

  // For quick stats
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Keep updatedAt current
expressionSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ExpressionSession', expressionSessionSchema);
