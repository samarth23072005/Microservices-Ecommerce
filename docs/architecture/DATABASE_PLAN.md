# Database Configuration & Schema Plan

## 1. Database-Per-Service Architecture

In accordance with microservice design patterns, the application strictly adheres to the **Database-per-Service** pattern. Combining databases into a single monolithic schema creates tight coupling, undermines independent scalability, and introduces single-point schema migration bottlenecks.

### Database Allocation Matrix:

| Service | Target Database | Connection String Variable | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **User Service** | `user_db` | `MONGO_URI=mongodb://localhost:27017/user_db` | Identity, authentication credentials, customer profiles |
| **Product Service** | `product_db` | `MONGO_URI=mongodb://localhost:27017/product_db` | Catalog items, categories, tags, stock inventories |
| **Order Service** | `order_db` | `MONGO_URI=mongodb://localhost:27017/order_db` | Persistent shopping carts, finalized orders, order items |

---

## 2. Service Schemas & Data Models

### 2.1. User Service (`user_db`)

#### Collection: `users`
```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Excluded by default in queries
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  phone: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
```

---

### 2.2. Product Service (`product_db`)

#### Collection: `categories`
```javascript
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

CategorySchema.index({ slug: 1 }, { unique: true });
```

#### Collection: `products`
```javascript
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
  },
  rating: {
    average: { type: Number, default: 4.5, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound and text indexes for search & filtering
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ stockQuantity: 1 });
```

---

### 2.3. Order Service (`order_db`)

#### Collection: `carts`
```javascript
const CartItemSchema = new mongoose.Schema({
  productId: {
    type: String, // Stringified ObjectId from Product Service
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  imageUrl: {
    type: String
  }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  userId: {
    type: String, // Stringified ObjectId from User Service
    required: true,
    unique: true,
    index: true
  },
  items: [CartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

CartSchema.index({ userId: 1 }, { unique: true });
```

#### Collection: `orders`
```javascript
const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  imageUrl: {
    type: String
  },
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String, // Stringified ObjectId from User Service
    required: true,
    index: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  items: {
    type: [OrderItemSchema],
    validate: [val => val.length > 0, 'An order must contain at least one item']
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'PAYPAL', 'CASH_ON_DELIVERY'],
    default: 'CREDIT_CARD'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED'
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'CONFIRMED'
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
```

---

## 3. Data Integrity & Consistency Strategy

1. **Denormalization for Order Immutability**:
   Notice that `orders.items` records `title`, `unitPrice`, and `subtotal` frozen at the exact time of checkout. If the product price changes in `product_db` later, the historical order retains its historical transaction cost.
2. **Synchronous Stock Reservation**:
   When an order is submitted:
   - Order Service issues an atomic deduction request to Product Service (`POST /api/v1/products/:id/deduct-stock`).
   - If stock is insufficient, the checkout aborts with HTTP 400 (`Insufficient Stock`).
   - If an order is subsequently cancelled, Order Service calls (`POST /api/v1/products/:id/release-stock`) to restore inventory.
