const express = require('express');
const { body, param, query } = require('express-validator');
const { validar } = require('../middleware/validacao');
const { autenticar, autorizar, verificarAtivo } = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const veiculoCtrl = require('../controllers/veiculoController');
const autorizacaoCtrl = require('../controllers/autorizacaoController');
const damCtrl = require('../controllers/damController');
const fiscCtrl = require('../controllers/fiscalizacaoController');
const publicoCtrl = require('../controllers/publicoController');
const adminCtrl = require('../controllers/adminController');

const router = express.Router();
const interno = [autenticar, verificarAtivo];
const perfis = (...p) => [...interno, autorizar(...p)];

// ── Autenticação ─────────────────────────────────────────────────────────────
router.post('/auth/login',
  body('email').isEmail(), body('senha').notEmpty(), validar,
  authCtrl.login
);
router.post('/auth/totp/ativar', ...interno, authCtrl.ativarTotp);
router.post('/auth/totp/confirmar', ...interno, body('token_totp').notEmpty(), validar, authCtrl.confirmarTotp);
router.post('/auth/senha', ...interno, body('senha_atual').notEmpty(), body('nova_senha').isLength({ min: 8 }), validar, authCtrl.alterarSenha);

// ── Veículos (SEMTUR + ADMIN) ────────────────────────────────────────────────
router.get('/veiculos', ...perfis('SEMTUR', 'ADMIN', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO'), veiculoCtrl.listar);
router.get('/veiculos/exportar', ...perfis('SEMTUR', 'ADMIN'), veiculoCtrl.exportar);
router.get('/veiculos/:placa', ...perfis('SEMTUR', 'ADMIN', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO', 'FAZENDA'), veiculoCtrl.buscarPorPlaca);
router.post('/veiculos', ...perfis('SEMTUR', 'ADMIN'),
  body('placa').matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/).withMessage('Placa inválida (padrão Mercosul)'),
  body('tipo').isIn(['Carro/Receptivo', 'Van', 'Micro-ônibus', 'Ônibus']),
  body('proprietario').notEmpty(), body('documento').notEmpty(), validar,
  veiculoCtrl.cadastrar
);
router.patch('/veiculos/:cadastur/renovar', ...perfis('SEMTUR', 'ADMIN'), veiculoCtrl.renovar);

// ── Autorizações (SEMSET Autorização + ADMIN) ────────────────────────────────
router.get('/autorizacoes', ...perfis('SEMSET_AUTORIZACAO', 'ADMIN', 'FAZENDA'), autorizacaoCtrl.listar);
router.get('/autorizacoes/fila-forms', ...perfis('SEMSET_AUTORIZACAO', 'ADMIN'), autorizacaoCtrl.filaForms);
router.get('/autorizacoes/:id', ...perfis('SEMSET_AUTORIZACAO', 'ADMIN', 'FAZENDA', 'SEMSET_FISCALIZACAO'), autorizacaoCtrl.obter);
router.post('/autorizacoes', ...perfis('SEMSET_AUTORIZACAO', 'ADMIN'),
  body('cadastur').notEmpty(), body('placa').notEmpty(),
  body('dia_chegada').isDate(), validar,
  autorizacaoCtrl.lancar
);
router.patch('/autorizacoes/:id/revogar', ...perfis('SEMSET_AUTORIZACAO', 'ADMIN'),
  body('motivo').notEmpty(), validar,
  autorizacaoCtrl.revogar
);
router.post('/autorizacoes/sincronizar-forms', ...perfis('SEMSET_AUTORIZACAO', 'ADMIN'), autorizacaoCtrl.sincronizarForms);

// ── DAMs (Fazenda + ADMIN) ───────────────────────────────────────────────────
router.get('/dams', ...perfis('FAZENDA', 'ADMIN', 'SEMSET_FISCALIZACAO'), damCtrl.listar);
router.post('/dams', ...perfis('FAZENDA', 'ADMIN'), body('autorizacao_id').isUUID(), validar, damCtrl.emitir);
router.post('/dams/lote-dia', ...perfis('FAZENDA', 'ADMIN'), damCtrl.emitirLoteDia);
router.patch('/dams/:id/pagamento', ...perfis('FAZENDA', 'ADMIN'), damCtrl.registrarPagamento);

// ── Fiscalização (SEMSET Fiscalização + ADMIN) ───────────────────────────────
router.get('/fiscalizacao/placa/:placa', ...perfis('SEMSET_FISCALIZACAO', 'ADMIN', 'SEMSET_AUTORIZACAO'), fiscCtrl.consultarPlaca);
router.post('/fiscalizacao/autuacao', ...perfis('SEMSET_FISCALIZACAO', 'ADMIN'),
  body('placa').notEmpty(), body('motivo').notEmpty(), validar,
  fiscCtrl.registrarAutuacao
);
router.get('/fiscalizacao/autuacoes', ...perfis('SEMSET_FISCALIZACAO', 'ADMIN'), fiscCtrl.listarAutuacoes);

// ── Administração ────────────────────────────────────────────────────────────
router.get('/admin/usuarios', ...perfis('ADMIN'), adminCtrl.listarUsuarios);
router.post('/admin/usuarios', ...perfis('ADMIN'),
  body('nome').notEmpty(), body('email').isEmail(),
  body('perfil').isIn(['SEMTUR', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO', 'FAZENDA', 'ADMIN']),
  body('senha').isLength({ min: 8 }), validar,
  adminCtrl.criarUsuario
);
router.patch('/admin/usuarios/:id/toggle', ...perfis('ADMIN'), adminCtrl.ativarDesativar);
router.get('/admin/parametros', ...perfis('ADMIN'), adminCtrl.obterParametros);
router.put('/admin/parametros/:chave', ...perfis('ADMIN'), body('valor').notEmpty(), validar, adminCtrl.atualizarParametro);
router.get('/admin/precos', ...perfis('ADMIN'), adminCtrl.listarPrecos);
router.post('/admin/precos', ...perfis('ADMIN'),
  body('tipo_veiculo').isIn(['Carro/Receptivo', 'Van', 'Micro-ônibus', 'Ônibus']),
  body('valor').isFloat({ min: 0 }), validar,
  adminCtrl.atualizarPreco
);
router.get('/admin/auditoria', ...perfis('ADMIN'), adminCtrl.listarAuditoria);

// ── Portal Público ───────────────────────────────────────────────────────────
router.get('/publico/consulta', publicoCtrl.consultarPlaca);
router.post('/publico/cadastro', body('email').isEmail(), validar, publicoCtrl.cadastrarCidadao);

module.exports = router;
