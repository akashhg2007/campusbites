FROM node:20-alpine
WORKDIR /app
COPY campus-bites/server/package*.json ./
RUN npm ci --only=production
COPY campus-bites/server/ ./
EXPOSE 8080
CMD ["node", "index.js"]
