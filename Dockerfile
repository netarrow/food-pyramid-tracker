FROM node:20-slim AS deps
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /usr/src/app

# Reuse dependencies and copy source
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Build Vite frontend
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /usr/src/app

# Install all dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# App runtime configuration
ENV PORT=80
ENV NODE_ENV=production

# Copy backend and built frontend
COPY server ./server
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 80
CMD ["node", "server/index.js"]
