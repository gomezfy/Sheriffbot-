# 🌐 Sheriff Bot Website - Hospedagem Separada na Discloud

O website foi removido do projeto do bot para hospedagem **separada na Discloud**.

## 📦 Conteúdo do website.zip (21 KB)

- **server.ts** - Servidor Express com Stripe
- **routes/dashboard.ts** - API do dashboard com Discord OAuth  
- **index.html** - Homepage
- **shop.html** - Loja com 4 upgrades ($2.99-$9.99)
- **dashboard.html** - Dashboard
- **success.html / cancel.html** - Páginas de pagamento

---

## 🚀 Como Hospedar na Discloud

### 1. Extrair arquivos
```bash
unzip website.zip
```

### 2. Instalar dependências
```bash
npm install express express-session stripe axios typescript ts-node @types/express @types/express-session @types/node
```

### 3. Configurar variáveis de ambiente

Crie `.env`:
```env
DISCORD_CLIENT_ID=1426734768111747284
DISCORD_CLIENT_SECRET=seu_secret_aqui
DISCORD_TOKEN=seu_token_aqui

STRIPE_SECRET_KEY=sk_live_sua_chave
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave

SESSION_SECRET=chave_aleatoria_32_caracteres

PORT=8080
```

### 4. Criar discloud.config
```
ID=seu_app_id
TYPE=site
MAIN=server.ts
RAM=512
AUTORESTART=true
VERSION=latest
```

### 5. Deploy
```bash
discloud upload
```

---

## ⚙️ Features

### 🏪 Shop E-commerce
- 4 upgrades de mochila ($2.99 - $9.99)
- Checkout Stripe completo
- Códigos de resgate automáticos

### 📊 Dashboard
- Login Discord OAuth
- Configurações do servidor
- Estatísticas

### 🔗 Integração com Bot
Usuários compram no site e resgatam no Discord:
```
/redeem code:ABC123
```

---

## 📝 Notas Importantes

- Use chaves **LIVE** do Stripe para produção
- Configure webhook: `https://seu-dominio.discloud.app/webhook`
- Bot e website compartilham `data/redemption-codes.json`
- Para produção, use PostgreSQL em vez de JSON

---

## 🛠️ Troubleshooting

**Website não inicia:** Verifique variáveis de ambiente
**Pagamentos falham:** Confirme chaves Stripe LIVE
**Dashboard vazio:** Verifique DISCORD_CLIENT_SECRET
