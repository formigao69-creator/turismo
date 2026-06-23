const { query } = require('../config/database');
const { verificarLiberacao } = require('../services/liberacaoService');
const { notificarIrregularSemset } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

async function consultarPlaca(req, res) {
  const { placa, email } = req.query;
  if (!placa) return res.status(400).json({ erro: 'Placa é obrigatória' });

  const placaNorm = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const resultado = await verificarLiberacao(placaNorm);

  // Nunca expõe dados pessoais na resposta pública
  const resposta = {
    placa: placaNorm,
    situacao: resultado.regular ? 'REGULAR' : 'IRREGULAR',
    regular: resultado.regular,
    indicadores: {
      cadastur_vigente: resultado.indicadores.cadastur.ok,
      autorizacao_ativa: resultado.indicadores.autorizacao.ok,
      pagamento_ok: resultado.indicadores.pagamento.ok,
    },
  };

  // Registra notificação com ID para rastreamento preciso
  const notifId = uuidv4();
  await query(
    `INSERT INTO notificacoes_publicas (id, placa, email_consulente) VALUES ($1,$2,$3)`,
    [notifId, placaNorm, email || null]
  );

  // Se irregular, notifica SEMSET e atualiza o registro específico
  if (!resultado.regular) {
    try {
      await notificarIrregularSemset(placaNorm);
      await query(
        `UPDATE notificacoes_publicas SET email_semset_enviado = true WHERE id = $1`,
        [notifId]
      );
    } catch (e) {
      console.error('Falha ao notificar SEMSET:', e.message);
    }
  }

  res.json(resposta);
}

async function cadastrarCidadao(req, res) {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ erro: 'E-mail inválido' });
  }
  await query(
    `INSERT INTO cidadaos (id, email) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING`,
    [uuidv4(), email.toLowerCase()]
  );
  res.json({ mensagem: 'Cadastro realizado. Agora você pode consultar placas.' });
}

module.exports = { consultarPlaca, cadastrarCidadao };
