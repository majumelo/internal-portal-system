# Portal de Solicitações Internas

Aplicação full stack em que colaboradores registram demandas internas (TI, RH, Compras, Financeiro, Infraestrutura) e acompanham cada uma até a conclusão, enquanto atendentes gerenciam o andamento.

## Sumário

- [Demonstração em vídeo](#demonstração-em-vídeo)
- [Funcionalidades](#funcionalidades)
- [Perfis de acesso](#perfis-de-acesso)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Acesso](#acesso)
- [Endpoints da API](#endpoints-da-api)
- [Problemas comuns](#problemas-comuns)

## Demonstração em vídeo

O vídeo [Portal_interno.mp4](Portal_interno.mp4) mostra, de forma curta e prática, o passo a passo para rodar a aplicação e o sistema em funcionamento.

## Funcionalidades

- **Autenticação**: login com usuário e senha, sessão via token JWT e logout.
- **Solicitações**: criar, editar e excluir (edição e exclusão apenas pelo solicitante e enquanto o status for Aberto).
- **Gerenciamento**: listagem com código, título, categoria, solicitante, data de abertura e status; consulta de detalhes; alteração de status com histórico. O status segue o fluxo Aberto → Em Atendimento → Concluído, sem retorno; Concluído é final.
- **Perfis**: o Colaborador vê e gerencia apenas as próprias solicitações; o Atendente vê todas, altera o status e gerencia usuários pela API.
- **Filtros**: por período, categoria, status e texto livre no título.
- **Dashboard**: total de solicitações, abertas, em atendimento e concluídas.

## Perfis de acesso

| Ação | Colaborador | Atendente |
| --- | :---: | :---: |
| Abrir solicitação | ✔ | ✔ |
| Editar / excluir a própria solicitação enquanto estiver Aberta | ✔ | ✔ |
| Ver solicitações | Apenas as próprias | Todas |
| Alterar status | — | ✔ |
| Gerenciar usuários (pela API) | — | ✔ |

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js 20+, Express 4, Prisma ORM 5, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv` |
| Frontend | React 19, TypeScript, Vite, React Router 7, CSS puro |
| Banco de dados | PostgreSQL 14+ (extensão `pgcrypto` no seed) |

## Estrutura do projeto

```
internal-portal-system/
├── backend/
│   ├── database/        # 01-schema.sql (tabelas) e 02-seed.sql (dados iniciais)
│   ├── prisma/          # schema.prisma (mapeamento das tabelas para o Prisma)
│   └── src/
│       ├── config/      # Conexão com o banco (Prisma) e variáveis de ambiente
│       ├── controllers/ # Regras de negócio e validações
│       ├── middlewares/ # Autenticação, perfil e tratamento global de erros
│       ├── routes/      # Definição dos endpoints
│       ├── validators/  # Funções de validação e visibilidade por perfil
│       └── server.js    # Ponto de entrada da API
└── frontend/
    └── src/
        ├── components/  # Componentes compartilhados (rota protegida)
        ├── pages/       # Login, Home (dashboard, filtros, listagem, modais) e página 404
        └── services/    # Cliente da API, tipos e formatação
```

## Pré-requisitos

| Item | Versão | Observação |
| --- | --- | --- |
| Node.js (com npm) | 20 ou superior | Linguagem do backend e ferramenta de build do frontend |
| PostgreSQL | 14 ou superior | Deve estar em execução |
| Git | qualquer | Para clonar o repositório |

Para confirmar que o Node.js e o npm estão instalados, rode no terminal:

```bash
node -v
npm -v
```

Os dois comandos devem exibir um número de versão. Se aparecer um erro dizendo que o termo `npm` não é reconhecido, veja [Problemas comuns](#problemas-comuns).

As demais dependências são instaladas pelo `npm install` de cada pasta (listadas em `backend/package.json` e `frontend/package.json`).

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/majumelo/internal-portal-system.git
cd internal-portal-system
```

### 2. Banco de dados

Crie um banco vazio chamado `internal_bd`:

```bash
psql -U postgres -c "CREATE DATABASE internal_bd;"
```

Ou, no pgAdmin: botão direito em Databases → Create → Database → nome `internal_bd`.

As tabelas e os dados iniciais são criados no passo 3.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env
```

> **Observação:** o backend só lê o arquivo `.env`. O arquivo `backend/.env.example` é apenas um modelo e precisa ser copiado (ou renomeado) para `backend/.env`; o comando acima já faz essa cópia. Sem o `.env`, a API não encontra a conexão com o banco nem o segredo do JWT.

Edite o `backend/.env` e ajuste usuário, senha e porta do seu PostgreSQL em `DATABASE_URL` (veja [Configuração](#configuração)). Depois:

```bash
npm run db:setup
```

Esse comando executa, em ordem, `database/01-schema.sql`, `database/02-seed.sql` e `prisma generate`. Os scripts podem ser executados mais de uma vez sem duplicar dados.

<details>
<summary>Alternativa: executar os scripts SQL manualmente</summary>

```bash
psql -U postgres -d internal_bd -f database/01-schema.sql
psql -U postgres -d internal_bd -f database/02-seed.sql
npx prisma generate
```

Também é possível abrir os dois arquivos na Query Tool do pgAdmin e executá-los nessa ordem.
</details>

### 4. Frontend

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env
```

> **Observação:** assim como no backend, o arquivo `frontend/.env.example` é apenas um modelo e precisa ser copiado (ou renomeado) para `frontend/.env`; o comando acima já faz essa cópia. Sem o `.env`, o frontend não sabe o endereço da API e o login falha.

## Configuração

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta da API | `3333` |
| `DATABASE_URL` | Conexão com o PostgreSQL | `postgresql://postgres:sua_senha@localhost:5432/internal_bd` |
| `JWT_SECRET` | Segredo usado para assinar os tokens | texto longo e aleatório |
| `JWT_EXPIRES_IN` | Validade do token | `8h` |
| `CORS_ORIGIN` | Origens autorizadas, separadas por vírgula | `http://localhost:5173` |

Se a senha do banco tiver caracteres especiais (`@`, `#`, `/` etc.), codifique-os na `DATABASE_URL` (por exemplo, `@` vira `%40`).

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `VITE_API_URL` | Endereço da API | `http://localhost:3333` |

O valor deve usar a mesma porta definida em `PORT` no backend.

### Credenciais de demonstração

Criadas pelo `02-seed.sql`:

| Usuário | Senha | Perfil |
| --- | --- | --- |
| `maria` | `123456` | Colaborador |
| `layanne` | `123456` | Colaborador |
| `ana` | `123456` | Atendente |

## Execução

São necessários dois terminais.

| Parte | Comando (na pasta) | Endereço |
| --- | --- | --- |
| Backend | `npm run dev` em `backend/` | `http://localhost:3333` |
| Frontend | `npm run dev` em `frontend/` | `http://localhost:5173` |

Com a API no ar, o terminal exibe `API pronta na porta 3333; conexão com PostgreSQL confirmada.`

<details>
<summary>Outros scripts disponíveis</summary>

| Pasta | Script | O que faz |
| --- | --- | --- |
| backend | `npm start` | Sobe a API sem recarregamento automático |
| backend | `npm run db:schema` | Executa apenas o script de criação das tabelas |
| backend | `npm run db:seed` | Executa apenas o script de dados iniciais |
| frontend | `npm run build` | Verifica os tipos e gera a versão de produção em `dist/` |
| frontend | `npm run preview` | Serve localmente a versão gerada pelo build |
| frontend | `npm run lint` | Executa o oxlint |
</details>

## Acesso

Abra `http://localhost:5173` e entre com um usuário de demonstração. Um roteiro rápido para testar o fluxo completo:

1. Entre como `maria` e abra uma solicitação.
2. Edite ou exclua a solicitação enquanto ela estiver Aberta.
3. Saia e entre como `ana`: todas as solicitações aparecem. Abra os detalhes e altere o status para Em Atendimento com uma observação.
4. Volte como `maria`: a solicitação não pode mais ser editada, e o histórico mostra a mudança.
5. Use os filtros e acompanhe os números do dashboard.

## Endpoints da API

Todas as rotas, exceto o login, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição | Perfil |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Autentica e retorna o token e os dados do usuário | Público |
| GET | `/api/category` | Lista as categorias ativas | Todos |
| GET | `/api/request` | Lista solicitações (filtros: `categoria`, `status`, `dataInicio`, `dataFim`, `texto`) | Todos |
| GET | `/api/request/dashboard` | Indicadores do dashboard | Todos |
| GET | `/api/request/:id` | Detalhes de uma solicitação | Todos |
| POST | `/api/request` | Cria uma solicitação | Todos |
| PUT | `/api/request/:id` | Edita uma solicitação aberta (somente o solicitante) | Todos |
| DELETE | `/api/request/:id` | Exclui uma solicitação aberta (somente o solicitante) | Todos |
| PATCH | `/api/request/:id/status` | Avança o status para a próxima etapa e registra no histórico | Atendente |
| GET | `/api/history/:solicitacaoId` | Histórico de status de uma solicitação | Todos |
| GET, POST | `/api/user` | Lista e cria usuários | Atendente |
| GET, PUT, DELETE | `/api/user/:id` | Consulta, edita e exclui um usuário | Atendente |

Listagem, detalhes, histórico e dashboard consideram apenas as solicitações visíveis para o usuário autenticado.

<details>
<summary>Exemplos de requisição e resposta</summary>

```http
POST /api/auth/login
Content-Type: application/json

{ "login": "maria", "senha": "123456" }
```

```json
{ "token": "eyJhbGciOi...", "usuario": { "id": 1, "nome": "Maria Julia", "login": "maria", "perfil": "COLABORADOR" } }
```

```http
GET /api/request?status=ABERTO&dataInicio=2026-10-01&texto=impressora
Authorization: Bearer eyJhbGciOi...
```

```http
PATCH /api/request/5/status
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{ "status": "EM_ATENDIMENTO", "observacao": "Técnico a caminho" }
```

Erros sempre retornam `{ "message": "..." }`:

| Código | Quando |
| --- | --- |
| 400 | Dados inválidos ou regra de negócio violada (ex.: editar solicitação não aberta) |
| 401 | Token ausente, inválido ou expirado; login incorreto |
| 403 | Perfil sem permissão ou solicitação de outro usuário |
| 404 | Registro não encontrado |
| 409 | Conflito (login já existente, usuário com vínculos, transição de status fora do fluxo) |
</details>

## Problemas comuns

- **`npm : O termo 'npm' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa operável`** (ou `'npm' não é reconhecido como um comando interno ou externo`): o Node.js não está instalado ou o terminal não o encontra no `PATH`. Para resolver:
  1. Baixe e instale a versão LTS do Node.js em [nodejs.org](https://nodejs.org/) (o npm vem junto). No instalador, mantenha marcada a opção **Add to PATH**.
  2. **Feche e abra novamente** o terminal (e o VS Code, se estiver usando o terminal integrado). Terminais abertos antes da instalação não reconhecem o comando.
  3. Confirme com `node -v` e `npm -v`. Se ainda não funcionar, verifique se `C:\Program Files\nodejs\` está na variável de ambiente `Path` do Windows (Configurações → Sistema → Sobre → Configurações avançadas do sistema → Variáveis de Ambiente) e reinicie o computador.
- **`npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada neste sistema`** (PowerShell): a política de execução do Windows está bloqueando o script do npm. Execute uma vez no PowerShell `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, confirme e abra um novo terminal. Outra opção é usar o Prompt de Comando (`cmd`) em vez do PowerShell.
- **`Não foi possível conectar ao PostgreSQL`**: confira se o PostgreSQL está em execução e se usuário, senha, porta e nome do banco em `DATABASE_URL` estão corretos.
- **`EADDRINUSE`**: a porta já está em uso. Encerre o outro processo ou altere `PORT` no `backend/.env` (e `VITE_API_URL` no frontend).
- **`@prisma/client did not initialize yet`**: execute `npx prisma generate` na pasta `backend`.
- **Erro de CORS no navegador**: inclua o endereço do frontend em `CORS_ORIGIN` e reinicie o backend.
- **`Não foi possível conectar ao servidor` na tela de login**: confirme que o backend está rodando e que `VITE_API_URL` aponta para ele. Após alterar o `.env` do frontend, reinicie o `npm run dev`.

## Autora

Maria Júlia — [github.com/majumelo](https://github.com/majumelo)
