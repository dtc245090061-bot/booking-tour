# ── Build stage ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Production stage ────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Security: create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001

# Copy application source
COPY --chown=nodeapp:nodejs . .

# Copy node_modules from builder
COPY --chown=nodeapp:nodejs --from=builder /app/node_modules ./node_modules

# Switch to non-root user (hardening)
USER nodeapp

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/app.js"]
