const { query } = require('../config/database');

/**
 * Gera o próximo Cadastur Municipal no formato CM-AAAA-NNNN.
 * Garante unicidade com lock de transação.
 */
async function gerarCadastur(client) {
  const ano = new Date().getFullYear();
  const prefixo = `CM-${ano}-`;

  const { rows } = await (client || { query: (...a) => query(...a) }).query(
    `SELECT cadastur FROM veiculos WHERE cadastur LIKE $1 ORDER BY cadastur DESC LIMIT 1`,
    [`${prefixo}%`]
  );

  let proximo = 1;
  if (rows.length > 0) {
    const ultimo = rows[0].cadastur;
    const seq = parseInt(ultimo.split('-')[2], 10);
    proximo = seq + 1;
  }

  return `${prefixo}${String(proximo).padStart(4, '0')}`;
}

/**
 * Valida se um Cadastur existe e está vigente.
 */
async function validarCadastur(cadastur) {
  const { rows } = await query(
    `SELECT cadastur, validade_cadastur, ativo FROM veiculos WHERE cadastur = $1`,
    [cadastur]
  );

  if (rows.length === 0) return { valido: false, motivo: 'Cadastur não encontrado' };
  const v = rows[0];
  if (!v.ativo) return { valido: false, motivo: 'Veículo inativo' };
  if (new Date(v.validade_cadastur) < new Date()) {
    return { valido: false, motivo: 'Cadastur vencido', veiculo: v };
  }
  return { valido: true, veiculo: v };
}

module.exports = { gerarCadastur, validarCadastur };
