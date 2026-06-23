/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Extensões
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  // Enum tipos
  pgm.createType('tipo_veiculo', ['Carro/Receptivo', 'Van', 'Micro-ônibus', 'Ônibus']);
  pgm.createType('perfil_usuario', ['SEMTUR', 'SEMSET_AUTORIZACAO', 'SEMSET_FISCALIZACAO', 'FAZENDA', 'ADMIN']);
  pgm.createType('status_autorizacao', ['autorizada', 'revogada']);
  pgm.createType('origem_autorizacao', ['Google Forms', 'Balcão']);

  // Tabela de usuários
  pgm.createTable('usuarios', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    nome: { type: 'varchar(200)', notNull: true },
    email: { type: 'varchar(200)', notNull: true, unique: true },
    perfil: { type: 'perfil_usuario', notNull: true },
    ativo: { type: 'boolean', notNull: true, default: true },
    senha_hash: { type: 'text', notNull: true },
    totp_secret: { type: 'text' },
    totp_ativo: { type: 'boolean', default: false },
    ultimo_acesso: { type: 'timestamp' },
    criado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    atualizado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  // Parâmetros do sistema
  pgm.createTable('parametros', {
    chave: { type: 'varchar(100)', primaryKey: true },
    valor: { type: 'text', notNull: true },
    descricao: { type: 'varchar(300)' },
    atualizado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    atualizado_por: { type: 'uuid', references: 'usuarios(id)' },
  });

  // Tabela de preços por tipo de veículo
  pgm.createTable('tabela_precos', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    tipo_veiculo: { type: 'tipo_veiculo', notNull: true, unique: true },
    valor: { type: 'numeric(10,2)', notNull: true },
    vigente_de: { type: 'date', notNull: true },
    vigente_ate: { type: 'date' },
    criado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    criado_por: { type: 'uuid', references: 'usuarios(id)' },
  });

  // Veículos / Cadastur Municipal
  pgm.createTable('veiculos', {
    cadastur: { type: 'varchar(15)', primaryKey: true },
    placa: { type: 'varchar(10)', notNull: true, unique: true },
    tipo: { type: 'tipo_veiculo', notNull: true },
    proprietario: { type: 'varchar(200)', notNull: true },
    documento: { type: 'varchar(20)', notNull: true },
    contato: { type: 'varchar(50)' },
    email: { type: 'varchar(200)' },
    data_cadastro: { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
    validade_cadastur: { type: 'date', notNull: true },
    ativo: { type: 'boolean', notNull: true, default: true },
    criado_por: { type: 'uuid', references: 'usuarios(id)', notNull: true },
    atualizado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('veiculos', 'placa');
  pgm.createIndex('veiculos', 'cadastur');

  // Autorizações de entrada
  pgm.createTable('autorizacoes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    cadastur: { type: 'varchar(15)', notNull: true, references: 'veiculos(cadastur)' },
    placa: { type: 'varchar(10)', notNull: true },
    dia_chegada: { type: 'date', notNull: true },
    permanencia: { type: 'integer', notNull: true, default: 1 },
    destino: { type: 'varchar(300)' },
    cadastur_imovel: { type: 'varchar(50)' },
    origem: { type: 'origem_autorizacao', notNull: true, default: 'Google Forms' },
    status: { type: 'status_autorizacao', notNull: true, default: 'autorizada' },
    lancado_por: { type: 'uuid', notNull: true, references: 'usuarios(id)' },
    data_lancamento: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    google_forms_row_id: { type: 'varchar(100)', unique: true },
    motivo_revogacao: { type: 'text' },
    revogado_por: { type: 'uuid', references: 'usuarios(id)' },
    revogado_em: { type: 'timestamp' },
  });

  pgm.createIndex('autorizacoes', 'placa');
  pgm.createIndex('autorizacoes', 'cadastur');
  pgm.createIndex('autorizacoes', 'dia_chegada');
  pgm.createIndex('autorizacoes', 'google_forms_row_id');

  // DAMs (Documentos de Arrecadação Municipal)
  pgm.createTable('dams', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    autorizacao_id: { type: 'uuid', notNull: true, unique: true, references: 'autorizacoes(id)' },
    numero: { type: 'varchar(20)', notNull: true, unique: true },
    valor: { type: 'numeric(10,2)', notNull: true },
    vencimento: { type: 'date', notNull: true },
    linha_digitavel: { type: 'text', notNull: true },
    paga: { type: 'boolean', notNull: true, default: false },
    data_emissao: { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
    data_pagamento: { type: 'date' },
    emitido_por: { type: 'uuid', references: 'usuarios(id)' },
    baixa_por: { type: 'uuid', references: 'usuarios(id)' },
    codigo_verificacao: { type: 'varchar(20)' },
    comprovante_enviado: { type: 'boolean', default: false },
  });

  pgm.createIndex('dams', 'numero');
  pgm.createIndex('dams', 'autorizacao_id');

  // Autuações
  pgm.createTable('autuacoes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    placa: { type: 'varchar(10)', notNull: true },
    motivo: { type: 'text', notNull: true },
    data: { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
    agente_id: { type: 'uuid', notNull: true, references: 'usuarios(id)' },
    criado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('autuacoes', 'placa');

  // Notificações públicas
  pgm.createTable('notificacoes_publicas', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    placa: { type: 'varchar(10)', notNull: true },
    data_consulta: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    email_consulente: { type: 'varchar(200)' },
    email_semset_enviado: { type: 'boolean', default: false },
  });

  pgm.createIndex('notificacoes_publicas', 'placa');

  // Trilha de auditoria
  pgm.createTable('auditoria', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    usuario_id: { type: 'uuid', references: 'usuarios(id)' },
    acao: { type: 'varchar(100)', notNull: true },
    entidade: { type: 'varchar(100)', notNull: true },
    entidade_id: { type: 'varchar(100)' },
    dados_anteriores: { type: 'jsonb' },
    dados_novos: { type: 'jsonb' },
    ip: { type: 'varchar(50)' },
    criado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('auditoria', 'acao');
  pgm.createIndex('auditoria', 'entidade');
  pgm.createIndex('auditoria', 'usuario_id');

  // Cidadãos (consulta pública)
  pgm.createTable('cidadaos', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    email: { type: 'varchar(200)', notNull: true, unique: true },
    criado_em: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('auditoria');
  pgm.dropTable('notificacoes_publicas');
  pgm.dropTable('autuacoes');
  pgm.dropTable('dams');
  pgm.dropTable('autorizacoes');
  pgm.dropTable('veiculos');
  pgm.dropTable('tabela_precos');
  pgm.dropTable('parametros');
  pgm.dropTable('cidadaos');
  pgm.dropTable('usuarios');
  pgm.dropType('origem_autorizacao');
  pgm.dropType('status_autorizacao');
  pgm.dropType('perfil_usuario');
  pgm.dropType('tipo_veiculo');
};
