FROM node:20-alpine
WORKDIR /app

# Copia manifests. O package-lock.json é opcional (usa npm install se ausente)
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3001
CMD ["node", "src/index.js"]
