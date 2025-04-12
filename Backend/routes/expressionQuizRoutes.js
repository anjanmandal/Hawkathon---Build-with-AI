// server/routes/expressionQuizRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware');
const quizController = require('../controllers/expressionQuizController');

// POST to start a new session
router.post('/start', ensureAuth, quizController.startSession);

// GET the current expression (image) to guess
router.get('/current/:sessionId', ensureAuth, quizController.getCurrentExpression);

// POST a guess
router.post('/guess', ensureAuth, quizController.submitGuess);

// POST to close session
router.post('/close', ensureAuth, quizController.closeSession);

module.exports = router;
