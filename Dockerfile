ARG NODE_VERSION=20-bookworm-slim

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Config applicative — inlinée au build par Next.js (NEXT_PUBLIC_*).
# Défauts sûrs pour la production ; surcharger via --build-arg si besoin.
ARG NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=false
ARG NEXT_PUBLIC_SESSION_TIMEOUT_MS=1800000
ARG NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=5
ARG NEXT_PUBLIC_LOGIN_LOCKOUT_MS=60000
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=$NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS \
    NEXT_PUBLIC_SESSION_TIMEOUT_MS=$NEXT_PUBLIC_SESSION_TIMEOUT_MS \
    NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS=$NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS \
    NEXT_PUBLIC_LOGIN_LOCKOUT_MS=$NEXT_PUBLIC_LOGIN_LOCKOUT_MS
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
