# Portal de Solicitações Internas

Aplicação full stack para que colaboradores registrem demandas internas (TI, RH, Compras, Financeiro, Infraestrutura) e acompanhem sua evolução até a conclusão.

## Funcionalidades

- **Autenticação**: login com usuário e senha, sessão via token JWT e logout.
- **Solicitações**: criar, editar e excluir (edição e exclusão apenas pelo solicitante e enquanto o status for *Aberto*).
- **Gerenciamento**: listagem com código, título, categoria, solicitante, data de abertura e status; consulta de detalhes; alteração de status com histórico.
- **Perfis**: o *Colaborador* vê e gerencia apenas as próprias solicitações; o *Atendente* vê todas, altera o status e gerencia usuários pela API.
- **Filtros**: por período, categoria, status e texto livre no título.
- **Dashboard**: total de solicitações, abertas, em atendimento e concluídas.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js, Express, Prisma ORM, JWT (`jsonwebtoken`), `bcryptjs` |
| Frontend | React 19, TypeScript, Vite, React Router |
| Banco de dados | PostgreSQL |

## Estrutura do projeto

```
internal-portal-system/
├── backend/
│   ├── database/        # Scripts SQL: 01-schema.sql (tabelas) e 02-seed.sql (dados iniciais)
│   ├── prisma/          # schema.prisma (mapeamento das tabelas)
│   └── src/
│       ├── controllers/ # Regras de negócio e validações
│       ├── routes/      # Definição dos endpoints
│       ├── services/    # Conexão com o banco e middleware de autenticação
│       └── server.js    # Ponto de entrada da API
└── frontend/
    └── src/
        ├── components/  # Componentes compartilhados (rota protegida)
        ├── pages/       # Login e Home (dashboard, filtros, listagem, modais)
        └── services/    # Cliente da API, tipos e formatação
```

## Pré-requisitos

- **Node.js** 20 ou superior (com npm)
- **PostgreSQL** 14 ou superior, em execução
- **Git**

## Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd internal-portal-system
```

### 2. Banco de dados

Crie um banco vazio chamado `internal_bd`. Pelo `psql`:

```bash
psql -U postgres -c "CREATE DATABASE internal_bd;"
```

Ou, pelo pgAdmin: botão direito em *Databases* → *Create* → *Database* → nome `internal_bd`.

As tabelas e os dados iniciais são criados no passo 3.

### 3. Backend

```bash
cd backend
npm install
```

Crie o arquivo de configuração a partir do exemplo:

```bash
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env
```

Edite o `backend/.env` e ajuste usuário, senha e porta do seu PostgreSQL em `DATABASE_URL` (veja [Configuração](#configuração)).

Depois, crie as tabelas, carregue os dados iniciais e gere o cliente do Prisma:

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

Também é possível abrir os dois arquivos na *Query Tool* do pgAdmin e executá-los nessa ordem.
</details>

### 4. Frontend

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
```

## Configuração

### Variáveis de ambiente do backend (`backend/.env`)

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta da API | `3333` |
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgresql://postgres:sua_senha@localhost:5432/internal_bd` |
| `JWT_SECRET` | Segredo usado para assinar os tokens | texto longo e aleatório |
| `JWT_EXPIRES_IN` | Validade do token | `8h` |
| `CORS_ORIGIN` | Origens autorizadas, separadas por vírgula | `http://localhost:5173` |

Se a senha do banco tiver caracteres especiais (`@`, `#`, `/` etc.), eles devem ser codificados na `DATABASE_URL` (por exemplo, `@` vira `%40`).

### Variáveis de ambiente do frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `VITE_API_URL` | Endereço da API | `http://localhost:3333` |

O valor deve apontar para a mesma porta definida em `PORT` no backend.

### Credenciais de demonstração

Criadas pelo script `02-seed.sql`:

| Usuário | Senha | Perfil |
| --- | --- | --- |
| `maria` | `123456` | Colaborador |
| `joao` | `123456` | Colaborador |
| `ana` | `123456` | Atendente |

## Execução

São necessários dois terminais.

**Backend**

```bash
cd backend
npm run dev
```

A API sobe em `http://localhost:3333` e exibe `API pronta na porta 3333; conexão com PostgreSQL confirmada.`

**Frontend**

```bash
cd frontend
npm run dev
```

## Acesso

Abra `http://localhost:5173` no navegador e entre com um dos usuários de demonstração: `maria` / `123456` para abrir solicitações, `ana` / `123456` para atendê-las e alterar o status.

## Endpoints da API

Todas as rotas, exceto o login, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/login` | Autentica e retorna o token e os dados do usuário |
| GET | `/api/category` | Lista as categorias ativas |
| GET | `/api/request` | Lista solicitações (filtros: `categoria`, `status`, `dataInicio`, `dataFim`, `texto`) |
| GET | `/api/request/dashboard` | Indicadores do dashboard |
| GET | `/api/request/:id` | Detalhes de uma solicitação |
| POST | `/api/request` | Cria uma solicitação |
| PUT | `/api/request/:id` | Edita uma solicitação aberta |
| DELETE | `/api/request/:id` | Exclui uma solicitação aberta |
| PATCH | `/api/request/:id/status` | Altera o status e registra no histórico (somente Atendente) |
| GET | `/api/history/:solicitacaoId` | Histórico de status de uma solicitação |
| GET, POST, PUT, DELETE | `/api/user` | Gerenciamento de usuários (somente Atendente) |

Listagem, detalhes, histórico e dashboard consideram apenas as solicitações visíveis para o usuário autenticado. Erros retornam `{ "message": "..." }` com o código HTTP adequado (400, 401, 403, 404, 409).

## Problemas comuns

- **`Não foi possível conectar ao PostgreSQL`**: verifique se o PostgreSQL está em execução e se usuário, senha, porta e nome do banco em `DATABASE_URL` estão corretos.
- **`EADDRINUSE`**: a porta já está em uso. Encerre o outro processo ou altere `PORT` no `backend/.env` (e `VITE_API_URL` no frontend).
- **`@prisma/client did not initialize yet`**: execute `npx prisma generate` na pasta `backend`.
- **Erro de CORS no navegador**: inclua o endereço do frontend em `CORS_ORIGIN` e reinicie o backend.
- **`Não foi possível conectar ao servidor` na tela de login**: confirme que o backend está rodando e que `VITE_API_URL` aponta para ele. Após alterar o `.env` do frontend, reinicie o `npm run dev`.
