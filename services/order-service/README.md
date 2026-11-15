# Order Microservice

Production-grade Order Management and Fulfillment microservice for the Microservices-Based E-Commerce Platform (`ShopKart`).

## Features
- **Order Placement**: Place orders with item validation, real-time pricing snapshot, and atomic stock reservation via Product Service.
- **Stock Reservation & Rollback**: Automatically triggers `/api/products/:id/deduct-stock` on checkout. If any item is out of stock or database persistence fails, all previously deducted items are rolled back via `/api/products/:id/release-stock`.
- **Order History & Retrieval**: Fetch user order history (`GET /api/orders`) and single order detail (`GET /api/orders/:id`).
- **Cancellation & Inventory Restoral**: Users or Admins can cancel active orders (`PATCH /api/orders/:id/cancel`), automatically releasing reserved stock back to the catalog.
- **Admin Status Updates**: Update fulfillment stages (`Pending`, `Confirmed`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`).
- **Security & RBAC**: JWT Bearer token authentication and role-based authorization.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (`order_db`) with Mongoose ODM
- **Security & Logging**: Helmet, CORS, Morgan, JSON Web Token (JWT)
- **HTTP Client**: Axios (for inter-service communication with Product Service)

## Port & Environment
- **Port**: `5003`
- **Database**: `mongodb://localhost:27017/order_db`
- **Product Service URL**: `http://localhost:5002`

### Environment Variables (.env)
```env
PORT=5003
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/order_db
JWT_SECRET=ecommerce_secret_key_2026
PRODUCT_SERVICE_URL=http://localhost:5002
ALLOWED_ORIGIN=http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Microservice health check |
| `POST` | `/api/orders` | Authenticated | Place a new order (validates stock, deducts stock, persists order) |
| `GET` | `/api/orders` | Authenticated | Retrieve authenticated user's order history |
| `GET` | `/api/orders/:id` | Authenticated | Get detailed order by ID (Owner or Admin) |
| `PATCH` | `/api/orders/:id/cancel` | Authenticated | Cancel order & release stock back to catalog |
| `PUT` | `/api/orders/:id/status` | Admin | Update order fulfillment status |
