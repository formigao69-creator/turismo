const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { registrarAuditoria } = require('../utils/auditoria');

async function listarUsuarios(req, res) {
  const { rows } = await query(
    `SELECT id, nome, email, perfil, ativo, ultimo_acesso, criado_em FROM usuarios ORDER BY nome`
  );
  res.json(rows);
}

async function criarUsuario(req, res) {
  const { nome, email, perfil, senha } = req.body;
  if (senha.length < 8) return res.status(400).json({ erro: 'Senha mínima de 8 caracteres' });
  const hash = await bcrypt.hash(senha, 12);
  const id = uuidv4();
  try {
    await query(
      `INSERT INTO usuarios (id, nome, email, perfil, senha_hash) VALUES ($1,$2,$3,$4,$5)`,
      [id, nome, email.toLowerCase(), perfil, hash]
    );
    await registrarAuditoria({ usuarioId: req.usuario.id, acao: 'CRIAR_USUARIO', entidade: 'usuarios', entidadeId: id });
    res.status(201).json({ id, mensagem: 'Usuário criado com sucesso' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'E-mail já cadastrado' });
    throw e;
  }
}

async function ativarDesativar(req, res) {
  const { id } = req.params;
  if (id === req.usuario.id) return res.status(400).json({ erro: 'Não é possível desativar o próprio usuário' });
  const { rows } = await query(
    `UPDATE usuarios SET ativo = NOT ativo, atualizado_em = NOW() WHERE id = $1 RETURNING id, nome, ativo`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ erro: 'Usuário não encontrado' });
  await registrarAuditoria({ usuarioId: req.usuario.id, acao: rows[0].ativo ? 'ATIVAR_USUARIO' : 'DESATIVAR_USUARIO', entidade: 'usuarios', entidadeId: id });
  res.json(rows[0]);
}

async function obterParametros(req, res) {
  const { rows } = await query(`SELECT chave, valor, descricao, atualizado_em FROM parametros ORDER BY chave`);
  res.json(rows);
}

async function atualizarParametro(req, res) {
  const { chave } = req.params;
  const { valor } = req.body;
  const { rows } = await query(
    `UPDATE parametros SET valor = $1, atualizado_em = NOW(), atualizado_por = $2 WHERE chave = $3 RETURNING *`,
    [valor, req.usuario.id, chave]
  );
  if (!rows[0]) {
    const { rows: r } = await query(
      `INSERT INTO parametros (chave, valor, atualizado_por) VALUES ($1,$2,$3) RETURNING *`,
      [chave, valor, req.usuario.id]
    );
    return res.status(201).json(r[0]);
  }
  await registrarAuditoria({ usuarioId: req.usuario.id, acao: 'ATUALIZAR_PARAMETRO', entidade: 'parametros', entidadeId: chave, dadosNovos: { valor } });
  res.json(rows[0]);
}

async function listarPrecos(req, res) {
  const { rows } = await query(`SELECT * FROM tabela_precos ORDER BY tipo_veiculo`);
  res.json(rows);
}

async function atualizarPreco(req, res) {
  const { tipo_veiculo, valor } = req.body;
  const { rows } = await query(
    `INSERT INTO tabela_precos (tipo_veiculo, valor, vigente_de, criado_por)
     VALUES ($1,$2,CURRENT_DATE,$3)
     ON CONFLICT (tipo_veiculo) DO UPDATE SET valor=$2, vigente_de=CURRENT_DATE
     RETURNING *`,
    [tipo_veiculo, parseFloat(valor), req.usuario.id]
  );
  await registrarAuditoria({ usuarioId: req.usuario.id, acao: 'ATUALIZAR_PRECO', entidade: 'tabela_precos', entidadeId: tipo_veiculo, dadosNovos: { valor } });
  res.json(rows[0]);
}

async function listarAuditoria(req, res) {
  const { pagina = 1, por_pagina = 50 } = req.query;
  const offset = (parseInt(pagina) - 1) * parseInt(por_pagina);
  const { rows } = await query(
    `SELECT a.*, u.nome as usuario_nome FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
     ORDER BY a.criado_em DESC LIMIT $1 OFFSET $2`,
    [parseInt(por_pagina), offset]
  );
  res.json(rows);
}

module.exports = { listarUsuarios, criarUsuario, ativarDesativar, obterParametros, atualizarParametro, listarPrecos, atualizarPreco, listarAuditoria };
