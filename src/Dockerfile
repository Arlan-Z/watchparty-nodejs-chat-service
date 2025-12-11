FROM node:24.12.0-trixie-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

FROM node:24.12.0-trixie-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 5000

CMD [ "node", "server.js" ] 