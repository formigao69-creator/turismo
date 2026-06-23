jest.mock('../src/config/database', () => ({ query: jest.fn() }));
const { query } = require('../src/config/database');
const { validarCadastur } = require('../src/utils/cadastur');

describe('Validação de Cadastur', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Cadastur vigente retorna valido=true', async () => {
    const futuro = '2099-12-31';
    query.mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', validade_cadastur: futuro, ativo: true }] });
    const r = await validarCadastur('CM-2026-0001');
    expect(r.valido).toBe(true);
  });

  test('Cadastur vencido retorna valido=false', async () => {
    query.mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2025-0001', validade_cadastur: '2025-01-01', ativo: true }] });
    const r = await validarCadastur('CM-2025-0001');
    expect(r.valido).toBe(false);
    expect(r.motivo).toBe('Cadastur vencido');
  });

  test('Cadastur inexistente retorna valido=false', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const r = await validarCadastur('CM-2099-9999');
    expect(r.valido).toBe(false);
    expect(r.motivo).toBe('Cadastur não encontrado');
  });

  test('Veículo inativo retorna valido=false', async () => {
    query.mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', validade_cadastur: '2099-12-31', ativo: false }] });
    const r = await validarCadastur('CM-2026-0001');
    expect(r.valido).toBe(false);
    expect(r.motivo).toBe('Veículo inativo');
  });
});
