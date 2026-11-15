require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5001;

// 1. Connect to MongoDB (user_db) before listening
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('===========================================================');
    console.log(`[User Service] Running successfully on port: ${PORT}`);
    console.log(`[User Service] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[User Service] Health Check: http://localhost:${PORT}/health`);
    console.log(`[User Service] Endpoints:`);
    console.log(`  - POST http://localhost:${PORT}/api/users/register`);
    console.log(`  - POST http://localhost:${PORT}/api/users/login`);
    console.log(`  - GET  http://localhost:${PORT}/api/users/profile`);
    console.log(`  - PUT  http://localhost:${PORT}/api/users/profile`);
    console.log('===========================================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[User Service Fatal] Unhandled Promise Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`[User Service Fatal] Uncaught Exception: ${err.message}`);
    process.exit(1);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n[User Service] ${signal} signal received. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[User Service] HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
