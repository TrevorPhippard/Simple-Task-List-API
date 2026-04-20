# --- Stage 1: Builder ---
FROM node:20-alpine AS builder

# alpine doesn't have openssl, libc6-compat(better binary compatibility)
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .


RUN npm rebuild esbuild

RUN npm run generate
RUN npm run build

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
COPY package*.json ./

# Install ALL production dependencies
RUN npm ci --omit=dev

# Copy the Prisma generation from the builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy your bundled server code
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]