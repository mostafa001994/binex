FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci \
    --prefer-offline \
    --no-audit \
    --no-fund \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000

FROM node:22-alpine AS builder
WORKDIR /app
ARG BINIX_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV BINIX_DATA_DRIVER=mock
ENV BINIX_PUBLIC_SITE_URL=${BINIX_PUBLIC_SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate
RUN npm run build

FROM deps AS migrator
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run db:generate
CMD ["sh", "-c", "npm run db:migrate:deploy && npm run db:seed"]


FROM node:22-alpine AS worker

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run db:generate

CMD ["npm", "run", "worker:notifications"]

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir -p /app/.binix /app/data \
    && chown -R nextjs:nodejs /app/.binix /app/data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
