#!/usr/bin/env bash
set -e

TAG="${1:-latest}"

IMAGES=(
  "samarth23072005/ecommerce-frontend"
  "samarth23072005/ecommerce-api-gateway"
  "samarth23072005/ecommerce-user-service"
  "samarth23072005/ecommerce-product-service"
  "samarth23072005/ecommerce-order-service"
)

echo "============================================================"
echo "  Pushing Microservices Images to Docker Hub (Tag: ${TAG})"
echo "============================================================"

for img in "${IMAGES[@]}"; do
  full_image="${img}:${TAG}"
  echo ""
  echo "[Docker Hub] Pushing ${full_image} ..."
  docker push "${full_image}"
  echo "[Docker Hub] Successfully pushed ${full_image}"
done

echo ""
echo "============================================================"
echo "  All 5 microservice images successfully pushed to Docker Hub!"
echo "============================================================"
