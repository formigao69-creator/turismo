const { query, getClient } = require('../config/database');
const { gerarCadastur } = require('../utils/cadastur');
const { registrarAuditoria } = require('../utils/auditoria');

async function listar(req, res) {
  const { busca, pagina = 1, por_pagina = 20 } = req.query;
  const offset = (parseInt(pagina) - 1) * parseInt(por_pagina);
  let sql = `SELECT cadastur, placa, tipo, proprietario, contato, email, data_cadastro, validade_cadastur, ativo FROM veiculos WHERE 1=1`;
  const params = [];

  if (busca) {
    params.push(`%${busca.toUpperCase()}%`);
    sql += ` AND (placa ILIKE $${params.length} OR cadastur ILIKE $${params.length} OR proprietario ILIKE $${params.length})`;
  }

  const { rows: total } = await query(`SELECT COUNT(*) FROM (${sql}) t`, params);
  params.push(parseInt(por_pagina), offset);
  sql += ` ORDER BY data_cadastro DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const { rows } = await query(sql, params);

  res.json({ dados: rows, total: parseInt(total[0].count), pagina: parseInt(pagina), por_pagina: parseInt(por_pagina) });
}

async function buscarPorPlaca(req, res) {
  const termo = req.params.placa.toUpperCase();
  // Aceita placa (ex.: ABC1D23) ou Cadastur (ex.: CM-2026-0001)
  const isCadastur = /^CM-\d{4}-\d+$/i.test(termo);
  const { rows } = isCadastur
    ? await query(`SELECT * FROM veiculos WHERE cadastur = $1`, [termo])
    : await query(`SELECT * FROM veiculos WHERE placa = $1`, [termo]);

  if (!rows[0]) return res.status(404).json({ erro: 'Veículo não encontrado' });

  const v = rows[0];
  const perfil = req.usuario?.perfil;
  if (!['ADMIN', 'SEMTUR'].includes(perfil)) {
    delete v.documento;
    delete v.email;
  }
  res.json(v);
}

async function cadastrar(req, res) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { placa, tipo, proprietario, documento, contato, email } = req.body;

    // Verifica duplicidade de placa
    const { rows: existe } = await client.query(
      `SELECT cadastur FROM veiculos WHERE placa = $1`,
      [placa.toUpperCase()]
    );
    if (existe.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ erro: `Placa ${placa.toUpperCase()} já cadastrada com Cadastur ${existe[0].cadastur}` });
    }

    // Busca fim da temporada dos parâmetros
    const { rows: params } = await client.query(`SELECT valor FROM parametros WHERE chave = 'fim_temporada'`);
    const validade = params[0]?.valor || `${new Date().getFullYear()}-12-31`;

    const cadastur = await gerarCadastur(client);

    await client.query(
      `INSERT INTO veiculos (cadastur, placa, tipo, proprietario, documento, contato, email, validade_cadastur, criado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [cadastur, placa.toUpperCase(), tipo, proprietario, documento, contato, email, validade, req.usuario.id]
    );

    await client.query('COMMIT');

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      acao: 'CADASTRO_VEICULO',
      entidade: 'veiculos',
      entidadeId: cadastur,
      dadosNovos: { cadastur, placa, tipo, proprietario },
      ip: req.ip,
    });

    res.status(201).json({ cadastur, mensagem: `Veículo cadastrado com sucesso. Cadastur Municipal: ${cadastur}` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar veículo' });
  } finally {
    client.release();
  }
}

async function renovar(req, res) {
  const { cadastur } = req.params;
  const { rows: params } = await query(`SELECT valor FROM parametros WHERE chave = 'fim_temporada'`);
  const novaValidade = params[0]?.valor || `${new Date().getFullYear()}-12-31`;

  const { rows } = await query(
    `UPDATE veiculos SET validade_cadastur = $1, atualizado_em = NOW() WHERE cadastur = $2 RETURNING *`,
    [novaValidade, cadastur]
  );
  if (!rows[0]) return res.status(404).json({ erro: 'Cadastur não encontrado' });

  await registrarAuditoria({
    usuarioId: req.usuario.id,
    acao: 'RENOVACAO_CADASTUR',
    entidade: 'veiculos',
    entidadeId: cadastur,
    dadosNovos: { nova_validade: novaValidade },
    ip: req.ip,
  });

  res.json({ mensagem: `Cadastur ${cadastur} renovado até ${novaValidade}` });
}

async function exportar(req, res) {
  const { rows } = await query(
    `SELECT cadastur, placa, tipo, proprietario, documento, contato, email, data_cadastro, validade_cadastur, ativo
     FROM veiculos ORDER BY data_cadastro DESC`
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="veiculos.csv"');

  const cabecalho = 'Cadastur;Placa;Tipo;Proprietário;CNPJ/CPF;Contato;E-mail;Data Cadastro;Validade;Ativo\n';
  const linhas = rows.map(r =>
    `${r.cadastur};${r.placa};${r.tipo};${r.proprietario};${r.documento};${r.contato || ''};${r.email || ''};${r.data_cadastro};${r.validade_cadastur};${r.ativo ? 'Sim' : 'Não'}`
  ).join('\n');

  res.send('﻿' + cabecalho + linhas);
}

module.exports = { listar, buscarPorPlaca, cadastrar, renovar, exportar };
