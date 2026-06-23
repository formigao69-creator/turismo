const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Interface de geração de DAM.
 * Ponto de extensão: troque mvpProvider por um provider real (bancário, PIX, API municipal)
 * sem alterar nenhum outro módulo do sistema.
 */

const mvpProvider = {
  async gerarNumero() {
    const ano = new Date().getFullYear();
    const { rows } = await query(
      `SELECT COUNT(*) as total FROM dams WHERE EXTRACT(YEAR FROM data_emissao) = $1`,
      [ano]
    );
    const seq = parseInt(rows[0].total) + 1;
    return `DAM-${ano}-${String(seq).padStart(6, '0')}`;
  },

  gerarLinhaDigitavel(numero, valor) {
    const valorCents = Math.round(parseFloat(valor) * 100);
    const valorStr = String(valorCents).padStart(10, '0');
    // Linha digitável simulada (formato livre para MVP)
    return `89890.00000 00000.000000 00000.000000 1 ${valorStr}`;
  },

  gerarCodigoVerificacao() {
    return `COMP-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  },
};

// Troque esta variável para integrar com provedor real
const provider = mvpProvider;

async function emitirDAM({ autorizacaoId, tipoVeiculo, diaChegada, emitidoPor }) {
  // Busca valor da tabela de preços
  const { rows: precos } = await query(
    `SELECT valor FROM tabela_precos WHERE tipo_veiculo = $1 LIMIT 1`,
    [tipoVeiculo]
  );
  if (precos.length === 0) throw new Error(`Tabela de preços não configurada para ${tipoVeiculo}`);
  const valor = precos[0].valor;

  // Dias de vencimento (parâmetro configurável)
  const { rows: params } = await query(`SELECT valor FROM parametros WHERE chave = 'dias_validade_dam'`);
  const diasVenc = parseInt(params[0]?.valor || '3');

  const vencimento = new Date(diaChegada);
  vencimento.setDate(vencimento.getDate() + diasVenc);

  const numero = await provider.gerarNumero();
  const linhaDigitavel = provider.gerarLinhaDigitavel(numero, valor);
  const codigoVerificacao = provider.gerarCodigoVerificacao();

  const { rows } = await query(
    `INSERT INTO dams (id, autorizacao_id, numero, valor, vencimento, linha_digitavel, paga, data_emissao, emitido_por, codigo_verificacao)
     VALUES ($1,$2,$3,$4,$5,$6,false,CURRENT_DATE,$7,$8)
     ON CONFLICT (autorizacao_id) DO NOTHING
     RETURNING *`,
    [uuidv4(), autorizacaoId, numero, valor, vencimento.toISOString().split('T')[0],
     linhaDigitavel, emitidoPor, codigoVerificacao]
  );

  return rows[0] || null;
}

async function registrarBaixa({ damId, fazendaUserId }) {
  const codigo = provider.gerarCodigoVerificacao();
  const { rows } = await query(
    `UPDATE dams SET paga=true, data_pagamento=CURRENT_DATE, baixa_por=$1, codigo_verificacao=$2
     WHERE id=$3 AND paga=false RETURNING *`,
    [fazendaUserId, codigo, damId]
  );
  return rows[0] || null;
}

module.exports = { emitirDAM, registrarBaixa };
