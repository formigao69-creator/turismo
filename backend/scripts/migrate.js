/* eslint-disable no-console */
const path = require('path');
const migrationRunner = require('node-pg-migrate').default;

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');
const ts = () => new Date().toISOString();

function runWith(databaseUrl, ssl) {
  return migrationRunner({
    // connectionTimeoutMillis: falha rapido (10s) se o banco estiver
    // inacessivel, em vez de pendurar ate o Fly matar a maquina sem logs.
    databaseUrl: { connectionString: databaseUrl, ssl, connectionTimeoutMillis: 10000 },
    dir: MIGRATIONS_DIR,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    verbose: true,
  });
}

/**
 * Aplica todas as migrations pendentes.
 * Lanca em caso de falha (para o chamador decidir o que fazer).
 */
async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL nao definida. ' +
      'Fly.io: rode `fly postgres attach <app-db>` para injetar a variavel, ' +
      'ou `fly secrets set DATABASE_URL="postgres://..."`.'
    );
  }

  const redacted = databaseUrl.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');
  console.log(`[migrate ${ts()}] banco : ${redacted}`);
  console.log(`[migrate ${ts()}] dir   : ${MIGRATIONS_DIR}`);

  // Fly Postgres interno (.internal / .flycast) nao usa TLS.
  // Conexoes externas/gerenciadas precisam de TLS self-signed (rejectUnauthorized:false).
  const isInternal = /\.internal|\.flycast/.test(databaseUrl);
  const attempts = isInternal
    ? [false, { rejectUnauthorized: false }]
    : [{ rejectUnauthorized: false }, false];

  let lastErr;
  for (const ssl of attempts) {
    const label = ssl === false ? 'ssl=off' : 'ssl=on(no-verify)';
    console.log(`[migrate ${ts()}] tentando ${label}...`);
    try {
      await runWith(databaseUrl, ssl);
      console.log(`[migrate ${ts()}] concluido com sucesso.`);
      return;
    } catch (err) {
      lastErr = err;
      const isSSLErr = /SSL|TLS|certificate|ECONNRESET/i.test(err.message);
      console.error(`[migrate ${ts()}] falhou (${label}): ${err.message}`);
      if (!isSSLErr) break; // erro nao relacionado a SSL: nao adianta trocar o modo
    }
  }

  throw lastErr || new Error('migrations falharam por motivo desconhecido');
}

module.exports = { runMigrations };

// Execucao direta via CLI:  node scripts/migrate.js
if (require.main === module) {
  runMigrations()
    .then(() => { process.exitCode = 0; })
    .catch((err) => {
      console.error(`[migrate ${ts()}] ERRO: ${err.message}`);
      if (err.stack) console.error(err.stack);
      process.exitCode = 1;
    });
}
