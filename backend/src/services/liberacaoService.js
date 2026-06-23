const { query } = require('../config/database');

/**
 * Regra de liberação (REGULAR):
 * Cumulativamente:
 * 1. Cadastur existente e vigente
 * 2. Autorização ativa para a data consultada (diaChegada <= hoje <= diaChegada + permanencia)
 * 3. DAM pago
 */
async function verificarLiberacao(placa, dataConsulta) {
  const data = dataConsulta || new Date().toISOString().split('T')[0];

  // Busca veículo pela placa
  const { rows: veiculos } = await query(
    `SELECT cadastur, tipo, validade_cadastur, ativo FROM veiculos WHERE placa = $1`,
    [placa.toUpperCase()]
  );

  if (veiculos.length === 0) {
    return {
      regular: false,
      indicadores: {
        cadastur: { ok: false, motivo: 'Veículo não cadastrado no sistema' },
        autorizacao: { ok: false, motivo: 'Sem cadastro' },
        pagamento: { ok: false, motivo: 'Sem cadastro' },
      },
    };
  }

  const veiculo = veiculos[0];
  const cadasturVigente = veiculo.ativo && new Date(veiculo.validade_cadastur) >= new Date(data);

  // Busca autorização ativa cobrindo a data consultada
  const { rows: auts } = await query(
    `SELECT a.id, a.status, a.dia_chegada, a.permanencia,
            d.paga, d.id as dam_id, d.numero as dam_numero
     FROM autorizacoes a
     LEFT JOIN dams d ON d.autorizacao_id = a.id
     WHERE a.placa = $1
       AND a.status = 'autorizada'
       AND a.dia_chegada <= $2::date
       AND (a.dia_chegada + a.permanencia * INTERVAL '1 day') > $2::date
     ORDER BY a.data_lancamento DESC
     LIMIT 1`,
    [placa.toUpperCase(), data]
  );

  const temAutorizacao = auts.length > 0;
  const temPagamento = temAutorizacao && auts[0].paga === true;

  const indicadores = {
    cadastur: {
      ok: cadasturVigente,
      motivo: !veiculo.ativo ? 'Veículo inativo' :
              !cadasturVigente ? 'Cadastur vencido' : undefined,
    },
    autorizacao: {
      ok: temAutorizacao,
      motivo: !temAutorizacao ? 'Sem autorização válida para esta data' : undefined,
    },
    pagamento: {
      ok: temPagamento,
      motivo: !temAutorizacao ? 'Sem autorização' :
              !temPagamento ? 'DAM não pago' : undefined,
      dam_id: temAutorizacao ? auts[0].dam_id : undefined,
      dam_numero: temAutorizacao ? auts[0].dam_numero : undefined,
    },
  };

  const regular = cadasturVigente && temAutorizacao && temPagamento;

  return { regular, indicadores, placa: placa.toUpperCase() };
}

module.exports = { verificarLiberacao };
