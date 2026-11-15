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

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((val) => val.message);
    message = errors.join(', ');
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}'`;
  }

  console.error(`[Order Service Error] ${req.method} ${req.originalUrl}:`, err.message);

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
