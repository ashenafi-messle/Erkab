# ==========================================
# Erkab Public Website - Production Dockerfile
# Optimized for Next.js 16 Standalone Output
# ==========================================

# 1. Base Stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat dumb-init

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder Stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public environment variable (baked into client bundles)
ARG NEXT_PUBLIC_API_URL=https://api.erkab.org
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# 4. Production Runner Stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public static files and standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Fallback check if standalone output nested application folder
RUN if [ -d "./erkab-website" ]; then \
      mkdir -p ./erkab-website/.next && \
      cp -rn ./.next/static ./erkab-website/.next/static 2>/dev/null || true && \
      cp -rn ./public ./erkab-website/public 2>/dev/null || true; \
    fi

USER nextjs

EXPOSE 3000

# Native busybox wget healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else node erkab-website/server.js; fi"]
