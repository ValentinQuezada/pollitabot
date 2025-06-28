
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --silent

COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data

CMD ["npm", "run", "container-start"]
