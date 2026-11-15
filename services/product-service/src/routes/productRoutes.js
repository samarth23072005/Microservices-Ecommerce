const express = require('express');
const router = express.Router();
const {
  getHealth,
  createProduct,
  getAllProducts,
  getProductById,
  getCategories,
  searchProducts,
  updateProduct,
  deleteProduct,
  deductStock,
  releaseStock
} = require('../controllers/productController');

const {
  validateProductIdParam,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQueryParams,
  validateSearchQuery
} = require('../middlewares/validateProduct');

// Health Check
router.get('/health', getHealth);
// Categories
router.get('/categories', getCategories);

// Search endpoint (MUST precede /:id parameter to avoid collision)
router.get('/search', validateSearchQuery, validateProductQueryParams, searchProducts);

// Collection routes
router.route('/')
  .get(validateProductQueryParams, getAllProducts)
  .post(validateCreateProduct, createProduct);

// Specific product entity routes
router.route('/:id')
  .get(validateProductIdParam, getProductById)
  .put(validateProductIdParam, validateUpdateProduct, updateProduct)
  .delete(validateProductIdParam, deleteProduct);

// Internal microservice communication: Atomic stock operations
router.post('/:id/deduct-stock', validateProductIdParam, deductStock);
router.post('/:id/release-stock', validateProductIdParam, releaseStock);

module.exports = router;
