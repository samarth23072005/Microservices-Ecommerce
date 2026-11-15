# Docker Infrastructure

The root-level [docker-compose.yml](../../docker-compose.yml) orchestrates all application microservices, the API Gateway, the React frontend, and the MongoDB database.

## Quick Start
```bash
# From the project root:
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
```

## Docker Images
- `samarth23072005/ecommerce-frontend:latest`
- `samarth23072005/ecommerce-api-gateway:latest`
- `samarth23072005/ecommerce-user-service:latest`
- `samarth23072005/ecommerce-product-service:latest`
- `samarth23072005/ecommerce-order-service:latest`
