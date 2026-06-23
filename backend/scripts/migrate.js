/* eslint-disable no-console */
/**
 * Runner de migrations robusto para deploy no Fly.io.
 *
 * Substitui `node-pg-migrate up` (CLI puro) porque:
 *   - valida a presença de DATABASE_URL e falha com mensagem clara
 *     (em vez do "timeout waiting for release command logs" do Fly);
 *   - configura SSL automaticamente para o Postgres do Fly (certificado
 *     self-signed → rejectUnauthorized:false); conexões internas
 *     (.internal / .flycast) dispensam SSL;
 *   - loga início, fim e erros de forma explícita no release_command.
 *
 * Uso:  node scripts/migrate.js        (aplica todas as migrations - up)
 */
const migrationRunner = require('node-pg-migrate').default;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      '[migrate] ERRO: DATABASE_URL não definida. ' +
      'No Fly.io rode `fly postgres attach <db>` para injetar a variável, ' +
      'ou configure-a com `fly secrets set DATABASE_URL=...`.'
    );
    process.exit(1);
  }

  // Conexões internas do Fly (rede privada) não usam TLS; as demais
  // (Managed Postgres / externas) usam TLS com certificado self-signed.
  const isInternal = /\.internal|\.flycast/.test(databaseUrl);
  const ssl = isInternal ? false : { rejectUnauthorized: false };

  const redacted = databaseUrl.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');
  console.log(`[migrate] Conectando em ${redacted} (ssl=${ssl ? 'on' : 'off'})`);

  try {
    await migrationRunner({
      databaseUrl: { connectionString: databaseUrl, ssl },
      dir: 'migrations',
      direction: 'up',
      migrationsTable: 'pgmigrations',
      count: Infinity,
      verbose: true,
    });
    console.log('[migrate] Migrations aplicadas com sucesso.');
    process.exit(0);
  } catch (err) {
    console.error('[migrate] Falha ao aplicar migrations:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
