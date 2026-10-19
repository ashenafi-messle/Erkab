# ==========================================
# Erkab Backend - Production Dockerfile
# Optimized for 2 vCPU / 4 GB RAM Zergaw VPS
# ==========================================

# 1. Base Stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat dumb-init

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder Stage (Contract validation and type verification)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Emit Prisma contract artifacts
RUN npx prisma contract emit
# Verify TypeScript definitions without emitting js files
RUN npm run build
# Prune development dependencies for slim runtime image
RUN npm prune --omit=dev

# 4. Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Secure non-root user
USER node

# Copy runtime node_modules and verified source files
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma.config.ts ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/src ./src

EXPOSE 5000

# Docker native healthcheck using built-in busybox wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "./node_modules/tsx/dist/cli.mjs", "src/server.ts"]
