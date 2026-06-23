const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Interface de serviço de e-mail — troque o transporter sem alterar o restante
let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function enviarEmail({ para, assunto, html, texto }) {
  if (process.env.NODE_ENV === 'test') {
    logger.debug(`[EMAIL SIMULADO] Para: ${para} | Assunto: ${assunto}`);
    return { simulado: true };
  }
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to: para,
      subject: assunto,
      text: texto,
      html,
    });
    logger.info(`E-mail enviado: ${info.messageId} → ${para}`);
    return info;
  } catch (err) {
    logger.error(`Falha ao enviar e-mail para ${para}: ${err.message}`);
    throw err;
  }
}

async function notificarIrregularSemset(placa) {
  const semset = process.env.EMAIL_SEMSET;
  if (!semset) return;
  await enviarEmail({
    para: semset,
    assunto: `[IRREGULARIDADE] Veículo ${placa} consultado como IRREGULAR`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#1e4d5c;color:#fff;padding:16px 24px">
          <h2 style="margin:0">Sistema de Turismo — Guarapari/ES</h2>
        </div>
        <div style="padding:24px;background:#f9fafb">
          <p>A placa <strong style="font-size:1.2em">${placa}</strong> foi consultada no portal público e está com situação <strong style="color:#dc2626">IRREGULAR</strong>.</p>
          <p>Verifique no sistema se é necessário tomar alguma providência.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb"/>
          <p style="font-size:0.85em;color:#6b7280">
            Notificação automática gerada em ${new Date().toLocaleString('pt-BR')}.<br/>
            Sistema de Gestão de Veículos de Turismo — Prefeitura de Guarapari/ES
          </p>
        </div>
      </div>
    `,
    texto: `Placa ${placa} consultada como IRREGULAR no portal público. Verifique no sistema.`,
  });
}

async function enviarComprovanteDAM({ para, dam, placa, tipo }) {
  await enviarEmail({
    para,
    assunto: `Comprovante de Pagamento — DAM ${dam.numero}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <div style="background:#1e4d5c;color:#fff;padding:16px 24px">
          <h2 style="margin:0">Sistema de Turismo — Guarapari/ES</h2>
        </div>
        <div style="padding:24px;background:#f9fafb">
          <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px">
            <p style="font-size:1.2em;font-weight:bold;color:#15803d;margin:0">✓ PAGAMENTO CONFIRMADO</p>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;color:#6b7280">Nº do DAM</td><td style="padding:8px;font-weight:bold">${dam.numero}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;color:#6b7280">Placa</td><td style="padding:8px;font-weight:bold">${placa}</td></tr>
            <tr><td style="padding:8px;color:#6b7280">Tipo</td><td style="padding:8px">${tipo}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;color:#6b7280">Valor Pago</td><td style="padding:8px;font-weight:bold">R$ ${parseFloat(dam.valor).toFixed(2)}</td></tr>
            <tr><td style="padding:8px;color:#6b7280">Data do Pagamento</td><td style="padding:8px">${new Date(dam.data_pagamento).toLocaleDateString('pt-BR')}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px;color:#6b7280">Código de Verificação</td><td style="padding:8px;font-family:monospace;font-weight:bold">${dam.codigo_verificacao}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin-top:20px"/>
          <p style="font-size:0.85em;color:#6b7280">
            Prefeitura Municipal de Guarapari — SEMSET/Fazenda<br/>
            Este documento tem validade legal como comprovante de pagamento.
          </p>
        </div>
      </div>
    `,
    texto: `Comprovante de pagamento DAM ${dam.numero} — Placa ${placa} — R$ ${dam.valor}. Código: ${dam.codigo_verificacao}`,
  });
}

module.exports = { enviarEmail, notificarIrregularSemset, enviarComprovanteDAM };
