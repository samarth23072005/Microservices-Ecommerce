require('dotenv').config();

const parseAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }
  return [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
};

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    allowedOrigins: parseAllowedOrigins()
  },
  services: {
    products: {
      name: 'Product Service',
      target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
      routePrefix: '/api/products'
    },
    users: {
      name: 'User Service',
      target: process.env.USER_SERVICE_URL || 'http://localhost:5001',
      routePrefix: '/api/users'
    },
    orders: {
      name: 'Order Service',
      target: process.env.ORDER_SERVICE_URL || 'http://localhost:5003',
      routePrefix: '/api/orders'
    }
  }
};
