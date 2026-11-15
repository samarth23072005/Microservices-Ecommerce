const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const config = require('../config/services');

const router = express.Router();

/**
 * Creates a configured reverse proxy middleware for a downstream microservice
 * @param {Object} service - Service configuration object (name, target, routePrefix)
 * @returns {Function} Express middleware function
 */
const createServiceProxy = (service) => {
  return createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    ws: false,
    pathFilter: service.routePrefix,
    timeout: 10000,       // 10s socket timeout
    proxyTimeout: 10000,  // 10s proxy response timeout
    on: {
      /**
       * Before request is sent to target microservice
       */
      proxyReq: (proxyReq, req, res) => {
        console.log(
          `[Proxy] Routing ${req.method} ${req.originalUrl} -> ${service.target}${req.url}`
        );

        // Forward client identification headers
        proxyReq.setHeader('x-forwarded-host', req.headers.host || '');
        proxyReq.setHeader('x-gateway-proxy', 'api-gateway');

        // Re-stream body if parsed by body-parser / express.json
        if (req.body && Object.keys(req.body).length > 0) {
          fixRequestBody(proxyReq, req);
        }
      },

      /**
       * On response received from target microservice
       */
      proxyRes: (proxyRes, req, res) => {
        res.setHeader('x-proxied-by', 'api-gateway');
        res.setHeader('x-service-name', service.name);
      },

      /**
       * Resilient error handling when downstream service is down / unreachable
       */
      error: (err, req, res) => {
        console.error(
          `[Proxy Error] Unable to connect to ${service.name} at ${service.target}: ${err.message}`
        );

        if (res.headersSent) {
          return;
        }

        res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: `${service.name} is currently offline or unreachable at ${service.target}.`,
          service: service.name,
          target: service.target,
          path: req.originalUrl,
          statusCode: 503,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
};

// 1. Product Service (Port 5002) - /api/products/*
router.use(createServiceProxy(config.services.products));

// 2. User Service (Port 5001) - /api/users/*
router.use(createServiceProxy(config.services.users));

// 3. Order Service (Port 5003) - /api/orders/*
router.use(createServiceProxy(config.services.orders));

module.exports = router;
