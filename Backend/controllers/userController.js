// controllers/userController.js
const User = require('../models/User');

exports.getProfile = (req, res) => {
  // req.user is populated by passport after authentication
  const user = req.user;
  return res.json({ user });
};

exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
