# Product Service Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose service port
EXPOSE 5002

# Set production environment
ENV PORT=5002 \
    NODE_ENV=production

# Security: run as non-root user
USER node

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5002/health || exit 1

CMD ["node", "src/server.js"]
