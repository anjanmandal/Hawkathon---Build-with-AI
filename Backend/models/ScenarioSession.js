// server/models/ScenarioSession.js
const mongoose = require('mongoose');

// Each scenario sub-document
const scenarioSubSchema = new mongoose.Schema({
  scenarioDescription: String,  // The real-world scenario text
  userResponse: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
});

const scenarioSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // We'll store an array of scenarioSubSchema
  scenarios: [scenarioSubSchema],

  // Which scenario index the user is currently on
  currentIndex: { type: Number, default: 0 },

  // Points the user has
  points: { type: Number, default: 0 },

  // If the session is open or closed
  isOpen: { type: Boolean, default: true },

  // Final summary from ChatGPT after user ends session
  finalSummary: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

scenarioSessionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScenarioSession', scenarioSessionSchema);
