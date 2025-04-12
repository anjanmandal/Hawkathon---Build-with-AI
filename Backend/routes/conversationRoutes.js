// server/routes/conversationRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware');
const conversationController = require('../controllers/conversationController');

router.get('/scenarios', ensureAuth, conversationController.listScenarios);
router.post('/chat', ensureAuth, conversationController.handleConversation);
// NEW: Get or create session for a scenario
router.get('/scenarioSession/:scenarioId', ensureAuth, conversationController.getOrCreateScenarioSession);

router.delete('/scenarioSession/:scenarioId', ensureAuth, conversationController.resetScenarioSession);


module.exports = router;
