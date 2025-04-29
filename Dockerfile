# Development stage
FROM node:18-slim AS deps

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build stage
FROM node:18-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM node:18-slim AS runner
WORKDIR /app

# Install curl for HEALTHCHECK
RUN apt-get update \
 && apt-get install -y curl \
 && rm -rf /var/lib/apt/lists/*

# Copy standalone Next.js build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node","server.js"]
