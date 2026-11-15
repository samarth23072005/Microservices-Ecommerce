const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * @desc    Get service health and database connection status
 * @route   GET /health or GET /api/products/health
 * @access  Public
 */
const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    service: 'product-service',
    timestamp: new Date().toISOString(),
    database: {
      status: states[dbState] || 'Unknown',
      connected: isHealthy,
      name: mongoose.connection.name || 'product_db'
    },
    uptime: process.uptime()
  });
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Public (or Admin protected in Gateway)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim().toLowerCase(),
      stock: Number(stock),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to escape special regex characters for safe MongoDB queries
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Helper to parse sort parameters into MongoDB sort specification
 */
const parseSort = (sort, sortBy, order) => {
  if (sort) {
    switch (sort.trim().toLowerCase()) {
      case 'price_asc':
        return { price: 1 };
      case 'price_desc':
        return { price: -1 };
      case 'newest':
        return { createdAt: -1 };
      case 'oldest':
        return { createdAt: 1 };
      case 'name_asc':
        return { name: 1 };
      case 'name_desc':
        return { name: -1 };
      default:
        return { createdAt: -1 };
    }
  }

  // Legacy fallback: sortBy & order
  if (sortBy) {
    const sortOrder = order === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder };
  }

  // Default sort: newest first
  return { createdAt: -1 };
};

/**
 * Helper to construct MongoDB filter with category, price range, stock, and search keyword
 */
const buildProductFilter = (queryParams, explicitSearchTerm) => {
  const { category, minPrice, maxPrice, inStock, q, query } = queryParams;
  const filter = {};

  const searchTerm = explicitSearchTerm || q || query;
  if (searchTerm && searchTerm.trim()) {
    const searchRegex = new RegExp(escapeRegex(searchTerm.trim()), 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];
  }

  // Case-insensitive exact category matching
  if (category && category.trim()) {
    filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
  }

  // Price range filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  // In-stock availability filter
  if (inStock === 'true') {
    filter.stock = { $gt: 0 };
  }

  return filter;
};

/**
 * @desc    Get all products with optional pagination, category filtering, and price sorting
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, sort, sortBy, order } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10; // Default limit = 10
    const skip = (pageNum - 1) * limitNum;

    const filter = buildProductFilter(req.query);
    const sortObj = parseSort(sort, sortBy, order);

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum) || (totalProducts === 0 ? 0 : 1);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      hasNextPage,
      hasPrevPage,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: pageNum,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
        total: totalProducts,
        page: pageNum,
        pages: totalPages
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc Get all unique product categories
 * @route GET /api/products/categories
 * @access Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Search products by keyword across name and description (case-insensitive)
 * @route   GET /api/products/search?q=...
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    const searchTerm = query.trim();

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required and cannot be empty.'
      });
    }

    const { page, limit, sort, sortBy, order } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter = buildProductFilter(req.query, searchTerm);
    const sortObj = parseSort(sort, sortBy, order);

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum) || (totalProducts === 0 ? 0 : 1);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      searchTerm,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      hasNextPage,
      hasPrevPage,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: pageNum,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
        total: totalProducts,
        page: pageNum,
        pages: totalPages
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Public (or Admin protected in Gateway)
 */
const updateProduct = async (req, res, next) => {
  try {
    const updateData = {};
    const { name, description, price, category, stock, imageUrl } = req.body;

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category.trim().toLowerCase();
    if (stock !== undefined) updateData.stock = Number(stock);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Public (or Admin protected in Gateway)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' (ID: ${product._id}) deleted successfully`,
      data: { id: product._id }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deduct product stock (Internal API used by Order Service during checkout)
 * @route   POST /api/products/:id/deduct-stock
 * @access  Internal
 */
const deductStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive quantity must be specified'
      });
    }

    // Atomic conditional decrement to prevent race conditions & negative stock
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!product) {
      // Check whether product doesn't exist or just insufficient stock
      const existing = await Product.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Product with ID '${req.params.id}' not found`
        });
      }

      return res.status(400).json({
        success: false,
        message: `Insufficient stock for '${existing.name}'. Requested: ${qty}, Available: ${existing.stock}`,
        availableStock: existing.stock
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deducted ${qty} units from product stock`,
      data: {
        productId: product._id,
        name: product.name,
        remainingStock: product.stock
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Release / Restock product stock (Internal API used upon order cancellation)
 * @route   POST /api/products/:id/release-stock
 * @access  Internal
 */
const releaseStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive quantity must be specified'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: qty } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully restored ${qty} units to product stock`,
      data: {
        productId: product._id,
        name: product.name,
        currentStock: product.stock
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  getCategories,
  createProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
  deleteProduct,
  deductStock,
  releaseStock
};
