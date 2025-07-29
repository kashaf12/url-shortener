# ─── BASE IMAGE ────────────────────────────────────────────────────────
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Install tools
RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && pnpm install -g turbo

# ─── PRUNE MONOREPO ────────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN turbo prune --scope=backend --docker

# ─── INSTALL PRUNED DEPS ───────────────────────────────────────────────
FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ ./
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/full/ .

# Force reinstall to ensure platform-specific binaries are downloaded
RUN pnpm install --frozen-lockfile --force

# ─── BUILD BACKEND ─────────────────────────────────────────────────────
FROM base AS builder-app
WORKDIR /app

COPY --from=installer /app ./
# Add these environment variables to help with platform detection
ENV NODE_ENV=production
ENV ROLLUP_SKIP_NATIVE_PLATFORM_CHECK=1
RUN pnpm turbo run build --filter=backend

# ─── FINAL RUNTIME ─────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 appuser

# Copy only the files required at runtime
COPY --from=builder-app --chown=appuser:nodejs /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder-app --chown=appuser:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder-app --chown=appuser:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder-app --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder-app --chown=appuser:nodejs /app/packages ./packages

USER appuser
WORKDIR /app/apps/backend

EXPOSE 8000
CMD ["node", "dist/main.js"]
