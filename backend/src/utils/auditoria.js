const { query } = require('../config/database');

async function registrarAuditoria({ usuarioId, acao, entidade, entidadeId, dadosAnteriores, dadosNovos, ip }) {
  try {
    await query(
      `INSERT INTO auditoria (usuario_id, acao, entidade, entidade_id, dados_anteriores, dados_novos, ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [usuarioId, acao, entidade, entidadeId,
        dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
        dadosNovos ? JSON.stringify(dadosNovos) : null,
        ip || null]
    );
  } catch (err) {
    // Auditoria não deve derrubar a operação principal
    console.error('Erro ao registrar auditoria:', err.message);
  }
}

module.exports = { registrarAuditoria };
