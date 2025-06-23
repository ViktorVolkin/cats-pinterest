FROM node:18-alpine AS build

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY server.ts ./

RUN npx tsc

FROM node:18-alpine

WORKDIR /server

COPY --from=build /server/package.json /server/package-lock.json ./
RUN npm ci --production

COPY --from=build /server/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
