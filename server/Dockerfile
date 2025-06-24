FROM node:18-alpine

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm ci

COPY server.ts ./
COPY middlewares ./middlewares

EXPOSE 3000

CMD ["npm", "start"]
