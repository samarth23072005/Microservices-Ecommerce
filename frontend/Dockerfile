# Multi-stage Dockerfile for React + Vite Frontend
# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies required for vite build)
COPY package*.json ./
RUN npm install

# Build argument for API Gateway URL (defaults to http://localhost:4000)
ARG VITE_API_GATEWAY_URL=http://localhost:4000
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve production assets with Nginx
FROM nginx:alpine

# Copy built static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web port
EXPOSE 80

# Health check probe
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
