// server/models/Scenario.js
const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  scenarioId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  initialSystemPrompt: { type: String, required: true }, // The AI system prompt for scenario

  // Difficulty levels or steps (optional)
  difficultyStages: [
    {
      stageNumber: Number,
      stageDescription: String,
      // Additional prompts or rules for that stage
      systemPromptAddon: String,
    },
  ],
});

module.exports = mongoose.model('Scenario', scenarioSchema);
