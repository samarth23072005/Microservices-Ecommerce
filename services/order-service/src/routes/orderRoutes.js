const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus
} = require('../controllers/orderController');

const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/orders
 * @desc    Create a new order (with stock deduction & rollback)
 * @access  Private
 *
 * @route   GET /api/orders
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
router
  .route('/')
  .post(protect, createOrder)
  .get(protect, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID (Owner or Admin)
 * @access  Private
 */
router.route('/:id').get(protect, getOrderById);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order and release reserved stock back to catalog
 * @access  Private (Owner or Admin)
 */
router.route('/:id/cancel').patch(protect, cancelOrder).put(protect, cancelOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order fulfillment status
 * @access  Private (Admin only)
 */
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus);

module.exports = router;
