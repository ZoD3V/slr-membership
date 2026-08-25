FROM node:24.11.0-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ===============================
# Dependencies
# ===============================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ===============================
# Build
# ===============================
FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# .env file will be created by CI from GitHub Variables
# before building the image
RUN npm run build

# ===============================
# Runner
# ===============================
FROM base AS runner
WORKDIR /app

ARG APP_PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=${APP_PORT}
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${APP_PORT}

CMD ["node", "server.js"]
