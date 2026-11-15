require('dotenv').config();

const app = require('./app');
const config = require('./config/services');

const server = app.listen(config.port, () => {
  console.log('===========================================================');
  console.log(`[API Gateway] Running successfully on port: ${config.port}`);
  console.log(`[API Gateway] Environment: ${config.nodeEnv}`);
  console.log(`[API Gateway] Health Check: http://localhost:${config.port}/health`);
  console.log('-----------------------------------------------------------');
  console.log('[API Gateway] Configured Downstream Proxy Routes:');
  console.log(`  - /api/products/*  -->  ${config.services.products.target}`);
  console.log(`  - /api/users/*     -->  ${config.services.users.target}`);
  console.log(`  - /api/orders/*    -->  ${config.services.orders.target}`);
  console.log('===========================================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[API Gateway Fatal] Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[API Gateway Fatal] Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown on termination signals
const gracefulShutdown = (signal) => {
  console.log(`\n[API Gateway] ${signal} signal received. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log('[API Gateway] HTTP server closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
