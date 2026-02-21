FROM node:24-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM deps AS builder
COPY . .
# Generate Prisma client and build the application
RUN npx prisma generate
RUN npm run build

# production image
FROM base AS production
ENV NODE_ENV=production

COPY package.json package-lock.json ./
# Install only production dependencies
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 3001

# Start the application
CMD npx prisma migrate deploy && node dist/src/main.js