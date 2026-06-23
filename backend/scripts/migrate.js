/* eslint-disable no-console */
const path = require('path');
const migrationRunner = require('node-pg-migrate').default;

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

async function runWith(databaseUrl, ssl) {
  await migrationRunner({
    databaseUrl: { connectionString: databaseUrl, ssl },
    dir: MIGRATIONS_DIR,
    direction: 'up',
    migrationsTable: 'pgmigrations',
    verbose: true,
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const ts = () => new Date().toISOString();

  if (!databaseUrl) {
    console.error(
      `[migrate ${ts()}] ERRO: DATABASE_URL nao definida.\n` +
      '  Fly.io: fly postgres attach <app-db> para injetar a variavel,\n' +
      '  ou: fly secrets set DATABASE_URL="postgres://..."'
    );
    process.exitCode = 1;
    return;
  }

  const redacted = databaseUrl.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');
  console.log(`[migrate ${ts()}] banco  : ${redacted}`);
  console.log(`[migrate ${ts()}] dir    : ${MIGRATIONS_DIR}`);

  // Fly Postgres interno (.internal / .flycast) nao usa TLS.
  // Conexoes externas precisam de TLS com self-signed (rejectUnauthorized:false).
  // Tenta a configuracao provavel primeiro; se falhar por motivo de SSL, tenta a outra.
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
      return; // process.exitCode permanece 0 (default)
    } catch (err) {
      lastErr = err;
      const isSSLErr = /SSL|TLS|certificate|ECONNRESET/i.test(err.message);
      console.error(`[migrate ${ts()}] falhou (${label}): ${err.message}`);
      if (!isSSLErr) break; // erro nao-SSL: nao adianta tentar outro modo
    }
  }

  console.error(`[migrate ${ts()}] todas as tentativas falharam.`);
  if (lastErr && lastErr.stack) console.error(lastErr.stack);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(`[migrate] ERRO FATAL: ${err.message}`);
  if (err.stack) console.error(err.stack);
  process.exitCode = 1;
});
