# Stage 1: Build
FROM oven/bun:alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock tsconfig.json vite.config.ts components.json ./
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src

# Build production artifacts (generates dist/client and dist/server)
RUN bun run build

# Stage 2: Production runner
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy build artifacts
COPY --from=builder /app/dist ./dist

# Expose app port
EXPOSE 3000

# Start server
CMD ["bun", "run", "dist/server/server.js"]
