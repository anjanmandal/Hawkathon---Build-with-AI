// middlewares/authMiddleware.js

// Requires user to be authenticated
exports.ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: 'Not authenticated' });
  };
  
  // Requires user to have a certain role
  // roles is an array of valid roles
  exports.ensureRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden - insufficient role' });
      }
      return next();
    };
  };
  