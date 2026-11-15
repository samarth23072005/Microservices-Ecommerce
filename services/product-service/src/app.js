const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const productRoutes = require('./routes/productRoutes');
const { getHealth } = require('./controllers/productController');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Security & Parsing Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Service Level Health Check
app.get('/health', getHealth);

// Mount Product REST API
app.use('/api/products', productRoutes);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
