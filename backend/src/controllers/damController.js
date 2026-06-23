const { query } = require('../config/database');
const { emitirDAM, registrarBaixa } = require('../services/damService');
const { enviarComprovanteDAM } = require('../services/emailService');
const { registrarAuditoria } = require('../utils/auditoria');

async function listar(req, res) {
  const { paga, data, pagina = 1, por_pagina = 20 } = req.query;
  const offset = (parseInt(pagina) - 1) * parseInt(por_pagina);
  let sql = `
    SELECT d.*, a.placa, a.dia_chegada, a.permanencia, a.cadastur, v.tipo, v.email as email_operadora
    FROM dams d
    JOIN autorizacoes a ON a.id = d.autorizacao_id
    JOIN veiculos v ON v.cadastur = a.cadastur
    WHERE 1=1`;
  const params = [];

  if (paga !== undefined) { params.push(paga === 'true'); sql += ` AND d.paga = $${params.length}`; }
  if (data) { params.push(data); sql += ` AND a.dia_chegada = $${params.length}`; }

  const { rows: total } = await query(`SELECT COUNT(*) FROM (${sql}) t`, params);
  params.push(parseInt(por_pagina), offset);
  sql += ` ORDER BY d.data_emissao DESC, a.dia_chegada DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await query(sql, params);

  res.json({ dados: rows, total: parseInt(total[0].count) });
}

async function emitir(req, res) {
  const { autorizacao_id } = req.body;

  const { rows: auts } = await query(
    `SELECT a.*, v.tipo FROM autorizacoes a JOIN veiculos v ON v.cadastur = a.cadastur WHERE a.id = $1`,
    [autorizacao_id]
  );
  if (!auts[0]) return res.status(404).json({ erro: 'Autorização não encontrada' });
  if (auts[0].status !== 'autorizada') return res.status(422).json({ erro: 'Autorização revogada, não é possível emitir DAM' });

  // Verifica se já existe DAM
  const { rows: existente } = await query(`SELECT id FROM dams WHERE autorizacao_id = $1`, [autorizacao_id]);
  if (existente.length > 0) return res.status(409).json({ erro: 'DAM já emitido para esta autorização' });

  const dam = await emitirDAM({
    autorizacaoId: autorizacao_id,
    tipoVeiculo: auts[0].tipo,
    diaChegada: auts[0].dia_chegada,
    emitidoPor: req.usuario.id,
  });

  if (!dam) return res.status(409).json({ erro: 'DAM já emitido concorrentemente' });

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    acao: 'EMISSAO_DAM',
    entidade: 'dams',
    entidadeId: dam.id,
    dadosNovos: { numero: dam.numero, valor: dam.valor },
    ip: req.ip,
  });

  res.status(201).json(dam);
}

async function registrarPagamento(req, res) {
  const { id } = req.params;
  const dam = await registrarBaixa({ damId: id, fazendaUserId: req.usuario.id });
  if (!dam) return res.status(404).json({ erro: 'DAM não encontrado ou já pago' });

  // Envia comprovante por e-mail
  const { rows } = await query(
    `SELECT a.placa, v.tipo, v.email FROM autorizacoes a JOIN veiculos v ON v.cadastur = a.cadastur WHERE a.id = $1`,
    [dam.autorizacao_id]
  );
  if (rows[0]?.email) {
    try {
      await enviarComprovanteDAM({ para: rows[0].email, dam, placa: rows[0].placa, tipo: rows[0].tipo });
      await query(`UPDATE dams SET comprovante_enviado = true WHERE id = $1`, [dam.id]);
    } catch (e) {
      console.error('Falha ao enviar comprovante:', e.message);
    }
  }

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    acao: 'BAIXA_PAGAMENTO_DAM',
    entidade: 'dams',
    entidadeId: id,
    ip: req.ip,
  });

  res.json({ mensagem: 'Pagamento registrado com sucesso', dam });
}

async function emitirLoteDia(req, res) {
  // Emite DAMs para todas as autorizações do dia sem DAM
  const { rows: pendentes } = await query(
    `SELECT a.id, a.placa, a.dia_chegada, v.tipo
     FROM autorizacoes a
     JOIN veiculos v ON v.cadastur = a.cadastur
     LEFT JOIN dams d ON d.autorizacao_id = a.id
     WHERE a.status = 'autorizada' AND a.dia_chegada = CURRENT_DATE AND d.id IS NULL`
  );

  const resultados = [];
  for (const p of pendentes) {
    try {
      const dam = await emitirDAM({
        autorizacaoId: p.id,
        tipoVeiculo: p.tipo,
        diaChegada: p.dia_chegada,
        emitidoPor: req.usuario.id,
      });
      resultados.push({ placa: p.placa, status: 'emitido', dam_numero: dam?.numero });
    } catch (e) {
      resultados.push({ placa: p.placa, status: 'erro', motivo: e.message });
    }
  }

  res.json({ mensagem: `Lote processado: ${resultados.filter(r => r.status === 'emitido').length} DAM(s) emitido(s)`, resultados });
}

module.exports = { listar, emitir, registrarPagamento, emitirLoteDia };
