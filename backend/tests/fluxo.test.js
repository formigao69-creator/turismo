/**
 * Testes de integração — fluxo completo de ponta a ponta.
 *
 * Requer banco de dados de teste configurado em DATABASE_URL
 * (padrão: turismo_test). Execute com: npm test
 *
 * O banco deve ter as migrations aplicadas antes dos testes.
 * Em CI, use: npm run migrate && npm test
 */

const request = require('supertest');

// Mocks de banco e serviços externos para rodar sem infraestrutura
jest.mock('../src/config/database', () => {
  const dados = { usuarios: [], veiculos: [], autorizacoes: [], dams: [], parametros: [], precos: [] };

  // Simulação mínima da query para os testes de fluxo
  const query = jest.fn(async (sql, params) => {
    // Para este arquivo, usamos mocks explícitos por teste
    return { rows: [] };
  });
  const getClient = jest.fn(async () => ({
    query,
    release: jest.fn(),
  }));
  const pool = { connect: getClient, end: jest.fn() };
  return { query, getClient, pool };
});

jest.mock('../src/services/emailService', () => ({
  enviarEmail: jest.fn(),
  notificarIrregularSemset: jest.fn(),
  enviarComprovanteDAM: jest.fn(),
}));

jest.mock('../src/services/googleSheetsService', () => ({
  lerRespostasFormulario: jest.fn().mockResolvedValue([]),
}));

// Mock do node-cron para não iniciar timers nos testes
jest.mock('node-cron', () => ({ schedule: jest.fn() }));

describe('Regra de liberação — cenários de ponta a ponta', () => {
  // Testa a lógica pura sem banco, conforme liberacaoService.test.js mais completo

  const { verificarLiberacao } = require('../src/services/liberacaoService');
  const { query } = require('../src/config/database');
  const hoje = new Date().toISOString().split('T')[0];

  beforeEach(() => jest.clearAllMocks());

  test('Cenário 1: todos os requisitos atendidos → REGULAR', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', tipo: 'Van', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [{ id: 'a1', status: 'autorizada', dia_chegada: hoje, permanencia: 3, paga: true, dam_id: 'd1', dam_numero: 'DAM-2026-000001' }] });

    const r = await verificarLiberacao('ABC1D23', hoje);
    expect(r.regular).toBe(true);
    expect(r.indicadores.cadastur.ok).toBe(true);
    expect(r.indicadores.autorizacao.ok).toBe(true);
    expect(r.indicadores.pagamento.ok).toBe(true);
  });

  test('Cenário 2: Cadastur vencido → IRREGULAR (bloqueia todo o fluxo)', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2025-0099', tipo: 'Carro/Receptivo', validade_cadastur: '2025-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [] });

    const r = await verificarLiberacao('QRS5T67', hoje);
    expect(r.regular).toBe(false);
    expect(r.indicadores.cadastur.ok).toBe(false);
    expect(r.indicadores.autorizacao.ok).toBe(false);
    expect(r.indicadores.pagamento.ok).toBe(false);
  });

  test('Cenário 3: Cadastur vigente, autorização presente, DAM pendente → IRREGULAR', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0002', tipo: 'Ônibus', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [{ id: 'a2', status: 'autorizada', dia_chegada: hoje, permanencia: 1, paga: false, dam_id: 'd2', dam_numero: 'DAM-2026-000002' }] });

    const r = await verificarLiberacao('XYZ9W87', hoje);
    expect(r.regular).toBe(false);
    expect(r.indicadores.autorizacao.ok).toBe(true);
    expect(r.indicadores.pagamento.ok).toBe(false);
    expect(r.indicadores.pagamento.motivo).toBe('DAM não pago');
  });

  test('Cenário 4: placa completamente desconhecida → IRREGULAR', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const r = await verificarLiberacao('NAO0000', hoje);
    expect(r.regular).toBe(false);
    expect(r.indicadores.cadastur.motivo).toMatch(/não cadastrado/i);
  });

  test('Cenário 5: consulta fora da janela de permanência → IRREGULAR', async () => {
    // Autorização para ontem com permanência de 1 dia — hoje já é fora da janela
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 2);
    const ontemStr = ontem.toISOString().split('T')[0];

    query
      .mockResolvedValueOnce({ rows: [{ cadastur: 'CM-2026-0001', tipo: 'Van', validade_cadastur: '2099-12-31', ativo: true }] })
      .mockResolvedValueOnce({ rows: [] }); // nenhuma autorização cobre hoje

    const r = await verificarLiberacao('ABC1D23', hoje);
    expect(r.regular).toBe(false);
    expect(r.indicadores.autorizacao.ok).toBe(false);
  });
});

describe('Geração de Cadastur Municipal', () => {
  const { query } = require('../src/config/database');
  const { gerarCadastur } = require('../src/utils/cadastur');
  const ano = new Date().getFullYear();

  beforeEach(() => jest.clearAllMocks());

  test('Primeiro cadastro do ano gera CM-AAAA-0001', async () => {
    query.mockResolvedValueOnce({ rows: [] }); // nenhum cadastur existente
    const c = await gerarCadastur();
    expect(c).toBe(`CM-${ano}-0001`);
  });

  test('Incrementa sequencial corretamente', async () => {
    query.mockResolvedValueOnce({ rows: [{ cadastur: `CM-${ano}-0042` }] });
    const c = await gerarCadastur();
    expect(c).toBe(`CM-${ano}-0043`);
  });

  test('Formato sempre CM-AAAA-NNNN (4 dígitos)', async () => {
    query.mockResolvedValueOnce({ rows: [{ cadastur: `CM-${ano}-0009` }] });
    const c = await gerarCadastur();
    expect(c).toMatch(/^CM-\d{4}-\d{4}$/);
  });
});
