# Gerenciador de Cartão de Crédito

Sistema profissional para gerenciar empréstimos de cartão de crédito, rastreando usuários, compras parceladas e projetando faturas futuras.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL

## 📋 Funcionalidades

- Dashboard com visão geral do limite usado/disponível
- Cadastro e gestão de devedores
- Registro de compras parceladas (gera parcelas automaticamente)
- Controle de pagamento de parcelas
- Projeção de faturas futuras por mês/devedor
- Interface responsiva (mobile-first)

## 🛠️ Instalação Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### Frontend

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

### Backend

```bash
cd server

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com sua DATABASE_URL

# Criar tabelas no banco
psql -d seu_banco -f db/schema.sql

# Rodar servidor
npm run dev
```

## 🌐 Deploy no Render

### Frontend (Static Site)

1. Criar novo **Static Site** no Render
2. Conectar ao repositório
3. Configurações:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Adicionar variável de ambiente:
   - `VITE_API_URL` = URL do seu backend

### Backend (Web Service)

1. Criar novo **Web Service** no Render
2. Conectar ao repositório
3. Configurações:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Adicionar variáveis de ambiente:
   - `DATABASE_URL` = String de conexão PostgreSQL
   - `NODE_ENV` = `production`

### Banco de Dados

1. Criar **PostgreSQL** no Render (ou usar Supabase/Neon)
2. Executar o script `server/db/schema.sql` no banco
3. Copiar a connection string para a variável `DATABASE_URL`

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── MainLayout.jsx
│   │       └── Sidebar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Devedores.jsx
│   │   ├── DevedorDetalhes.jsx
│   │   ├── NovaCompra.jsx
│   │   └── Faturas.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── server/
│   ├── db/
│   │   └── schema.sql
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## 📄 Licença

MIT
