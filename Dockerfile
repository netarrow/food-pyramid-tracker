FROM node:20-alpine AS client-builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.html ./index.html
COPY vite.config.js ./vite.config.js
COPY public ./public
COPY src ./src
RUN npm run build


FROM node:20-alpine AS server-deps
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev


FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
COPY server ./server
COPY --from=server-deps /app/node_modules ./node_modules
COPY --from=client-builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "server/index.js"]
