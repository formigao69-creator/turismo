require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const logger = require('./config/logger');
const routes = require('./routes');

const app = express();

// Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting (desabilitado em testes para não interferir)
if (process.env.NODE_ENV !== 'test') {
  const limiterGeral = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { erro: 'Muitas requisições, tente novamente em alguns minutos.' } });
  const limiterLogin = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { erro: 'Muitas tentativas de login.' } });
  app.use('/api', limiterGeral);
  app.use('/api/auth/login', limiterLogin);
}

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path} — ${req.ip}`);
  next();
});

app.use('/api', routes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Serve o frontend estático em produção (deploy de app único na raiz).
// O build do Vite é copiado para backend/public pelo Dockerfile da raiz.
// Configurável por STATIC_DIR; ignora /api e /health.
const staticDir = path.resolve(process.env.STATIC_DIR || path.join(__dirname, '..', 'public'));
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
  logger.info(`Servindo frontend estático de ${staticDir}`);
}

// Error handler global
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Job cron: emissão automática de DAMs às 06:00 (não roda em testes)
if (process.env.NODE_ENV !== 'test') {
  const { emitirDamsDoDia } = require('./jobs/emitirDamDia');
  cron.schedule('0 6 * * *', () => {
    logger.info('Cron: emitindo DAMs do dia...');
    emitirDamsDoDia().catch(e => logger.error('Cron DAM falhou:', e.message));
  }, { timezone: 'America/Sao_Paulo' });
}

// Inicia o servidor somente quando executado diretamente (não via require)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  const startServer = () => {
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado na porta ${PORT} — Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  };

  // Em produção, aplica as migrations no startup. Os logs saem no stream
  // normal do app (o release_command do Fly nem sempre consegue enviá-los).
  // Desabilite com RUN_MIGRATIONS=false se as migrations rodarem em outro lugar.
  const deveMigrar = process.env.NODE_ENV === 'production' && process.env.RUN_MIGRATIONS !== 'false';
  if (deveMigrar) {
    const { runMigrations } = require('../scripts/migrate');
    runMigrations()
      .then(startServer)
      .catch((err) => {
        logger.error(`Falha ao aplicar migrations no startup: ${err.message}`);
        process.exit(1);
      });
  } else {
    startServer();
  }
}

module.exports = app;
