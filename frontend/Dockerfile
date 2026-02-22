# Frontend Dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install a simple HTTP server to serve static files
RUN npm install -g http-server

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy public folder if needed
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost:5173 || exit 1

# Start HTTP server
CMD ["http-server", "dist", "-p", "5173", "--cors", "--gzip"]
