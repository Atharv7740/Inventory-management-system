const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT verification middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'Account is inactive. Please contact administrator.' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Permission-based middleware factory
const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (req.user.role === 'admin') {
      return next(); // Admin has all permissions
    }

    if (!req.user.hasPermission(module, action)) {
      return res.status(403).json({ 
        error: `Access denied. You don't have permission to ${action} ${module}.` 
      });
    }
    next();
  };
};

// Rate limiting middleware for login attempts
const loginRateLimit = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user && user.isLocked) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' 
      });
    }

    next();
  } catch (err) {
    next();
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    
    next();
  } catch (err) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authMiddleware,
  adminOnly,
  requirePermission,
  loginRateLimit,
  optionalAuth
};
