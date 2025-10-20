# 🌐 Sheriff Bot Website - Hospedagem Separada na Vertra Cloud

O website foi removido do projeto do bot para hospedagem **separada na Vertra Cloud**.

## 📦 Conteúdo do website.zip (21 KB)

- **server.ts** - Servidor Express com Stripe
- **routes/dashboard.ts** - API do dashboard com Discord OAuth  
- **index.html** - Homepage
- **shop.html** - Loja com 4 upgrades ($2.99-$9.99)
- **dashboard.html** - Dashboard
- **success.html / cancel.html** - Páginas de pagamento

---

## 🚀 Como Hospedar na Vertra Cloud

### 1. Preparar o projeto

Extrair arquivos do zip:
```bash
unzip website.zip
```

Criar `package.json`:
```json
{
  "name": "sheriff-bot-website",
  "version": "1.0.0",
  "main": "server.ts",
  "scripts": {
    "start": "ts-node server.ts",
    "build": "tsc",
    "dev": "ts-node server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "stripe": "^14.0.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "ts-node": "^10.9.0",
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "@types/express-session": "^1.17.0"
  }
}
```

### 2. Configurar variáveis de ambiente

Na **Vertra Cloud Dashboard**, adicione:
```env
DISCORD_CLIENT_ID=1426734768111747284
DISCORD_CLIENT_SECRET=seu_secret_aqui
DISCORD_TOKEN=seu_token_aqui

STRIPE_SECRET_KEY=sk_live_sua_chave
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave

SESSION_SECRET=chave_aleatoria_32_caracteres

PORT=8080
NODE_ENV=production
```

### 3. Deploy na Vertra Cloud

1. Acesse https://vertracloud.app
2. Crie uma nova aplicação (tipo: Node.js/Website)
3. Faça upload dos arquivos ou conecte via Git
4. Configure as variáveis de ambiente
5. Defina comando de start: `npm start` ou `ts-node server.ts`
6. Clique em "Deploy"

**Documentação:** https://coffelify.mintlify.app/introduction

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
- Configure webhook: `https://seu-app.vertracloud.app/webhook`
- Bot e website compartilham `data/redemption-codes.json`
- Para produção, considere usar PostgreSQL (Vertra Cloud oferece databases)
- Vertra Cloud suporta PostgreSQL, MongoDB e Redis nativamente

---

## 🛠️ Troubleshooting

**Website não inicia:** Verifique variáveis de ambiente
**Pagamentos falham:** Confirme chaves Stripe LIVE
**Dashboard vazio:** Verifique DISCORD_CLIENT_SECRET
