require('dotenv').config();
const { pool } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Populando dados de exemplo...');

    // Usuários
    const senhaHash = await bcrypt.hash('Guarapari@2026', 12);
    const usuarios = [
      { id: uuidv4(), nome: 'Admin Sistema', email: 'admin@guarapari.es.gov.br', perfil: 'ADMIN', senha_hash: senhaHash },
      { id: uuidv4(), nome: 'Ana Paula Semtur', email: 'semtur@guarapari.es.gov.br', perfil: 'SEMTUR', senha_hash: senhaHash },
      { id: uuidv4(), nome: 'Carlos Semset Aut.', email: 'semset.aut@guarapari.es.gov.br', perfil: 'SEMSET_AUTORIZACAO', senha_hash: senhaHash },
      { id: uuidv4(), nome: 'Marcos Semset Fisc.', email: 'semset.fisc@guarapari.es.gov.br', perfil: 'SEMSET_FISCALIZACAO', senha_hash: senhaHash },
      { id: uuidv4(), nome: 'Luciana Fazenda', email: 'fazenda@guarapari.es.gov.br', perfil: 'FAZENDA', senha_hash: senhaHash },
    ];

    for (const u of usuarios) {
      await client.query(
        `INSERT INTO usuarios (id, nome, email, perfil, senha_hash) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING`,
        [u.id, u.nome, u.email, u.perfil, u.senha_hash]
      );
    }
    console.log('✓ Usuários criados (senha padrão: Guarapari@2026)');

    // Busca ID do usuário SEMTUR para referenciar
    const { rows: [semturUser] } = await client.query(`SELECT id FROM usuarios WHERE perfil='SEMTUR' LIMIT 1`);
    const { rows: [semsetUser] } = await client.query(`SELECT id FROM usuarios WHERE perfil='SEMSET_AUTORIZACAO' LIMIT 1`);
    const { rows: [fazendaUser] } = await client.query(`SELECT id FROM usuarios WHERE perfil='FAZENDA' LIMIT 1`);

    // Parâmetros
    await client.query(`
      INSERT INTO parametros (chave, valor, descricao) VALUES
        ('fim_temporada', '2026-12-31', 'Data de fim da temporada vigente (validade padrão do Cadastur)'),
        ('dias_validade_dam', '3', 'Dias de vencimento do DAM após emissão'),
        ('notificar_semset_irregulares', 'true', 'Enviar e-mail à SEMSET quando placa irregular for consultada')
      ON CONFLICT (chave) DO NOTHING
    `);
    console.log('✓ Parâmetros criados');

    // Tabela de preços (valores de exemplo, parametrizável)
    await client.query(`
      INSERT INTO tabela_precos (tipo_veiculo, valor, vigente_de) VALUES
        ('Carro/Receptivo', 50.00, '2026-01-01'),
        ('Van', 80.00, '2026-01-01'),
        ('Micro-ônibus', 120.00, '2026-01-01'),
        ('Ônibus', 180.00, '2026-01-01')
      ON CONFLICT (tipo_veiculo) DO NOTHING
    `);
    console.log('✓ Tabela de preços criada (valores de exemplo)');

    // Veículos — 3 exemplos
    const veiculos = [
      {
        cadastur: 'CM-2026-0001',
        placa: 'ABC1D23',
        tipo: 'Van',
        proprietario: 'Turismo Litoral Ltda.',
        documento: '12.345.678/0001-90',
        contato: '(27) 99999-1111',
        email: 'contato@turismlitoral.com.br',
        validade_cadastur: '2026-12-31',
        criado_por: semturUser.id,
      },
      {
        cadastur: 'CM-2026-0002',
        placa: 'XYZ9W87',
        tipo: 'Ônibus',
        proprietario: 'Viagens Capixabas S/A',
        documento: '98.765.432/0001-10',
        contato: '(27) 99999-2222',
        email: 'adm@viagenscapixabas.com.br',
        validade_cadastur: '2026-12-31',
        criado_por: semturUser.id,
      },
      {
        cadastur: 'CM-2025-0099',
        placa: 'QRS5T67',
        tipo: 'Carro/Receptivo',
        proprietario: 'João das Pedras Receptivo ME',
        documento: '123.456.789-00',
        contato: '(27) 99999-3333',
        email: 'joao@receptivo.com',
        validade_cadastur: '2025-12-31', // VENCIDO (para teste)
        criado_por: semturUser.id,
      },
    ];

    for (const v of veiculos) {
      await client.query(
        `INSERT INTO veiculos (cadastur, placa, tipo, proprietario, documento, contato, email, validade_cadastur, criado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (cadastur) DO NOTHING`,
        [v.cadastur, v.placa, v.tipo, v.proprietario, v.documento, v.contato, v.email, v.validade_cadastur, v.criado_por]
      );
    }
    console.log('✓ Veículos criados (CM-2026-0001 e CM-2026-0002 vigentes, CM-2025-0099 vencido)');

    // Autorizações
    const hoje = new Date().toISOString().split('T')[0];
    const autId1 = uuidv4();
    const autId2 = uuidv4();

    await client.query(
      `INSERT INTO autorizacoes (id, cadastur, placa, dia_chegada, permanencia, destino, origem, status, lancado_por, google_forms_row_id)
       VALUES ($1,'CM-2026-0001','ABC1D23',$2,3,'Hotel Costa Mar','Google Forms','autorizada',$3,'FORMS-ROW-001')
       ON CONFLICT (id) DO NOTHING`,
      [autId1, hoje, semsetUser.id]
    );

    await client.query(
      `INSERT INTO autorizacoes (id, cadastur, placa, dia_chegada, permanencia, destino, origem, status, lancado_por, google_forms_row_id)
       VALUES ($1,'CM-2026-0002','XYZ9W87',$2,1,'Pousada Pedra do Cangá','Google Forms','autorizada',$3,'FORMS-ROW-002')
       ON CONFLICT (id) DO NOTHING`,
      [autId2, hoje, semsetUser.id]
    );
    console.log('✓ Autorizações criadas');

    // DAM pago para ABC1D23
    const damNum1 = `DAM-${new Date().getFullYear()}-000001`;
    await client.query(
      `INSERT INTO dams (autorizacao_id, numero, valor, vencimento, linha_digitavel, paga, data_pagamento, emitido_por, baixa_por, codigo_verificacao)
       VALUES ($1,$2,80.00,CURRENT_DATE + INTERVAL '3 days',$3,true,CURRENT_DATE,$4,$5,'COMP-2026-ABCD')
       ON CONFLICT (autorizacao_id) DO NOTHING`,
      [autId1, damNum1, `89890.00000 00000.000000 00000.000000 1 00000000008000`, fazendaUser.id, fazendaUser.id]
    );

    // DAM pendente para XYZ9W87
    const damNum2 = `DAM-${new Date().getFullYear()}-000002`;
    await client.query(
      `INSERT INTO dams (autorizacao_id, numero, valor, vencimento, linha_digitavel, paga, emitido_por)
       VALUES ($1,$2,180.00,CURRENT_DATE + INTERVAL '3 days',$3,false,$4)
       ON CONFLICT (autorizacao_id) DO NOTHING`,
      [autId2, damNum2, `89890.00000 00000.000000 00000.000000 1 00000000018000`, fazendaUser.id]
    );
    console.log('✓ DAMs criados (ABC1D23=pago, XYZ9W87=pendente)');

    await client.query('COMMIT');
    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\nCredenciais de acesso (todos com senha: Guarapari@2026):');
    console.log('  Admin:              admin@guarapari.es.gov.br');
    console.log('  SEMTUR:             semtur@guarapari.es.gov.br');
    console.log('  SEMSET Autorização: semset.aut@guarapari.es.gov.br');
    console.log('  SEMSET Fiscalização:semset.fisc@guarapari.es.gov.br');
    console.log('  Fazenda:            fazenda@guarapari.es.gov.br');
    console.log('\nPlacas de teste:');
    console.log('  ABC1D23 - REGULAR (Cadastur vigente + autorização + DAM pago)');
    console.log('  XYZ9W87 - IRREGULAR (Cadastur vigente + autorização + DAM pendente)');
    console.log('  QRS5T67 - IRREGULAR (Cadastur vencido)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro no seed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
