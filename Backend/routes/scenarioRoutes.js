// server/routes/scenarioRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware');
const scenarioController = require('../controllers/scenarioController');

// GET all scenarios
router.get('/', ensureAuth, scenarioController.getAllScenarios);

// GET single scenario
router.get('/:scenarioId', ensureAuth, scenarioController.getScenario);

// GET user skill progress for scenario
router.get('/:scenarioId/skill', ensureAuth, scenarioController.getUserSkillProgress);

// POST update skill progress
router.post('/:scenarioId/skill', ensureAuth, scenarioController.updateUserSkillProgress);
router.get('/user/:userId/progress', ensureAuth, scenarioController.getAllScenariosForUser);

module.exports = router;
