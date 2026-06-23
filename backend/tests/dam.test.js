jest.mock('../src/config/database', () => ({ query: jest.fn() }));
const { query } = require('../src/config/database');
const { emitirDAM } = require('../src/services/damService');

describe('Serviço de DAM', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Emite DAM com valor da tabela de preços', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ valor: '80.00' }] })  // tabela_precos
      .mockResolvedValueOnce({ rows: [{ valor: '3' }] })      // parametros dias_validade
      .mockResolvedValueOnce({ rows: [{ total: '5' }] })      // count dams
      .mockResolvedValueOnce({ rows: [{
        id: 'dam-123', autorizacao_id: 'aut-456',
        numero: 'DAM-2026-000006', valor: '80.00',
        linha_digitavel: '89890.00000...', paga: false,
      }] });

    const dam = await emitirDAM({
      autorizacaoId: 'aut-456',
      tipoVeiculo: 'Van',
      diaChegada: new Date().toISOString().split('T')[0],
      emitidoPor: 'user-1',
    });

    expect(dam).not.toBeNull();
    expect(dam.numero).toMatch(/^DAM-\d{4}-\d{6}$/);
  });

  test('Lança erro quando tipo não está na tabela de preços', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    await expect(emitirDAM({ autorizacaoId: 'x', tipoVeiculo: 'Helicóptero', diaChegada: '2026-01-01' }))
      .rejects.toThrow(/tabela de preços/i);
  });
});
