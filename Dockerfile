FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm pkg delete scripts.prepare && npm install

COPY . .
RUN npm run build && test -f dist/src/main.js || (echo "ERROR: dist/src/main.js not found after build" && exit 1)


FROM node:22-alpine AS production

RUN apk upgrade --no-cache

WORKDIR /app

COPY package.json ./
RUN apk add --no-cache python3 make g++ && \
    npm pkg delete scripts.prepare && \
    npm install --omit=dev && \
    apk del python3 make g++

COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

ARG PORT=4000
ENV PORT=${PORT}
EXPOSE ${PORT}

ENTRYPOINT ["./entrypoint.sh"]
