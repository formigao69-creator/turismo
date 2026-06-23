/**
 * Testes unitários da regra de liberação (Regular/Irregular).
 * Usa mocks do banco de dados para rodar sem conexão real.
 */

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
}));

const { query } = require('../src/config/database');
const { verificarLiberacao } = require('../src/services/liberacaoService');

describe('Regra de Liberação', () => {
  const hoje = new Date().toISOString().split('T')[0];

  beforeEach(() => jest.clearAllMocks());

  test('REGULAR: Cadastur vigente + autorização + DAM pago', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', tipo: 'Van', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [{ id: 'aut-1', status: 'autorizada', dia_chegada: hoje, permanencia: 3, paga: true, dam_id: 'dam-1', dam_numero: 'DAM-2026-000001' }] });

    const res = await verificarLiberacao('ABC1D23');
    expect(res.regular).toBe(true);
    expect(res.indicadores.cadastur.ok).toBe(true);
    expect(res.indicadores.autorizacao.ok).toBe(true);
    expect(res.indicadores.pagamento.ok).toBe(true);
  });

  test('IRREGULAR: Cadastur vencido', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2025-0099', tipo: 'Carro/Receptivo', validade_cadastur: '2025-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await verificarLiberacao('QRS5T67');
    expect(res.regular).toBe(false);
    expect(res.indicadores.cadastur.ok).toBe(false);
    expect(res.indicadores.cadastur.motivo).toBe('Cadastur vencido');
  });

  test('IRREGULAR: Veículo não cadastrado', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const res = await verificarLiberacao('NAO0001');
    expect(res.regular).toBe(false);
    expect(res.indicadores.cadastur.motivo).toMatch(/não cadastrado/i);
  });

  test('IRREGULAR: Cadastur vigente mas sem autorização', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', tipo: 'Van', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await verificarLiberacao('ABC1D23');
    expect(res.regular).toBe(false);
    expect(res.indicadores.autorizacao.ok).toBe(false);
  });

  test('IRREGULAR: Autorização presente mas DAM não pago', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0002', tipo: 'Ônibus', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [{ id: 'aut-2', status: 'autorizada', dia_chegada: hoje, permanencia: 1, paga: false, dam_id: 'dam-2', dam_numero: 'DAM-2026-000002' }] });

    const res = await verificarLiberacao('XYZ9W87');
    expect(res.regular).toBe(false);
    expect(res.indicadores.autorizacao.ok).toBe(true);
    expect(res.indicadores.pagamento.ok).toBe(false);
    expect(res.indicadores.pagamento.motivo).toBe('DAM não pago');
  });

  test('Janela de validade: fora do período deve ser IRREGULAR', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', tipo: 'Van', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [] }); // nenhuma autorização cobrindo a data futura

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 30);
    const res = await verificarLiberacao('ABC1D23', amanha.toISOString().split('T')[0]);
    expect(res.regular).toBe(false);
  });
});
