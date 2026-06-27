FROM node:22-alpine AS builder

WORKDIR /app

RUN apk upgrade --no-cache && apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build && test -f dist/main.js || (echo "ERROR: dist/main.js not found after build" && exit 1)


FROM node:22-alpine AS deps

WORKDIR /app

RUN apk upgrade --no-cache && apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install --omit=dev


FROM node:22-alpine AS production

RUN apk upgrade --no-cache

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main"]
