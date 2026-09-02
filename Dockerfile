FROM node:20-bookworm-slim AS base

WORKDIR /app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    rm -rf /var/lib/apt/lists/* && \
    npm ci --omit=dev

FROM node:20-bookworm-slim AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads/documentos

EXPOSE 8000

CMD ["node", "server.js"]
