FROM node:24-alpine AS builder

WORKDIR /app

COPY src/package*.json ./
RUN npm ci --omit=dev

COPY src .

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 5000

CMD ["node", "server.js"]
