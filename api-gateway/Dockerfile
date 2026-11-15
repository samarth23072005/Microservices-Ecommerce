# API Gateway Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Expose gateway port
EXPOSE 4000

# Environment defaults
ENV PORT=4000 \
    NODE_ENV=production

# Run as non-root user for security
USER node

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "src/server.js"]
