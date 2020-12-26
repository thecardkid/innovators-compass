FROM node:14.15.3

WORKDIR /app
ADD backend/ backend
ADD package.json package.json

RUN npm install

EXPOSE 8080
CMD node backend/server.js
