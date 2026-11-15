const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verifies JWT from Authorization Bearer header
 * Attaches authenticated user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
    return res.status(500).json({
    success: false,
    message: 'JWT_SECRET is not configured.'
    });
    }
    const decoded = jwt.verify(token, secret);

    // Fetch user from MongoDB to ensure user still exists and get latest profile data
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authorization token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token. Authentication failed.'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g. 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'unknown'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
