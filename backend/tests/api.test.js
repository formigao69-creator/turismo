/**
 * Testes de API HTTP — exercita rotas principais com mocks de banco.
 */

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  pool: { connect: jest.fn(), end: jest.fn() },
}));
jest.mock('../src/services/emailService', () => ({
  enviarEmail: jest.fn(),
  notificarIrregularSemset: jest.fn(),
  enviarComprovanteDAM: jest.fn(),
}));
jest.mock('../src/services/googleSheetsService', () => ({
  lerRespostasFormulario: jest.fn().mockResolvedValue([]),
}));
jest.mock('node-cron', () => ({ schedule: jest.fn() }));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../src/config/database');

const app = require('../src/index');

function tokenPara(perfil) {
  return jwt.sign(
    { id: 'user-test-1', nome: 'Teste', email: 'teste@test.com', perfil },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

describe('Autenticação', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST /api/auth/login — credenciais inválidas retorna 401', async () => {
    query.mockResolvedValueOnce({ rows: [] }); // usuário não encontrado
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@x.com', senha: 'errada' });
    expect(res.status).toBe(401);
  });

  test('Rota protegida sem token retorna 401', async () => {
    const res = await request(app).get('/api/veiculos');
    expect(res.status).toBe(401);
  });

  test('Rota protegida com token de perfil errado retorna 403', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'user-test-1', ativo: true }] }); // verificarAtivo
    const token = tokenPara('FAZENDA');
    const res = await request(app)
      .get('/api/veiculos')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('Consulta pública', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /api/publico/consulta sem placa retorna 400', async () => {
    const res = await request(app).get('/api/publico/consulta');
    expect(res.status).toBe(400);
  });

  test('GET /api/publico/consulta placa inexistente retorna IRREGULAR', async () => {
    query
      .mockResolvedValueOnce({ rows: [] })     // verificarLiberacao — sem veículo
      .mockResolvedValueOnce({ rows: [] })     // INSERT notificacao_publicas
      .mockResolvedValueOnce({ rows: [] });    // UPDATE notificacao_publicas

    const res = await request(app)
      .get('/api/publico/consulta')
      .query({ placa: 'TST0000', email: 'teste@teste.com' });

    expect(res.status).toBe(200);
    expect(res.body.situacao).toBe('IRREGULAR');
    expect(res.body.regular).toBe(false);
    // Nunca deve retornar dados pessoais
    expect(res.body.proprietario).toBeUndefined();
    expect(res.body.documento).toBeUndefined();
  });

  test('POST /api/publico/cadastro e-mail inválido retorna 422', async () => {
    const res = await request(app)
      .post('/api/publico/cadastro')
      .send({ email: 'nao_e_email' });
    expect(res.status).toBe(422);
  });
});

describe('Health check', () => {
  test('GET /health retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
