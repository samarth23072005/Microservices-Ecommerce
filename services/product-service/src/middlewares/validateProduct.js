const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId in request parameters
 */
const validateProductIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid product ID format: '${id}'. Must be a 24-character hex string.`
    });
  }
  next();
};

/**
 * Validate product creation body
 */
const validateCreateProduct = (req, res, next) => {
  const { name, description, price, category, stock, imageUrl } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Description is required and must be a non-empty string');
  }

  if (price === undefined || price === null || isNaN(price) || Number(price) < 0) {
    errors.push('Price is required and must be a number greater than or equal to 0');
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (stock === undefined || stock === null || isNaN(stock) || Number(stock) < 0) {
    errors.push('Stock is required and must be a non-negative number');
  }

  if (imageUrl && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
    errors.push('Image URL must be a valid string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate product update body
 */
const validateUpdateProduct = (req, res, next) => {
  const { name, description, price, category, stock, imageUrl } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    errors.push('Name must be a non-empty string');
  }

  if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
    errors.push('Description must be a non-empty string');
  }

  if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
    errors.push('Price must be a number greater than or equal to 0');
  }

  if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
    errors.push('Category must be a non-empty string');
  }

  if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
    errors.push('Stock must be a non-negative number');
  }

  if (imageUrl !== undefined && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
    errors.push('Image URL must be a valid string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const ALLOWED_SORT_OPTIONS = [
  'price_asc',
  'price_desc',
  'newest',
  'oldest',
  'name_asc',
  'name_desc'
];

/**
 * Validate product listing query parameters (page, limit, sort, minPrice, maxPrice)
 */
const validateProductQueryParams = (req, res, next) => {
  const { page, limit, sort, minPrice, maxPrice } = req.query;
  const errors = [];

  // Validate page: must be a positive integer >= 1
  if (page !== undefined) {
    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      errors.push("Invalid 'page' parameter: must be a positive integer greater than or equal to 1.");
    }
  }

  // Validate limit: must be a positive integer between 1 and 100
  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push("Invalid 'limit' parameter: must be an integer between 1 and 100.");
    }
  }

  // Validate sort: must be an allowed sort option
  if (sort !== undefined) {
    const normalizedSort = sort.trim().toLowerCase();
    if (!ALLOWED_SORT_OPTIONS.includes(normalizedSort)) {
      errors.push(
        `Invalid 'sort' parameter '${sort}'. Allowed values are: ${ALLOWED_SORT_OPTIONS.join(', ')}.`
      );
    }
  }

  // Validate minPrice & maxPrice
  if (minPrice !== undefined) {
    const min = Number(minPrice);
    if (isNaN(min) || min < 0) {
      errors.push("Invalid 'minPrice' parameter: must be a non-negative number.");
    }
  }

  if (maxPrice !== undefined) {
    const max = Number(maxPrice);
    if (isNaN(max) || max < 0) {
      errors.push("Invalid 'maxPrice' parameter: must be a non-negative number.");
    }
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    if (Number(minPrice) > Number(maxPrice)) {
      errors.push("'minPrice' cannot be greater than 'maxPrice'.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate search endpoint requires 'q' query parameter
 */
const validateSearchQuery = (req, res, next) => {
  const query = req.query.q || req.query.query;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      success: false,
      message: "Search query parameter 'q' is required and cannot be empty."
    });
  }
  next();
};

module.exports = {
  ALLOWED_SORT_OPTIONS,
  validateProductIdParam,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQueryParams,
  validateSearchQuery
};
