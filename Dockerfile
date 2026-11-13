# Production Multi-Stage Dockerfile for Google Cloud Run
# Tailored for Niaz Cloth House (React 19 + Vite 8 + Express Backend)

# Stage 1: Build Frontend & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy application code
COPY . .

# Build Vite frontend assets (outputs to /app/dist)
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm install -g tsx

# Copy built frontend assets and server files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose standard Cloud Run port
EXPOSE 8080

# Run Express server in production mode
CMD ["npx", "tsx", "server.ts"]
