// server/models/SkillProgress.js
const mongoose = require('mongoose');

// For each user + scenario, track their progress
const skillProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scenarioId: { type: String, required: true },
  attempts: { type: Number, default: 0 }, // number of attempts or sessions
  badges: [{ type: String }], // e.g. ["Beginner Badge", "Interview Ace"] 
  currentStage: { type: Number, default: 1 }, // which difficulty stage they’re on
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SkillProgress', skillProgressSchema);
