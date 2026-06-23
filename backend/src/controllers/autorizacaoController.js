const { query } = require('../config/database');
const { validarCadastur } = require('../utils/cadastur');
const { registrarAuditoria } = require('../utils/auditoria');
const { lerRespostasFormulario } = require('../services/googleSheetsService');
const { v4: uuidv4 } = require('uuid');

async function listar(req, res) {
  const { status, data, pagina = 1, por_pagina = 20 } = req.query;
  const offset = (parseInt(pagina) - 1) * parseInt(por_pagina);
  let sql = `
    SELECT a.*, u.nome as lancado_por_nome,
           d.paga as dam_pago, d.numero as dam_numero, d.valor as dam_valor
    FROM autorizacoes a
    LEFT JOIN usuarios u ON u.id = a.lancado_por
    LEFT JOIN dams d ON d.autorizacao_id = a.id
    WHERE 1=1`;
  const params = [];

  if (status) { params.push(status); sql += ` AND a.status = $${params.length}`; }
  if (data) { params.push(data); sql += ` AND a.dia_chegada = $${params.length}`; }

  const { rows: total } = await query(`SELECT COUNT(*) FROM (${sql}) t`, params);
  params.push(parseInt(por_pagina), offset);
  sql += ` ORDER BY a.dia_chegada DESC, a.data_lancamento DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await query(sql, params);

  res.json({ dados: rows, total: parseInt(total[0].count) });
}

async function obter(req, res) {
  const { rows } = await query(
    `SELECT a.*, u.nome as lancado_por_nome, d.*
     FROM autorizacoes a
     LEFT JOIN usuarios u ON u.id = a.lancado_por
     LEFT JOIN dams d ON d.autorizacao_id = a.id
     WHERE a.id = $1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ erro: 'Autorização não encontrada' });
  res.json(rows[0]);
}

async function lancar(req, res) {
  const { cadastur, placa, dia_chegada, permanencia, destino, cadastur_imovel, origem } = req.body;

  // Valida Cadastur vigente
  const validacao = await validarCadastur(cadastur);
  if (!validacao.valido) {
    return res.status(422).json({ erro: `Cadastur bloqueado: ${validacao.motivo}` });
  }

  // Confere se a placa bate com o veículo
  const { rows: veiculo } = await query(`SELECT placa FROM veiculos WHERE cadastur = $1`, [cadastur]);
  if (veiculo[0]?.placa !== placa.toUpperCase()) {
    return res.status(422).json({ erro: 'Placa não corresponde ao Cadastur informado' });
  }

  const id = uuidv4();
  const { rows } = await query(
    `INSERT INTO autorizacoes (id, cadastur, placa, dia_chegada, permanencia, destino, cadastur_imovel, origem, status, lancado_por)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'autorizada',$9) RETURNING *`,
    [id, cadastur, placa.toUpperCase(), dia_chegada, permanencia || 1,
     destino, cadastur_imovel, origem || 'Balcão', req.usuario.id]
  );

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    acao: 'LANCAMENTO_AUTORIZACAO',
    entidade: 'autorizacoes',
    entidadeId: id,
    dadosNovos: { cadastur, placa, dia_chegada },
    ip: req.ip,
  });

  res.status(201).json(rows[0]);
}

async function revogar(req, res) {
  const { motivo } = req.body;
  const { rows } = await query(
    `UPDATE autorizacoes SET status='revogada', motivo_revogacao=$1, revogado_por=$2, revogado_em=NOW()
     WHERE id=$3 AND status='autorizada' RETURNING *`,
    [motivo, req.usuario.id, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ erro: 'Autorização não encontrada ou já revogada' });

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    acao: 'REVOGACAO_AUTORIZACAO',
    entidade: 'autorizacoes',
    entidadeId: req.params.id,
    dadosNovos: { motivo },
    ip: req.ip,
  });

  res.json({ mensagem: 'Autorização revogada', dados: rows[0] });
}

async function sincronizarForms(req, res) {
  try {
    const respostas = await lerRespostasFormulario();
    const importadas = [];

    for (const r of respostas) {
      // Rejeita Cadastur inválido/vencido — não insere e sinaliza para revisão manual
      const validacao = await validarCadastur(r.cadastur);
      if (!validacao.valido) {
        importadas.push({
          rowId: r.rowId,
          placa: r.placa,
          cadastur: r.cadastur,
          status: 'rejeitado',
          motivo: `Cadastur bloqueado: ${validacao.motivo}`,
        });
        continue;
      }

      // Confere correspondência placa × Cadastur antes de inserir
      const { rows: vec } = await query(`SELECT placa FROM veiculos WHERE cadastur = $1`, [r.cadastur]);
      if (vec[0]?.placa !== r.placa) {
        importadas.push({
          rowId: r.rowId,
          placa: r.placa,
          cadastur: r.cadastur,
          status: 'rejeitado',
          motivo: 'Placa não corresponde ao Cadastur informado no formulário',
        });
        continue;
      }

      const id = uuidv4();
      try {
        await query(
          `INSERT INTO autorizacoes (id, cadastur, placa, dia_chegada, permanencia, destino, cadastur_imovel, origem, status, lancado_por, google_forms_row_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'Google Forms','autorizada',$8,$9)`,
          [id, r.cadastur, r.placa, r.diaChegada, r.permanencia, r.destino,
           r.cadasturImovel, req.usuario.id, r.rowId]
        );
        importadas.push({ rowId: r.rowId, placa: r.placa, cadastur: r.cadastur, status: 'importado' });
      } catch (e) {
        importadas.push({ rowId: r.rowId, placa: r.placa, cadastur: r.cadastur, status: 'erro', motivo: e.message });
      }
    }

    const importados = importadas.filter(i => i.status === 'importado').length;
    const rejeitados = importadas.filter(i => i.status === 'rejeitado').length;
    res.json({
      mensagem: `${importados} autorização(ões) importada(s), ${rejeitados} rejeitada(s)`,
      detalhes: importadas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao sincronizar com Google Sheets', detalhes: err.message });
  }
}

async function filaForms(req, res) {
  // Retorna autorizações originadas do Forms ainda sem DAM emitido
  const { rows } = await query(
    `SELECT a.*, v.tipo, v.proprietario
     FROM autorizacoes a
     JOIN veiculos v ON v.cadastur = a.cadastur
     LEFT JOIN dams d ON d.autorizacao_id = a.id
     WHERE a.origem = 'Google Forms' AND d.id IS NULL AND a.status = 'autorizada'
     ORDER BY a.dia_chegada ASC`
  );
  res.json(rows);
}

module.exports = { listar, obter, lancar, revogar, sincronizarForms, filaForms };
