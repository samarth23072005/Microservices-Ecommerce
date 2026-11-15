require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = parseInt(process.env.PORT, 10) || 5003;

// 1. Connect to MongoDB (order_db) before listening
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('===========================================================');
    console.log(`[Order Service] Running successfully on port: ${PORT}`);
    console.log(`[Order Service] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Order Service] Database: order_db`);
    console.log(`[Order Service] Health Check: http://localhost:${PORT}/health`);
    console.log(`[Order Service] Downstream Product Service: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002'}`);
    console.log(`[Order Service] Endpoints:`);
    console.log(`  - POST  http://localhost:${PORT}/api/orders (Create order)`);
    console.log(`  - GET   http://localhost:${PORT}/api/orders (List user orders)`);
    console.log(`  - GET   http://localhost:${PORT}/api/orders/:id (Order detail)`);
    console.log(`  - PATCH http://localhost:${PORT}/api/orders/:id/cancel (Cancel order)`);
    console.log(`  - PUT   http://localhost:${PORT}/api/orders/:id/status (Admin status update)`);
    console.log('===========================================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Order Service Fatal] Unhandled Promise Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error(`[Order Service Fatal] Uncaught Exception: ${err.message}`);
    process.exit(1);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n[Order Service] ${signal} signal received. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[Order Service] HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
