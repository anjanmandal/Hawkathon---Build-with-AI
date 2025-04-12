// controllers/authController.js
const passport = require('passport');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = new User({ email, password, role });
    await newUser.save();

    // Auto-login after registration (optional)
    req.login(newUser, (err) => {
      if (err) return res.status(500).json({ message: err.message });
      return res.status(201).json({ message: 'Registered successfully', user: newUser });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({ message: info.message || 'Login failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      return res.json({ message: 'Logged in successfully', user });
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ message: 'Logged out successfully' });
    });
  });
};
