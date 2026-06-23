# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile de app ÚNICO (raiz do monorepo) — para `fly deploy` / `fly launch`
# executado na raiz do repositório.
#
# Estágio 1: compila o frontend (Vite → dist)
# Estágio 2: backend Express que serve a API (/api) E o frontend estático
#
# Para deploys SEPARADOS (api e web em apps distintos), use os Dockerfiles e
# fly.toml dentro de backend/ e frontend/.
# ─────────────────────────────────────────────────────────────────────────────

# ── Estágio 1: build do frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Estágio 2: backend + estático ────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Dependências do backend
COPY backend/package*.json ./
RUN npm install --omit=dev

# Código do backend
COPY backend/ ./

# Build do frontend servido pelo Express em /app/public
COPY --from=frontend /frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/index.js"]
