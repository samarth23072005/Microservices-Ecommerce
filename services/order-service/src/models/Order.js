const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price must be non-negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  },
  { _id: false }
);

const OrderAddressSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    line1: { type: String, default: '', trim: true },
    street: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    pincode: { type: String, default: '', trim: true },
    zipCode: { type: String, default: '', trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    userEmail: {
      type: String,
      default: '',
      trim: true
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item.'
      }
    },
    total: {
      type: Number,
      required: [true, 'Order total is required'],
      min: [0, 'Total cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'confirmed',
          'shipped',
          'delivered',
          'cancelled',
          'Pending',
          'Confirmed',
          'Shipped',
          'Delivered',
          'Cancelled',
          'Out for Delivery'
        ],
        message: '{VALUE} is not a valid order status'
      },
      default: 'confirmed'
    },
    address: {
      type: OrderAddressSchema,
      required: [true, 'Shipping address is required']
    },
    paymentMethod: {
      type: String,
      default: 'Credit Card',
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for totalAmount (alias for total)
OrderSchema.virtual('totalAmount').get(function () {
  return this.total;
});

// Indexes for query performance
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', OrderSchema);
