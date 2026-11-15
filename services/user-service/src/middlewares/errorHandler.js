/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`
  });
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    if (field === 'email') {
      message = 'An account with this email address already exists.';
    } else {
      message = `Duplicate value entered for ${field}. Value must be unique.`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((val) => val.message);
    message = errors.join(', ');
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}'`;
  }

  console.error(`[User Service Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
