require('dotenv').config();
const { query, pool } = require('../config/database');
const { emitirDAM } = require('../services/damService');

/**
 * Job agendado: roda diariamente (via node-cron ou chamada manual).
 * Emite DAMs para todas as autorizações com dia_chegada = hoje sem DAM.
 */
async function emitirDamsDoDia() {
  console.log(`[${new Date().toISOString()}] Iniciando emissão de DAMs do dia...`);

  const { rows: pendentes } = await query(
    `SELECT a.id, a.placa, a.dia_chegada, v.tipo
     FROM autorizacoes a
     JOIN veiculos v ON v.cadastur = a.cadastur
     LEFT JOIN dams d ON d.autorizacao_id = a.id
     WHERE a.status = 'autorizada' AND a.dia_chegada = CURRENT_DATE AND d.id IS NULL`
  );

  console.log(`Encontradas ${pendentes.length} autorização(ões) sem DAM para hoje.`);
  let emitidos = 0;

  for (const p of pendentes) {
    try {
      const dam = await emitirDAM({
        autorizacaoId: p.id,
        tipoVeiculo: p.tipo,
        diaChegada: p.dia_chegada,
        emitidoPor: null, // emissão automática
      });
      if (dam) {
        console.log(`  ✓ ${p.placa} → ${dam.numero}`);
        emitidos++;
      }
    } catch (e) {
      console.error(`  ✗ ${p.placa}: ${e.message}`);
    }
  }

  console.log(`Concluído: ${emitidos} DAM(s) emitido(s).`);
}

// Executa diretamente ou registra via cron
if (require.main === module) {
  emitirDamsDoDia().finally(() => pool.end());
} else {
  module.exports = { emitirDamsDoDia };
}
