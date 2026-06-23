const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { query } = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoria');

async function login(req, res) {
  const { email, senha, token_totp } = req.body;
  try {
    const { rows } = await query(
      `SELECT id, nome, email, perfil, ativo, senha_hash, totp_secret, totp_ativo FROM usuarios WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (!rows[0] || !rows[0].ativo) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const usuario = rows[0];
    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    if (usuario.totp_ativo) {
      if (!token_totp) {
        return res.status(200).json({ requer_totp: true });
      }
      const totpValido = speakeasy.totp.verify({
        secret: usuario.totp_secret,
        encoding: 'base32',
        token: token_totp,
        window: 1,
      });
      if (!totpValido) {
        return res.status(401).json({ erro: 'Código de verificação inválido' });
      }
    }

    await query(`UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1`, [usuario.id]);

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '8h' }
    );

    await registrarAuditoria({
      usuarioId: usuario.id,
      acao: 'LOGIN',
      entidade: 'usuarios',
      entidadeId: usuario.id,
      ip: req.ip,
    });

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno' });
  }
}

async function ativarTotp(req, res) {
  const usuarioId = req.usuario.id;
  const secret = speakeasy.generateSecret({
    name: `${process.env.TOTP_ISSUER || 'TurismoGuarapari'}:${req.usuario.email}`,
    issuer: process.env.TOTP_ISSUER || 'TurismoGuarapari',
  });

  await query(`UPDATE usuarios SET totp_secret = $1, totp_ativo = false WHERE id = $2`, [secret.base32, usuarioId]);

  res.json({ qr_url: secret.otpauth_url, secret: secret.base32 });
}

async function confirmarTotp(req, res) {
  const { token_totp } = req.body;
  const { rows } = await query(`SELECT totp_secret FROM usuarios WHERE id = $1`, [req.usuario.id]);
  const valido = speakeasy.totp.verify({
    secret: rows[0].totp_secret,
    encoding: 'base32',
    token: token_totp,
    window: 1,
  });
  if (!valido) return res.status(400).json({ erro: 'Código inválido. Tente novamente.' });
  await query(`UPDATE usuarios SET totp_ativo = true WHERE id = $1`, [req.usuario.id]);
  res.json({ mensagem: 'Autenticação de dois fatores ativada com sucesso.' });
}

async function alterarSenha(req, res) {
  const { senha_atual, nova_senha } = req.body;
  const { rows } = await query(`SELECT senha_hash FROM usuarios WHERE id = $1`, [req.usuario.id]);
  const ok = await bcrypt.compare(senha_atual, rows[0].senha_hash);
  if (!ok) return res.status(400).json({ erro: 'Senha atual incorreta' });
  if (nova_senha.length < 8) return res.status(400).json({ erro: 'Nova senha deve ter ao menos 8 caracteres' });
  const hash = await bcrypt.hash(nova_senha, 12);
  await query(`UPDATE usuarios SET senha_hash = $1, atualizado_em = NOW() WHERE id = $2`, [hash, req.usuario.id]);
  res.json({ mensagem: 'Senha alterada com sucesso.' });
}

module.exports = { login, ativarTotp, confirmarTotp, alterarSenha };
