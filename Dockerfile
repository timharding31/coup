FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .
RUN yarn run build

EXPOSE 3000

CMD ["yarn", "start"]