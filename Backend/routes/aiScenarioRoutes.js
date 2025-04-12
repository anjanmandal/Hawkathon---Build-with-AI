// server/routes/aiScenarioRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware');
const aiScenarioController = require('../controllers/aiScenarioController');

// Start session (AI generates scenarios)
router.post('/start', ensureAuth, aiScenarioController.startSession);

// Get current scenario
router.get('/current/:sessionId', ensureAuth, aiScenarioController.getCurrentScenario);

// Submit user response
router.post('/respond', ensureAuth, aiScenarioController.submitResponse);

// Close session
router.post('/close', ensureAuth, aiScenarioController.closeSession);

module.exports = router;
