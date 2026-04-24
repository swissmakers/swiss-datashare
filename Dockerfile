# syntax=docker/dockerfile:1
# Shared build base container
FROM node:24-alpine AS build-base
RUN npm install -g npm@latest && apk add --no-cache python3 openssl
# Configure npm retries/timeouts with balanced defaults for CI.
RUN npm config set fetch-timeout 180000 && \
    npm config set fetch-retries 3 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm config set fetch-retry-factor 2 && \
    npm config set loglevel error && \
    npm config set maxsockets 10
WORKDIR /opt/app

# Frontend dependencies
FROM build-base AS frontend-dependencies
WORKDIR /opt/app/frontend
COPY frontend/package.json frontend/package-lock.json ./
# Run deterministic install with retries for transient network issues.
RUN --mount=type=cache,target=/root/.npm \
    set -e; \
    npm_ci_retry() { \
      attempt=1; \
      max_attempts=3; \
      while [ "$attempt" -le "$max_attempts" ]; do \
        echo "Running npm ci (attempt ${attempt}/${max_attempts})"; \
        if npm ci --no-audit --progress=false --include=optional --loglevel=error --fetch-timeout=180000 --fetch-retries=3 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000; then \
          return 0; \
        fi; \
        if [ "$attempt" -eq "$max_attempts" ]; then \
          return 1; \
        fi; \
        sleep_seconds=$((attempt * 5)); \
        echo "npm ci failed; retrying in ${sleep_seconds}s..."; \
        sleep "$sleep_seconds"; \
        attempt=$((attempt + 1)); \
      done; \
    }; \
    npm_ci_retry

# Frontend builder
FROM build-base AS frontend-builder
WORKDIR /opt/app/frontend
COPY ./frontend .
COPY --from=frontend-dependencies /opt/app/frontend/node_modules ./node_modules
RUN npm run build

# Backend dependencies
FROM build-base AS backend-dependencies
WORKDIR /opt/app/backend
COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    set -e; \
    npm_ci_retry() { \
      attempt=1; \
      max_attempts=3; \
      while [ "$attempt" -le "$max_attempts" ]; do \
        echo "Running npm ci (attempt ${attempt}/${max_attempts})"; \
        if npm ci --no-audit --progress=false --include=optional --loglevel=error --fetch-timeout=180000 --fetch-retries=3 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000; then \
          return 0; \
        fi; \
        if [ "$attempt" -eq "$max_attempts" ]; then \
          return 1; \
        fi; \
        sleep_seconds=$((attempt * 5)); \
        echo "npm ci failed; retrying in ${sleep_seconds}s..."; \
        sleep "$sleep_seconds"; \
        attempt=$((attempt + 1)); \
      done; \
    }; \
    npm_ci_retry

# Backend builder
FROM build-base AS backend-builder
WORKDIR /opt/app/backend
COPY ./backend .
COPY --from=backend-dependencies /opt/app/backend/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build && npm prune --production

# Final combined image
FROM node:24-alpine AS runner
RUN npm install -g npm@latest
ENV NODE_ENV=docker
ENV NODE_TLS_REJECT_UNAUTHORIZED=1

RUN deluser --remove-home node 2>/dev/null || true

RUN apk update --no-cache \
    && apk upgrade --no-cache \
    && apk add --no-cache curl caddy su-exec openssl

WORKDIR /opt/app/frontend
COPY --from=frontend-builder /opt/app/frontend/public ./public
COPY --from=frontend-builder /opt/app/frontend/.next/standalone ./
COPY --from=frontend-builder /opt/app/frontend/.next/static ./.next/static
COPY --from=frontend-builder /opt/app/frontend/public/img /tmp/img

WORKDIR /opt/app/backend
COPY --from=backend-builder /opt/app/backend/node_modules ./node_modules
COPY --from=backend-builder /opt/app/backend/dist ./dist
COPY --from=backend-builder /opt/app/backend/prisma ./prisma
COPY --from=backend-builder /opt/app/backend/prisma.config.ts ./prisma.config.ts
COPY --from=backend-builder /opt/app/backend/package.json ./
COPY --from=backend-builder /opt/app/backend/tsconfig.json ./

WORKDIR /opt/app

COPY ./reverse-proxy  /opt/app/reverse-proxy
COPY ./scripts/docker ./scripts/docker

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s CMD /bin/sh -c '(if [[ "$CADDY_DISABLED" = "true" ]]; then curl -fs http://localhost:${BACKEND_PORT:-8080}/api/health; else curl -fs http://localhost:3000/api/health; fi) || exit 1'

ENTRYPOINT ["sh", "./scripts/docker/create-user.sh"]
CMD ["sh", "./scripts/docker/entrypoint.sh"]
