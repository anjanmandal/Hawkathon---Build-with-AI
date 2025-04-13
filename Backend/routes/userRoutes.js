// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User=require('../models/User')
const userController = require('../controllers/userController');
const { ensureAuth, ensureRole } = require('../middlewares/authMiddleware');

// Example endpoints
router.get('/', userController.getAllUsers);
router.get('/profile', ensureAuth, userController.getProfile);

// Example: only 'parent' or 'healthcareProvider' can access certain data
router.get('/all-users', ensureAuth, ensureRole(['parent', 'healthcareProvider']), userController.listAllUsers);
// server/routes/userRoutes.js
router.get('/search', ensureAuth, async (req, res) => {
    try {
      const query = req.query.query || '';
      // basic approach: find by partial match in firstName, lastName, or email
      const regex = new RegExp(query, 'i'); // case-insensitive
      const users = await User.find({
        $or: [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { email: { $regex: regex } }
        ]
      }).limit(20);
  
      return res.json({ users });
    } catch (err) {
      console.error('Error searching users:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;
