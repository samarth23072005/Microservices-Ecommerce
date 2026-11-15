require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5002;

// Initialize Database Connection
connectDB();

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`[Product Service] Running on port: ${PORT}`);
  console.log(`[Product Service] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Product Service] Health: http://localhost:${PORT}/health`);
  console.log(`[Product Service] API:    http://localhost:${PORT}/api/products`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Product Service Error] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Product Service Error] Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown on termination signals
const gracefulShutdown = () => {
  console.log('\n[Product Service] Termination signal received. Closing HTTP server...');
  server.close(() => {
    console.log('[Product Service] HTTP server closed gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
