FROM node:20-alpine

WORKDIR /app

# Copy root workspace package definitions
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY services/api-gateway/package*.json ./services/api-gateway/
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/product-service/package*.json ./services/product-service/
COPY services/order-service/package*.json ./services/order-service/
COPY services/payment-service/package*.json ./services/payment-service/
COPY services/notification-service/package*.json ./services/notification-service/
COPY workers/payment-worker/package*.json ./workers/payment-worker/
COPY workers/notification-worker/package*.json ./workers/notification-worker/
COPY frontend/package.json ./frontend/

# Install dependencies across all workspaces
RUN npm install --omit=dev

# Install PM2 process runner globally
RUN npm install -g pm2

# Copy source code for shared library, services, workers, and runner scripts
COPY shared/ ./shared/
COPY services/ ./services/
COPY workers/ ./workers/
COPY scripts/ ./scripts/

# Set production environment
ENV NODE_ENV=production

# Render dynamic port fallback
EXPOSE 5000

# Start all microservices, workers, and gateway under PM2
CMD ["pm2-runtime", "scripts/pm2.ecosystem.config.js"]
