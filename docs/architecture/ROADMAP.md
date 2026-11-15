# Microservices E-Commerce Development Roadmap

This roadmap provides a phased, step-by-step engineering plan. In alignment with microservice best practices, **each microservice is built, verified, and tested independently** before moving to the next.

---

## Roadmap Phases

```
+--------------------------------------------------------------------------+
| Phase 1: Architecture, Scaffolding & Specifications      [ COMPLETED ]   |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 2: Product Service (Port 5002)                     [ NEXT UP ]     |
| - Express Server & Mongo product_db connection                           |
| - Category & Product Models (Mongoose)                                   |
| - CRUD Endpoints, Full-Text Search, Category Filter                      |
| - Stock Deduction & Reservation APIs with Low-Stock Alerts              |
| - Seed initial catalog data & Postman/cURL test validation               |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 3: User Service (Port 5001)                                        |
| - Express Server & Mongo user_db connection                              |
| - User Model with bcrypt hashing & JWT token generation                  |
| - Register, Login, Profile & RBAC Middleware                             |
| - Seed Admin & Customer accounts & Test Auth Lifecycle                   |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 4: Order Service (Port 5003)                                       |
| - Express Server & Mongo order_db connection                             |
| - Shopping Cart CRUD & Persistence                                       |
| - Order Placement with Synchronous Stock Check (Product Service)         |
| - Order Status Machine & Cancellation with Stock Restoral                |
| - Order History & Order Lookup Endpoints                                 |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 5: API Gateway (Port 5000)                                         |
| - Express Reverse Proxy routing to User, Product, Order Services         |
| - Centralized JWT Authentication Verification Middleware                 |
| - CORS, Rate-Limiting, Logging & Centralized Error Handler               |
| - Health Check Aggregator Endpoint (/health)                             |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 6: Modern React Frontend (Port 3000)                               |
| - Amazon-style clean, modern responsive layout                           |
| - Header with Category navigation, Live Search & Cart Badge              |
| - Product Grid, Product Details & Image Showcase                         |
| - Cart Management & Multi-step Checkout                                  |
| - User Account Dashboard & Order History with Status Badges              |
| - Admin Dashboard for Product Management & Order Tracking                |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 7: Docker, Kubernetes & GitHub Actions CI/CD                       |
| - Production Multi-Stage Dockerfiles for all 5 components                |
| - docker-compose.yml orchestrating 3 Mongo DBs, 3 Services, Gateway, UI  |
| - Kubernetes Manifests: Deployments, Services, ConfigMaps, Secrets       |
| - Kubernetes Ingress Controller routing                                  |
| - GitHub Actions CI/CD Workflow for automated linting, tests & builds    |
+--------------------------------------------------------------------------+
```

---

## Detailed Acceptance & Verification Criteria

### Phase 2: Product Service Acceptance
- [ ] Server initializes on port `5002` and connects to `mongodb://localhost:27017/product_db`.
- [ ] `POST /api/v1/products`: Validates input and creates new product with unique SKU.
- [ ] `GET /api/v1/products`: Supports search query `?q=`, category filter `?category=`, and pagination `?page=&limit=`.
- [ ] `GET /api/v1/products/:id`: Returns single product or 404 if not found.
- [ ] `PATCH /api/v1/products/:id/stock`: Atomically adjusts stock and warns if below `lowStockThreshold`.
- [ ] `POST /api/v1/products/:id/deduct-stock`: Atomically reserves stock during checkout.
- [ ] Automated seed script (`npm run seed`) populates realistic e-commerce products (electronics, apparel, home, books).

### Phase 3: User Service Acceptance
- [ ] Server initializes on port `5001` and connects to `mongodb://localhost:27017/user_db`.
- [ ] `POST /api/v1/auth/register`: Validates email, hashes password with `bcryptjs`, saves user, returns JWT.
- [ ] `POST /api/v1/auth/login`: Authenticates valid credentials, returns JWT token with claims (`userId`, `email`, `role`).
- [ ] `GET /api/v1/users/profile`: Protected route returning authenticated user profile.
- [ ] Role-Based Access Control verified: Admin-only routes return 403 Forbidden for customer tokens.

### Phase 4: Order Service Acceptance
- [ ] Server initializes on port `5003` and connects to `mongodb://localhost:27017/order_db`.
- [ ] `GET /api/v1/cart` & `POST /api/v1/cart`: Manages cart items for authenticated user.
- [ ] `POST /api/v1/orders`: Validates cart items, verifies and reserves stock via Product Service HTTP API, creates order, clears user cart.
- [ ] `GET /api/v1/orders/my-orders`: Returns customer's past orders sorted by date.
- [ ] `PATCH /api/v1/orders/:id/cancel`: Cancels order and calls Product Service to release reserved inventory.

### Phase 5: API Gateway Acceptance
- [ ] Runs on port `5000` as the external edge router.
- [ ] Routes incoming traffic correctly to downstream services.
- [ ] Verifies JWT headers on protected routes and injects `x-user-id` and `x-user-role`.
- [ ] Emits standardized error JSON responses when downstream services fail.
- [ ] Passes health checks (`GET /health`) checking connectivity across all microservices.
