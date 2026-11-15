# API Gateway Microservice

A high-performance, resilient API Gateway built with **Node.js**, **Express**, and **http-proxy-middleware**. It serves as the single unified entry point for all frontend client traffic, handling route dispatching, CORS negotiation, request logging, and downstream fault tolerance.

---

## 1. Network & Routing Architecture

```
                    +---------------------------+
                    |   React / Client App      |
                    |   (Port 3000 / Vite 5173) |
                    +-------------+-------------+
                                  |
                                  v HTTP
                    +---------------------------+
                    |        API Gateway        |
                    |        (Port 4000)        |
                    +-------------+-------------+
                                  |
         +------------------------+------------------------+
         |                        |                        |
         v HTTP                   v HTTP                   v HTTP
+------------------+     +------------------+     +------------------+
| Product Service  |     |   User Service   |     |  Order Service   |
|   (Port 5002)    |     |   (Port 5001)    |     |   (Port 5003)    |
|   [ONLINE]       |     |   [PLANNED]      |     |   [PLANNED]      |
+------------------+     +------------------+     +------------------+
```

### Route Mapping Table

| Client Request Path | Forwarded To | Downstream Port | Target Path | Status |
| :--- | :--- | :---: | :--- | :--- |
| `GET /health` | API Gateway | `4000` | Local `/health` | **Active** |
| `/api/products/*` | Product Service | `5002` | `/api/products/*` | **Active** |
| `/api/users/*` | User Service | `5001` | `/api/users/*` | **Ready (Fails gracefully with 503 until started)** |
| `/api/orders/*` | Order Service | `5003` | `/api/orders/*` | **Ready (Fails gracefully with 503 until started)** |

---

## 2. Key Features

- **Transparent Route & Query Forwarding**: Forwards the exact original path, query strings (e.g., `?q=phone&category=smartphones&sort=price_asc&page=1&limit=10`), HTTP verbs, and headers.
- **Resilient Fault Handling**: If a downstream service is down or not yet implemented (such as User or Order service), the gateway does **not** crash or hang. It returns a clean `503 Service Unavailable` JSON response.
- **Streaming & Body Safety**: Utilizes `fixRequestBody` to ensure `POST`, `PUT`, and `PATCH` JSON bodies are never consumed or truncated in transit.
- **CORS Protection**: Pre-configured for React / Vite frontends running on `http://localhost:3000`, `http://127.0.0.1:3000`, and `http://localhost:5173`.
- **Informative Request Logging**: Color-coded terminal logs displaying request method, target path, status code, and latency in milliseconds.

---

## 3. Environment Configuration

The gateway uses `dotenv`. Settings are defined in [`.env.example`](./.env.example) and `.env`:

```env
# Gateway Port
PORT=4000
NODE_ENV=development

# CORS Configuration for React + Vite Frontend
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000

# Downstream Microservices
PRODUCT_SERVICE_URL=http://localhost:5002
USER_SERVICE_URL=http://localhost:5001
ORDER_SERVICE_URL=http://localhost:5003
```

---

## 4. Installation & Startup Commands

### Step 1: Open Terminal in the API Gateway Directory
```bash
cd D:\study\Microservices-Ecommerce\api-gateway
```

### Step 2: Install Dependencies (If not already installed)
```bash
npm install
```

### Step 3: Start the Gateway

**Development Mode (Auto-reload with nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

---

## 5. Thunder Client / cURL Testing Guide

Ensure the **Product Service** is running on port `5002` (`cd ../services/product-service && npm run dev`), then start the **API Gateway** on port `4000`.

### Test 1: Gateway Health Check
- **Method:** `GET`
- **URL:** `http://localhost:4000/health`
- **Expected Status:** `200 OK`
- **Expected Response:**
```json
{
  "status": "UP",
  "service": "api-gateway",
  "port": 4000,
  "environment": "development",
  "uptime": "12.45s",
  "timestamp": "2026-11-15T06:30:00.000Z",
  "routes": {
    "products": { "path": "/api/products/*", "target": "http://localhost:5002", "status": "Configured" },
    "users": { "path": "/api/users/*", "target": "http://localhost:5001", "status": "Configured" },
    "orders": { "path": "/api/orders/*", "target": "http://localhost:5003", "status": "Configured" }
  }
}
```

---

### Test 2: Forwarding to Product Service (Listing & Pagination)
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/products?page=1&limit=5`
- **Expected Status:** `200 OK`
- **Expected Headers:** `x-proxied-by: api-gateway`, `x-service-name: Product Service`
- **Expected Response:** First 5 products with full pagination metadata from Product Service.

---

### Test 3: Product Search & Combined Filtering
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/products/search?q=phone&sort=price_asc&limit=3`
- **Expected Status:** `200 OK`
- **Expected Response:** Products matching "phone", sorted by price ascending, forwarded directly through the gateway.

---

### Test 4: Single Product by ID
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/products/<product_id>`
- **Expected Status:** `200 OK`

---

### Test 5: Create Product (POST with Body)
- **Method:** `POST`
- **URL:** `http://localhost:4000/api/products`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "name": "Gateway Test Headphones",
  "description": "Tested through API Gateway reverse proxy",
  "price": 149.99,
  "category": "audio",
  "stock": 20,
  "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
}
```
- **Expected Status:** `201 Created`

---

### Test 6: Fault Tolerance (Target Service Down)
Make a request to a service that is not yet running (e.g., User Service or Order Service):
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/users/profile`
- **Expected Status:** `503 Service Unavailable`
- **Expected Response:**
```json
{
  "success": false,
  "error": "Service Unavailable",
  "message": "User Service is currently offline or unreachable at http://localhost:5001.",
  "service": "User Service",
  "target": "http://localhost:5001",
  "path": "/api/users/profile",
  "statusCode": 503,
  "timestamp": "2026-11-15T06:30:00.000Z"
}
```

---

### Test 7: Unmatched / Invalid Route
- **Method:** `GET`
- **URL:** `http://localhost:4000/api/unknown-service`
- **Expected Status:** `404 Not Found`
- **Expected Response:**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Route '/api/unknown-service' does not exist on API Gateway.",
  "availableRoutes": [
    "GET /health",
    "ANY /api/products/*",
    "ANY /api/users/*",
    "ANY /api/orders/*"
  ]
}
```
