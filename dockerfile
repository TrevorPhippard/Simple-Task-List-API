# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run generate
RUN npm run build

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production
COPY package*.json ./
# We need prisma files to run migrations/seed in the container
COPY prisma ./prisma/

# Install dependencies (Prisma needs devDeps like 'tsx' to run a TS seed)
# If you want to keep the image small, consider compiling the seed to JS
RUN npm ci

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Use a shell string to chain the commands
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/server.js"]