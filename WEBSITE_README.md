# 🌐 Website Archive

O website do Sheriff Bot foi arquivado em `website.zip` para manter o bot focado apenas nas funcionalidades do Discord.

## 📦 Conteúdo do ZIP

O arquivo `website.zip` contém:
- HTML pages (index, dashboard, shop, success, cancel)
- CSS stylesheets
- JavaScript client-side code  
- Assets (images, logos, icons)
- Express server routes

## 🔄 Como Restaurar o Website

Se você quiser executar o website novamente:

### 1. Extrair o ZIP
```bash
# Usando Node.js
node -e "const AdmZip = require('adm-zip'); const zip = new AdmZip('website.zip'); zip.extractAllTo('./', true); console.log('✅ Website extraído');"
```

### 2. Descomentar no src/index.ts

Encontre estas linhas (por volta da linha 203):
```typescript
// console.log('\n🌐 Starting website server...');
// require('../website/server');
// console.log('✅ Website started successfully!');
```

Remova os comentários:
```typescript
console.log('\n🌐 Starting website server...');
require('../website/server');
console.log('✅ Website started successfully!');
```

### 3. Reiniciar o Bot

O bot agora irá iniciar o website na porta 5000 junto com o Discord bot.

## ⚙️ Configuração do Website

O website requer algumas variáveis de ambiente:

**Obrigatórias:**
- `DISCORD_CLIENT_SECRET` - OAuth secret para login com Discord
- `SESSION_SECRET` - Chave secreta para sessões

**Opcionais (para pagamentos):**
- `STRIPE_SECRET_KEY` - Chave secreta do Stripe
- `STRIPE_PUBLISHABLE_KEY` - Chave pública do Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret para webhooks

## 📝 Notas

- O website foi removido do runtime padrão para simplificar o bot
- Todos os arquivos estão preservados no ZIP
- Nenhuma funcionalidade foi perdida, apenas arquivada
