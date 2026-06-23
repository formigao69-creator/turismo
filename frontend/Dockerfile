FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# A imagem nginx:alpine aplica envsubst em /etc/nginx/templates/*.template,
# gerando /etc/nginx/conf.d/default.conf na inicialização.
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
# Valor padrão (sobrescrito por env no docker-compose / fly.toml)
ENV BACKEND_UPSTREAM=http://backend:3001
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
