const { google } = require('googleapis');
const { query } = require('../config/database');
const logger = require('../config/logger');

/**
 * Mapeamento de colunas da planilha do Google Forms:
 *
 * Coluna A (índice 0): Carimbo de data/hora (timestamp da resposta)
 * Coluna B (índice 1): Cadastur Municipal do veículo
 * Coluna C (índice 2): Placa do veículo
 * Coluna D (índice 3): Tipo do veículo
 * Coluna E (índice 4): Data de chegada (DD/MM/AAAA)
 * Coluna F (índice 5): Dias de permanência (número)
 * Coluna G (índice 6): Destino (nome do hotel/imóvel)
 * Coluna H (índice 7): Cadastur do imóvel (opcional)
 * Coluna I (índice 8): E-mail da operadora
 *
 * A coluna A (timestamp) + placa formam a chave de idempotência.
 * O campo google_forms_row_id é gerado como: `${timestamp}|${placa}`.
 */

function getAuthClient() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
}

async function lerRespostasFormulario() {
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || 'Respostas ao formulário 1!A:I';

  if (!sheetsId || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    logger.warn('Google Sheets não configurado. Pulando leitura.');
    return [];
  }

  const auth = getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetsId,
    range,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return []; // apenas cabeçalho

  const respostas = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const timestamp = row[0] || '';
    const placa = (row[2] || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const rowId = `${timestamp}|${placa}`;

    // Verifica idempotência
    const { rows: existentes } = await query(
      `SELECT id FROM autorizacoes WHERE google_forms_row_id = $1`,
      [rowId]
    );
    if (existentes.length > 0) continue;

    // Converte data DD/MM/AAAA → AAAA-MM-DD
    const partsData = (row[4] || '').split('/');
    let diaChegada = null;
    if (partsData.length === 3) {
      diaChegada = `${partsData[2]}-${partsData[1].padStart(2,'0')}-${partsData[0].padStart(2,'0')}`;
    }

    respostas.push({
      rowId,
      cadastur: (row[1] || '').trim().toUpperCase(),
      placa,
      tipo: row[3] || '',
      diaChegada,
      permanencia: parseInt(row[5] || '1', 10) || 1,
      destino: row[6] || '',
      cadasturImovel: row[7] || '',
      emailOperadora: row[8] || '',
    });
  }

  logger.info(`Google Sheets: ${respostas.length} novas resposta(s) encontrada(s)`);
  return respostas;
}

module.exports = { lerRespostasFormulario };
