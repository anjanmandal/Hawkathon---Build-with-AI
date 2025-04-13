// server/controllers/scenarioController.js
const Scenario = require('../models/Scenario');
const SkillProgress = require('../models/Skillprogress');

exports.getAllScenarios = async (req, res) => {
  try {
    const scenarios = await Scenario.find({});
    return res.json(scenarios);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching scenarios', error });
  }
};

exports.getScenario = async (req, res) => {
  const { scenarioId } = req.params;
  try {
    const scenario = await Scenario.findOne({ scenarioId });
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }
    return res.json(scenario);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching scenario', error });
  }
};

exports.getUserSkillProgress = async (req, res) => {
  const { scenarioId } = req.params;
  try {
    let progress = await SkillProgress.findOne({
      userId: req.user._id,
      scenarioId,
    });
    if (!progress) {
      // Create a default entry on the fly
      progress = await SkillProgress.create({
        userId: req.user._id,
        scenarioId,
      });
    }
    return res.json(progress);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching skill progress', error });
  }
};

exports.updateUserSkillProgress = async (req, res) => {
  const { scenarioId } = req.params;
  const { incrementAttempts, addBadge, setStage } = req.body; 
  // e.g., { incrementAttempts: true, addBadge: "Beginner Communicator" }

  try {
    let progress = await SkillProgress.findOne({
      userId: req.user._id,
      scenarioId,
    });
    if (!progress) {
      progress = await SkillProgress.create({
        userId: req.user._id,
        scenarioId,
      });
    }

    if (incrementAttempts) {
      progress.attempts += 1;
    }
    if (addBadge && !progress.badges.includes(addBadge)) {
      progress.badges.push(addBadge);
    }
    if (typeof setStage === 'number') {
      progress.currentStage = setStage;
    }

    await progress.save();
    return res.json(progress);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating skill progress', error });
  }
};


/**
 * Fetch all scenarios and the specified user's skill progress
 * in a single request.
 */
exports.getAllScenariosForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Find all scenarios
    const scenarios = await Scenario.find({});
    if (!scenarios.length) {
      return res.json([]);
    }

    // 2. For each scenario, find or create a SkillProgress entry for that user
    const results = [];
    for (const scenario of scenarios) {
      let progress = await SkillProgress.findOne({
        userId,
        scenarioId: scenario.scenarioId,
      });

      // If no SkillProgress doc found, optionally create one with defaults
      if (!progress) {
        progress = await SkillProgress.create({
          userId,
          scenarioId: scenario.scenarioId,
          attempts: 0,
          badges: [],
          currentStage: 0,
        });
      }

      // Combine scenario info + user’s progress into one object
      results.push({
        title: scenario.title,
        scenarioId: scenario.scenarioId,
        attempts: progress.attempts,
      });
    }

    return res.json(results);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user scenario progress',
      error,
    });
  }
};