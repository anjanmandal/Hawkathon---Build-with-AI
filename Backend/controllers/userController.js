// controllers/userController.js
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    // Find the user by ID and populate the relatedUsers field with specific fields
    const user = await User.findById(req.user._id)
      .populate('relatedUsers', 'email firstName lastName bio role');
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    // Select only fields needed for display.
    const users = await User.find({}, 'email firstName lastName');
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};