const jwt = require('jsonwebtoken');

/**
 * Protect routes - Verifies JWT from Authorization Bearer header
 * Attaches user identity to req.user (id, email, role)
 */
const protect = (req, res, next) => {
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
    const secret = process.env.JWT_SECRET || 'replace_with_a_long_random_secret';
    const decoded = jwt.verify(token, secret);

    // Support both decoded.id and decoded.userId for token compatibility
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token: missing user identity.'
      });
    }

    req.user = {
      id: userId.toString(),
      userId: userId.toString(),
      email: decoded.email || '',
      role: decoded.role || 'customer'
    };

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
        message: `Forbidden: User role '${req.user?.role || 'unknown'}' is not authorized to perform this action.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
