# SisVetur — Sistema de Gestão de Veículos de Turismo
## Prefeitura Municipal de Guarapari / ES

Sistema web completo para gestão do ciclo de autorização de entrada de veículos de transporte turístico no município de Guarapari (ES), integrando SEMTUR, SEMSET e Secretaria da Fazenda.

---

## Sumário
1. [Visão geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação e execução local](#instalação-e-execução-local)
4. [Variáveis de ambiente](#variáveis-de-ambiente)
5. [Banco de dados](#banco-de-dados)
6. [Testes](#testes)
7. [Implantação em nuvem](#implantação-em-nuvem)
8. [Guia de integração com Google Forms/Sheets](#guia-de-integração-com-google-formssheets)
9. [Perfis e fluxo operacional](#perfis-e-fluxo-operacional)
10. [Pontos de extensão](#pontos-de-extensão)

---

## Visão geral

**Stack:** React 18 + Tailwind CSS (frontend) · Node.js 20 + Express (backend) · PostgreSQL 15 (banco)

**Funcionalidades:**
- Cadastro de veículos com geração automática de **Cadastur Municipal** (CM-AAAA-NNNN)
- Importação e lançamento de autorizações a partir do Google Forms (com idempotência)
- Emissão de **DAM** (Documento de Arrecadação Municipal) em lote diário e manual
- Consulta de placa por perfil de fiscalização com três indicadores (Cadastur, Autorização, Pagamento)
- Portal público com resultado **Regular / Irregular** sem exposição de dados pessoais
- Notificação automática da SEMSET quando placa irregular é consultada
- Trilha de auditoria completa de todas as ações
- Autenticação JWT + duplo fator (TOTP) opcional
- Design responsivo (PWA instalável para uso em campo)

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm 9+

---

## Instalação e execução local

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd turismo

# 2. Backend
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Execute as migrations e o seed de exemplo
npm run migrate
npm run seed

# 4. Inicie o backend (porta 3001)
npm run dev

# 5. Frontend (em outro terminal)
cd ../frontend
npm install
npm run dev
# Acesse http://localhost:5173
```

---

## Variáveis de ambiente

Crie `backend/.env` a partir de `backend/.env.example`:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Segredo JWT (mínimo 32 caracteres) |
| `JWT_EXPIRATION` | Ex.: `8h` |
| `FRONTEND_URL` | URL do frontend (para CORS) |
| `SMTP_*` | Configurações do servidor de e-mail |
| `EMAIL_SEMSET` | E-mail da SEMSET para notificações |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Conta de serviço Google |
| `GOOGLE_PRIVATE_KEY` | Chave privada da conta de serviço |
| `GOOGLE_SHEETS_ID` | ID da planilha do Google Forms |
| `GOOGLE_SHEETS_RANGE` | Ex.: `Respostas ao formulário 1!A:I` |

---

## Banco de dados

```bash
# Criar banco
createdb turismo_guarapari

# Migrations
cd backend
npm run migrate        # Aplica todas as migrations
npm run migrate:down   # Desfaz a última migration

# Seed (dados de exemplo)
npm run seed
```

### Dados de exemplo após o seed

| Placa | Situação esperada | Motivo |
|---|---|---|
| **ABC1D23** | REGULAR | Cadastur vigente + autorização + DAM pago |
| **XYZ9W87** | IRREGULAR | Cadastur vigente + autorização + **DAM pendente** |
| **QRS5T67** | IRREGULAR | **Cadastur vencido** (CM-2025-0099) |

### Credenciais de acesso (senha padrão: `Guarapari@2026`)

| E-mail | Perfil |
|---|---|
| admin@guarapari.es.gov.br | Administrador |
| semtur@guarapari.es.gov.br | SEMTUR |
| semset.aut@guarapari.es.gov.br | SEMSET — Autorização |
| semset.fisc@guarapari.es.gov.br | SEMSET — Fiscalização |
| fazenda@guarapari.es.gov.br | Secretaria da Fazenda |

---

## Testes

```bash
cd backend
npm test
```

Cobertura:
- Regra de liberação (Regular/Irregular) — 5 cenários
- Validação de Cadastur — 4 cenários
- Serviço de DAM — 2 cenários

---

## Implantação em nuvem

### Opção A — Railway (recomendado, custo ~zero no plano Hobby)

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione um serviço PostgreSQL
3. Faça deploy do backend como serviço Node.js, configurando as variáveis de ambiente
4. Faça deploy do frontend como serviço estático (ou Vercel)
5. Configure `FRONTEND_URL` apontando para a URL do frontend

### Opção B — Render

1. Crie um Web Service no [Render](https://render.com) apontando para `/backend`
2. Crie um banco PostgreSQL gerenciado
3. Configure as variáveis e o build command: `npm install && npm run migrate`
4. Para o frontend, crie um Static Site apontando para `/frontend` com build: `npm run build`

### Opção C — Fly.io

Use `fly.toml` com dois apps (api e frontend). O banco pode ser Fly Postgres ou Neon.

---

## Guia de integração com Google Forms/Sheets

### 1. Criar o Google Forms

Crie um formulário com os campos na seguinte ordem (obrigatório para o mapeamento):

| Coluna | Campo | Tipo |
|---|---|---|
| A | (automático) Carimbo de data/hora | — |
| B | Cadastur Municipal | Texto curto |
| C | Placa do veículo | Texto curto |
| D | Tipo do veículo | Múltipla escolha |
| E | Data de chegada | Data |
| F | Dias de permanência | Número |
| G | Destino (hotel/imóvel) | Texto curto |
| H | Cadastur do imóvel (opcional) | Texto curto |
| I | E-mail da operadora | E-mail |

### 2. Configurar a Conta de Serviço Google

```bash
# No Google Cloud Console:
# 1. Crie um projeto
# 2. Ative a Google Sheets API
# 3. Crie uma Service Account (IAM > Contas de serviço)
# 4. Baixe a chave JSON
# 5. Compartilhe a planilha do Forms com o e-mail da Service Account (papel: Leitor)
```

### 3. Configurar as variáveis de ambiente

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=turismo-api@meu-projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GOOGLE_SHEETS_ID=1xXx...  # da URL da planilha
GOOGLE_SHEETS_RANGE=Respostas ao formulário 1!A:I
```

### 4. Importar respostas

Na tela de Autorizações, clique em **↻ Sincronizar Forms**. O sistema:
1. Lê as linhas da planilha
2. Ignora respostas já importadas (idempotência por `timestamp|placa`)
3. Valida o Cadastur — só importa se estiver vigente
4. Lista as autorizações na fila para confirmação da SEMSET

---

## Perfis e fluxo operacional

```
SEMTUR          → Cadastra veículo → gera Cadastur Municipal (CM-2026-NNNN)
Operadora       → Preenche Google Forms
SEMSET (Aut.)   → Sincroniza Forms → Confere → Lança autorização
Fazenda         → Emite DAM (lote às 06h ou manual) → Registra pagamento
SEMSET (Fisc.)  → Consulta placa → REGULAR ou IRREGULAR → Autuação (se irregular)
Cidadão/Público → Consulta placa → Regular / Irregular (sem dados pessoais)
```

---

## Pontos de extensão

### Integração real de pagamento

O serviço de DAM (`backend/src/services/damService.js`) expõe uma interface `provider` com três métodos:
- `gerarNumero()` — número sequencial do DAM
- `gerarLinhaDigitavel(numero, valor)` — linha digitável (código de barras)
- `gerarCodigoVerificacao()` — hash de comprovante

Para integrar com sistema bancário, PIX ou API municipal, crie um novo provider implementando esses três métodos e substitua a constante `provider` no módulo. Nenhum outro arquivo precisa ser alterado.

### Leitura automática da planilha

Atualmente a sincronização é manual (botão). Para automatizar, adicione um cron job em `backend/src/index.js`:

```js
cron.schedule('*/30 * * * *', () => sincronizarForms(), { timezone: 'America/Sao_Paulo' });
```

### Login via Google Workspace

Configure o OAuth 2.0 com `passport-google-oauth20` e valide que o domínio do e-mail seja `@guarapari.es.gov.br` antes de conceder acesso.

### PWA offline

O `manifest.json` já está configurado. Adicione um service worker para caching da tela de fiscalização, permitindo consultas rápidas mesmo com sinal intermitente.

---

## LGPD

- Campos `documento` (CPF/CNPJ), `proprietario` e `email` são restritos aos perfis SEMTUR e ADMIN
- A consulta pública nunca retorna dados pessoais
- Logs de acesso registrados na tabela `auditoria`
- Base legal: execução de política pública municipal (art. 7º, III, LGPD)
- Política de retenção: dados podem ser expurgados ao fim da temporada via script de limpeza (a implementar conforme deliberação municipal)

---

Guarapari/ES · Sistema desenvolvido para a Secretaria de Turismo
