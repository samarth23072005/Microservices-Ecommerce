/**
 * 404 Not Found handler for routes not handled by proxies or gateway endpoints
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route '${req.originalUrl}' does not exist on API Gateway.`,
    availableRoutes: [
      'GET /health',
      'ANY /api/products/*',
      'ANY /api/users/*',
      'ANY /api/orders/*'
    ],
    timestamp: new Date().toISOString()
  });
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  console.error(`[Gateway Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred in the API Gateway.',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
