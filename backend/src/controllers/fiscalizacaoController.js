const { query } = require('../config/database');
const { verificarLiberacao } = require('../services/liberacaoService');
const { registrarAuditoria } = require('../utils/auditoria');
const { v4: uuidv4 } = require('uuid');

async function consultarPlaca(req, res) {
  const placa = req.params.placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const { data } = req.query;

  const resultado = await verificarLiberacao(placa, data);

  // Busca informações completas para fiscalização (dados internos permitidos)
  const { rows: veiculo } = await query(
    `SELECT cadastur, placa, tipo, proprietario, validade_cadastur, ativo FROM veiculos WHERE placa = $1`,
    [placa]
  );
  const { rows: autuacoes } = await query(
    `SELECT at.*, u.nome as agente_nome FROM autuacoes at JOIN usuarios u ON u.id = at.agente_id WHERE at.placa = $1 ORDER BY at.data DESC LIMIT 5`,
    [placa]
  );

  res.json({
    ...resultado,
    veiculo: veiculo[0] || null,
    autuacoes_recentes: autuacoes,
  });
}

async function registrarAutuacao(req, res) {
  const { placa, motivo } = req.body;
  const id = uuidv4();

  await query(
    `INSERT INTO autuacoes (id, placa, motivo, agente_id) VALUES ($1,$2,$3,$4)`,
    [id, placa.toUpperCase(), motivo, req.usuario.id]
  );

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    acao: 'AUTUACAO',
    entidade: 'autuacoes',
    entidadeId: id,
    dadosNovos: { placa, motivo },
    ip: req.ip,
  });

  res.status(201).json({ mensagem: 'Autuação registrada com sucesso', id });
}

async function listarAutuacoes(req, res) {
  const { placa, pagina = 1, por_pagina = 20 } = req.query;
  const offset = (parseInt(pagina) - 1) * parseInt(por_pagina);
  let sql = `SELECT at.*, u.nome as agente_nome FROM autuacoes at JOIN usuarios u ON u.id = at.agente_id WHERE 1=1`;
  const params = [];

  if (placa) { params.push(placa.toUpperCase()); sql += ` AND at.placa = $${params.length}`; }

  params.push(parseInt(por_pagina), offset);
  sql += ` ORDER BY at.data DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await query(sql, params);
  res.json(rows);
}

module.exports = { consultarPlaca, registrarAutuacao, listarAutuacoes };
