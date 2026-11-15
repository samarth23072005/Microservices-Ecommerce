const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet());

// 2. CORS Configuration
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Thunder Client)
      if (!origin) return callback(null, true);

      if (
        allowedOrigin === '*' ||
        origin === allowedOrigin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-gateway-proxy']
  })
);

// 3. Request Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'user-service',
    port: parseInt(process.env.PORT, 10) || 5001,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Also support /api/users/health for convenience through gateway
app.get('/api/users/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'user-service',
    port: parseInt(process.env.PORT, 10) || 5001,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 6. Mount Microservice Routes
app.use('/api/users', authRoutes);
app.use('/api/users', userRoutes);

// 7. 404 Not Found Handler
app.use(notFoundHandler);

// 8. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
