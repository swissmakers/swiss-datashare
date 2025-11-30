# Shared build base container
FROM node:22-alpine AS build-base
RUN npm install -g npm@latest && apk add --no-cache python3 openssl
WORKDIR /opt/app

# Frontend dependencies
FROM build-base AS frontend-dependencies
WORKDIR /opt/app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

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
RUN npm ci --prefer-offline --no-audit --progress=false || \
    (echo "npm ci failed, retrying without cache..." && npm ci --no-audit --progress=false)

# Backend builder
FROM build-base AS backend-builder
WORKDIR /opt/app/backend
COPY ./backend .
COPY --from=backend-dependencies /opt/app/backend/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build && npm prune --production

# Final combined image
FROM node:22-alpine AS runner
RUN npm install -g npm@latest
ENV NODE_ENV=docker

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
COPY --from=backend-builder /opt/app/backend/package.json ./
COPY --from=backend-builder /opt/app/backend/tsconfig.json ./

WORKDIR /opt/app

COPY ./reverse-proxy  /opt/app/reverse-proxy
COPY ./scripts/docker ./scripts/docker

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s CMD /bin/sh -c '(if [[ "$CADDY_DISABLED" = "true" ]]; then curl -fs http://localhost:${BACKEND_PORT:-8080}/api/health; else curl -fs http://localhost:3000/api/health; fi) || exit 1'

ENTRYPOINT ["sh", "./scripts/docker/create-user.sh"]
CMD ["sh", "./scripts/docker/entrypoint.sh"]
