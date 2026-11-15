const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      lowercase: true
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    image: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    },
    sourceId: {
      type: String,
      sparse: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Keep image and imageUrl in sync
ProductSchema.pre('validate', function (next) {
  if (this.image && !this.imageUrl) {
    this.imageUrl = this.image;
  } else if (this.imageUrl && !this.image) {
    this.image = this.imageUrl;
  }
  next();
});

// Full-text search index across name, description, and category
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
// Index for fast category lookups and price sorting
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
