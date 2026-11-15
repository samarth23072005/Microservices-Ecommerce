# Microservices-Based E-Commerce Application (`ShopKart`)

[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![NodeJS](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Multi--Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A production-grade, distributed microservices e-commerce platform built with Node.js, Express, React, TypeScript, and MongoDB, orchestrated with Docker and Docker Compose.

---

## 1. System Architecture

```
                    +-----------------------------+
                    |       React Frontend        |
                    |    (Port 5173 / Nginx)      |
                    +-----------------------------+
                                   |
                                   | HTTP (Browser requests)
                                   v
                    +-----------------------------+
                    |         API Gateway         |
                    |      (Port 4000 / Proxy)    |
                    +-----------------------------+
                      |            |            |
          +-----------+            |            +-----------+
          |                        |                        |
          v                        v                        v
+-------------------+    +-------------------+    +-------------------+
|   User Service    |    |  Product Service  |    |   Order Service   |
|    (Port 5001)    |    |    (Port 5002)    |    |    (Port 5003)    |
+-------------------+    +-------------------+    +-------------------+
          |                        |             |          |
          |                        |   Inter-service HTTP   |
          |                        +<------------+          |
          v                        v                        v
+-------------------+    +-------------------+    +-------------------+
|  MongoDB: user_db |    |MongoDB: product_db|    | MongoDB: order_db |
+-------------------+    +-------------------+    +-------------------+
```

### Component & Port Allocation Matrix

| Component | Container Name | Host Port | Internal Port | Target Database / Downstream | Health Probe |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Frontend** | `ecommerce-frontend` | `5173` | `80` | Reverse-proxied via Nginx; calls API Gateway (`:4000`) | `GET http://localhost/` |
| **API Gateway** | `ecommerce-api-gateway` | `4000` | `4000` | Routes to `user-service`, `product-service`, `order-service` | `GET http://localhost:4000/health` |
| **User Service** | `ecommerce-user-service` | `5001` | `5001` | `user_db` (`mongodb://mongodb:27017/user_db`) | `GET http://localhost:5001/health` |
| **Product Service** | `ecommerce-product-service` | `5002` | `5002` | `product_db` (`mongodb://mongodb:27017/product_db`) | `GET http://localhost:5002/health` |
| **Order Service** | `ecommerce-order-service` | `5003` | `5003` | `order_db` (`mongodb://mongodb:27017/order_db`) + Product Service | `GET http://localhost:5003/health` |
| **MongoDB** | `ecommerce-mongodb` | `27017` | `27017` | Persistent volume `mongodb_data` | `mongosh ping` |

---

## 2. Docker & Containerization

### Docker Hub Repository Images

| Component | Docker Hub Repository | Image Tag |
| :--- | :--- | :--- |
| Frontend | `samarth23072005/ecommerce-frontend` | `latest` |
| API Gateway | `samarth23072005/ecommerce-api-gateway` | `latest` |
| User Service | `samarth23072005/ecommerce-user-service` | `latest` |
| Product Service | `samarth23072005/ecommerce-product-service` | `latest` |
| Order Service | `samarth23072005/ecommerce-order-service` | `latest` |

---

## 3. Quick Start with Docker Compose

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Validate Configuration
```cmd
docker compose config
```

### 2. Build All Application Images
```cmd
docker compose build
```

### 3. Start the Platform in Background
```cmd
docker compose up -d
```

### 4. Verify Container Health
```cmd
docker compose ps
```
All containers should display status `Up (healthy)`.

### 5. Inspect Service Logs
```cmd
docker compose logs -f
```

### 6. Seed Product Catalog (Optional)
To populate 100 realistic e-commerce products into `product_db`:
```cmd
docker compose exec product-service npm run seed
```

### 7. Stop the Containers
```cmd
# Stop containers while preserving database volume
docker compose down

# Stop containers and wipe volumes (complete fresh start)
docker compose down -v
```

---

## 4. End-to-End Testing Verification

Once containers are running (`docker compose up -d`):

1. **Frontend**: Open `http://localhost:5173` in your browser. Verify the homepage loads products and categories from the API Gateway.
2. **User Registration & Login**:
   - Register a new customer via the frontend or `POST http://localhost:4000/api/users/register`.
   - Log in via `POST http://localhost:4000/api/users/login` and verify JWT token issuance.
3. **Product Catalog & Search**:
   - `GET http://localhost:4000/api/products`
   - `GET http://localhost:4000/api/products/categories`
   - `GET http://localhost:4000/api/products/search?q=phone`
4. **Order Placement & Stock Reservation**:
   - Add an item to cart and proceed to checkout on the frontend.
   - Or issue `POST http://localhost:4000/api/orders` with Bearer token.
   - Verify that Product Service stock automatically deducts by the ordered quantity.
   - Check order history at `GET http://localhost:4000/api/orders`.

---

## 5. Docker Hub Publishing

### Step 1: Log in to Docker Hub
```cmd
docker login
```
*(Enter your Docker Hub username `samarth23072005` and your Personal Access Token / password when prompted).*

### Step 2: Build All Images
```cmd
docker compose build
```

### Step 3: Push All Images to Docker Hub
Push all 5 images using the provided script or manual commands:

#### Using PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\push-images.ps1
```

#### Using Bash:
```bash
./scripts/push-images.sh
```

#### Manual Commands:
```cmd
docker push samarth23072005/ecommerce-frontend:latest
docker push samarth23072005/ecommerce-api-gateway:latest
docker push samarth23072005/ecommerce-user-service:latest
docker push samarth23072005/ecommerce-product-service:latest
docker push samarth23072005/ecommerce-order-service:latest
```
*(Note: MongoDB is an official third-party database image and is never pushed to personal repositories).*
