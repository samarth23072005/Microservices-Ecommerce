/**
 * HTTP Request Logger Middleware for API Gateway
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Status color coding for terminal readability
    const color = statusCode >= 500 
      ? '\x1b[31m' // Red
      : statusCode >= 400 
      ? '\x1b[33m' // Yellow
      : statusCode >= 300 
      ? '\x1b[36m' // Cyan
      : '\x1b[32m'; // Green
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] [Gateway] ${req.method} ${req.originalUrl} -> ${color}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
};

module.exports = requestLogger;
