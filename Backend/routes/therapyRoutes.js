// server/routes/therapyRoutes.js
const express = require('express');
const router = express.Router();
 const { ensureAuth } = require('../middlewares/authMiddleware'); // if you have an auth system
const therapyController = require('../controllers/therapyController');

// Start or resume a therapy session
router.post('/start',ensureAuth, therapyController.startSession);

// Send a message to the virtual therapist
router.post('/message',ensureAuth, therapyController.sendMessage);

// Close session, get final report
router.post('/close', therapyController.closeSession);

// Get all session reports
router.get('/reports', therapyController.getSessionReports);

module.exports = router;
