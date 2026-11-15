const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('../models/Order');

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';

/**
 * Helper to release previously deducted stock during rollback or order cancellation
 * @param {Array} items - List of items with productId and quantity
 */
const releaseProductStock = async (items) => {
  for (const item of items) {
    try {
      await axios.post(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/release-stock`,
        { quantity: item.quantity },
        { timeout: 5000 }
      );
      console.log(
        `[Order Service] Released ${item.quantity} units for product ${item.productId}`
      );
    } catch (err) {
      console.error(
        `[Order Service Warning] Failed to release stock for product ${item.productId}: ${err.message}`
      );
    }
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (JWT protected)
 */
const createOrder = async (req, res, next) => {
  const deductedItems = [];

  try {
    const { items, address, paymentMethod } = req.body;

    // 1. Validate request payload
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    if (!address || typeof address !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.'
      });
    }

    // Normalize address fields
    const normalizedAddress = {
      name: address.name || req.user.name || '',
      phone: address.phone || '',
      line1: address.line1 || address.street || '',
      street: address.street || address.line1 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || address.zipCode || '',
      zipCode: address.zipCode || address.pincode || '',
      country: address.country || 'India'
    };

    if (!normalizedAddress.line1 || !normalizedAddress.city || !normalizedAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address must include street/line1, city, and pincode.'
      });
    }

    // 2. Fetch product details and check availability from Product Service
    const verifiedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity, 10);

      if (!productId || isNaN(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid productId and quantity >= 1.'
        });
      }

      // Fetch product info from Product Service
      let productResponse;
      try {
        productResponse = await axios.get(
          `${PRODUCT_SERVICE_URL}/api/products/${productId}`,
          { timeout: 7000 }
        );
      } catch (error) {
        if (error.response && error.response.status === 404) {
          return res.status(404).json({
            success: false,
            message: `Product with ID '${productId}' was not found in the catalog.`
          });
        }
        return res.status(503).json({
          success: false,
          message: `Product Service is currently unreachable at ${PRODUCT_SERVICE_URL}. Unable to verify product.`
        });
      }

      const product = productResponse.data?.data;
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID '${productId}' returned invalid data from catalog.`
        });
      }

      // Check stock availability
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${qty}.`
        });
      }

      // Calculate server-verified item price & total
      const unitPrice = Number(product.price);
      calculatedTotal += unitPrice * qty;

      const primaryImage =
        product.image ||
        product.imageUrl ||
        (Array.isArray(product.images) && product.images[0]) ||
        '';

      verifiedItems.push({
        productId,
        name: product.name,
        image: primaryImage,
        price: unitPrice,
        quantity: qty
      });
    }

    // 3. Atomically deduct stock from Product Service for each item
    for (const item of verifiedItems) {
      try {
        await axios.post(
          `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/deduct-stock`,
          { quantity: item.quantity },
          { timeout: 7000 }
        );
        deductedItems.push({ productId: item.productId, quantity: item.quantity });
      } catch (deductError) {
        console.error(
          `[Order Service] Stock deduction failed for product ${item.productId}: ${deductError.message}`
        );
        // Rollback any previously deducted items
        await releaseProductStock(deductedItems);

        const errMsg =
          deductError.response?.data?.message ||
          'Failed to reserve product stock. Please try again.';
        return res.status(400).json({
          success: false,
          message: errMsg
        });
      }
    }

    // 4. Persist order in MongoDB order_db
    let newOrder;
    try {
      newOrder = await Order.create({
        userId: req.user.id,
        userEmail: req.user.email || '',
        items: verifiedItems,
        total: Math.round(calculatedTotal * 100) / 100,
        status: 'Confirmed',
        address: normalizedAddress,
        paymentMethod: paymentMethod || 'Credit Card',
        paymentStatus: 'completed'
      });
    } catch (saveError) {
      console.error(
        `[Order Service] Database save failed: ${saveError.message}. Rolling back reserved stock...`
      );
      // Rollback deducted stock if MongoDB save fails
      await releaseProductStock(deductedItems);
      throw saveError;
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder,
      order: newOrder,
      _id: newOrder._id,
      id: newOrder._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders of the logged-in user
 * @route   GET /api/orders
 * @access  Private (JWT protected)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1
    });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private (JWT protected)
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order ID format: '${id}'`
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${id}' not found.`
      });
    }

    // Ensure user is authorized to view this order (own order or admin)
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this order.'
      });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order and restore product stock
 * @route   PATCH /api/orders/:id/cancel or PUT /api/orders/:id/cancel
 * @access  Private (Owner or Admin)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order ID format: '${id}'`
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${id}' not found.`
      });
    }

    // Ownership or admin check
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this order.'
      });
    }

    const currentStatus = order.status.toLowerCase();
    if (currentStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled.'
      });
    }

    if (currentStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Delivered orders cannot be cancelled.'
      });
    }

    // 1. Release reserved stock back to Product Service
    await releaseProductStock(order.items);

    // 2. Update order status
    order.status = 'Cancelled';
    order.paymentStatus = 'failed';
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock has been restored.',
      data: updatedOrder,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin protected or internal workflow)
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin only)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order ID format: '${id}'`
      });
    }

    const allowedStatuses = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'Out for Delivery'
    ];

    if (!status || !allowedStatuses.map((s) => s.toLowerCase()).includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${id}' not found.`
      });
    }

    const targetStatus = status.toLowerCase();
    const prevStatus = order.status.toLowerCase();

    // If changing to cancelled, release stock
    if (targetStatus === 'cancelled' && prevStatus !== 'cancelled') {
      await releaseProductStock(order.items);
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      data: updatedOrder,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus
};
