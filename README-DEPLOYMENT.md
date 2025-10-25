# Deployment no Vertra Cloud (Replit)

## ✅ Configuração Completa

Este bot está configurado para deployment no Vertra Cloud usando **Reserved VM** (sempre online).

### 📋 Configuração de Deployment

**Tipo:** Reserved VM (para bots Discord que precisam estar sempre online)
- **Build:** `npm run build` (compila TypeScript para JavaScript)
- **Run:** `npm run start:shard` (inicia o bot com otimização de memória)

### 🔐 Variáveis de Ambiente Necessárias

Antes de publicar, configure estas variáveis no painel do Replit:

**Obrigatórias:**
- `DISCORD_TOKEN` - Token do seu bot Discord
- `DISCORD_CLIENT_ID` - ID do cliente Discord
- `DATABASE_URL` - ✅ Já configurado automaticamente

**Opcionais:**
- `DISCORD_CLIENT_SECRET` - Para Linked Roles
- `STRIPE_SECRET_KEY` - Para pagamentos com Stripe
- `SESSION_SECRET` - ✅ Já configurado
- `OWNER_ID` - Seu ID de usuário Discord (para comandos admin)

### 🚀 Como Publicar

1. Clique em **Deploy** (ou **Publish**) no topo do Replit
2. Selecione **Reserved VM**
3. Clique em **Publish**
4. Aguarde o build e deployment completarem

### 📊 Banco de Dados PostgreSQL

✅ O banco de dados PostgreSQL está **completamente configurado**:
- 12 tabelas criadas (users, inventory, mining_sessions, bounties, etc.)
- Sistema de storage em `server/storage.ts`
- Migrações disponíveis via `npm run db:migrate`

### 🛠️ Scripts Disponíveis

**Desenvolvimento:**
- `npm run dev` - Inicia bot em modo desenvolvimento
- `npm run dev:shard` - Inicia bot com sharding

**Produção:**
- `npm run start` - Inicia bot compilado
- `npm run start:shard` - Inicia bot com sharding (usado no deploy)
- `npm run build` - Compila TypeScript

**Banco de Dados:**
- `npm run db:push` - Atualiza schema do banco
- `npm run db:studio` - Interface visual do banco
- `npm run db:migrate` - Migra dados JSON para PostgreSQL

### 💡 Dicas

1. **Memória otimizada:** O bot usa `--max-old-space-size=1024` para gerenciamento eficiente
2. **Sharding:** Suporta múltiplos servidores Discord automaticamente
3. **Cache:** Sistema de cache otimizado para performance
4. **PostgreSQL:** Todos os dados são salvos permanentemente no banco

### 🔍 Monitoramento

Após o deployment:
- Veja logs em tempo real no painel do Replit
- Use `npm run health` para verificar status
- Dados persistem automaticamente no PostgreSQL

---

**Nota:** Se encontrar erros de "missing environment variables" após deploy, adicione as variáveis obrigatórias no painel Secrets do Replit.
