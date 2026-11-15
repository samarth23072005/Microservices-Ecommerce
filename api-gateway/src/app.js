const express = require('express');
const cors = require('cors');
const config = require('./config/services');
const requestLogger = require('./middlewares/logger');
const proxyRoutes = require('./routes/proxyRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Disable x-powered-by header for security
app.disable('x-powered-by');

// 1. CORS Configuration for React Frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Thunder Client, curl)
      if (!origin) return callback(null, true);

      const isAllowed =
        config.cors.allowedOrigins.includes('*') ||
        config.cors.allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'x-gateway-proxy'
    ]
  })
);

// 2. Request Logging Middleware
app.use(requestLogger);

// 3. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    port: config.port,
    environment: config.nodeEnv,
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
    routes: {
      products: {
        path: '/api/products/*',
        target: config.services.products.target,
        status: 'Configured'
      },
      users: {
        path: '/api/users/*',
        target: config.services.users.target,
        status: 'Configured'
      },
      orders: {
        path: '/api/orders/*',
        target: config.services.orders.target,
        status: 'Configured'
      }
    }
  });
});

// 4. Reverse Proxy Routes (Preserves raw streams and query parameters)
app.use(proxyRoutes);

// 5. 404 Not Found Handler for Unmatched Routes
app.use(notFoundHandler);

// 6. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
