// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuth, ensureRole } = require('../middlewares/authMiddleware');

// Example endpoints
router.get('/profile', ensureAuth, userController.getProfile);

// Example: only 'parent' or 'healthcareProvider' can access certain data
router.get('/all-users', ensureAuth, ensureRole(['parent', 'healthcareProvider']), userController.listAllUsers);

module.exports = router;
