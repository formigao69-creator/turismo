const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

function autenticar(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

function autorizar(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ erro: 'Acesso não autorizado para este perfil' });
    }
    next();
  };
}

// Verifica se usuário ainda está ativo no banco
async function verificarAtivo(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT id, ativo FROM usuarios WHERE id = $1`,
      [req.usuario.id]
    );
    if (!rows[0]?.ativo) {
      return res.status(401).json({ erro: 'Usuário desativado' });
    }
    next();
  } catch {
    return res.status(500).json({ erro: 'Erro interno' });
  }
}

module.exports = { autenticar, autorizar, verificarAtivo };
