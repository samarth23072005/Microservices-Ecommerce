# User Service Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Expose microservice port
EXPOSE 5001

# Environment defaults
ENV PORT=5001 \
    NODE_ENV=production

# Run as non-root user for security
USER node

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5001/health || exit 1

CMD ["node", "src/server.js"]
