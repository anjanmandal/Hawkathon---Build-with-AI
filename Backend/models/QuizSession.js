// server/models/QuizSession.js
const mongoose = require('mongoose');

const expressionAttemptSchema = new mongoose.Schema({
  expressionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expression' },
  isCorrect: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },   // how many times user tried before getting it right
});

const quizSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // The expressions in this session
  expressions: [expressionAttemptSchema],

  // Index of the currently active expression in the array
  currentIndex: { type: Number, default: 0 },

  // Points so far
  points: { type: Number, default: 0 },

  // Whether the quiz is open
  isOpen: { type: Boolean, default: true },

  // Final summary from ChatGPT
  finalSummary: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

quizSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);
