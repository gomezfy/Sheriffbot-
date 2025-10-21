# Hotmart Integration Setup - Sheriff Bot Website

## 📋 Requisitos

- Node.js 20+
- Conta Hotmart (Producer/Afiliado)
- Express + TypeScript
- Produtos criados na plataforma Hotmart

## 🔑 Obtendo Credenciais Hotmart

### 1. Criar Conta Hotmart

1. Acesse [hotmart.com](https://hotmart.com)
2. Crie uma conta como Produtor (se você vende produtos digitais)
3. Faça login no painel Hotmart

### 2. Criar Produtos Digitais

Para cada pacote no seu bot, você precisará criar um produto correspondente na Hotmart:

1. Acesse **Produtos** → **Novo Produto**
2. Configure cada produto:
   - **Starter Pack** ($1.99) → Crie produto na Hotmart
   - **Popular Pack** ($4.99) → Crie produto na Hotmart
   - **Gold Pack** ($9.99) → Crie produto na Hotmart
   - **Ultimate Pack** ($19.99) → Crie produto na Hotmart
   - **Backpack 200kg** ($2.99) → Crie produto na Hotmart
   - **Backpack 300kg** ($4.99) → Crie produto na Hotmart
   - **Backpack 400kg** ($6.99) → Crie produto na Hotmart
   - **Backpack 500kg** ($9.99) → Crie produto na Hotmart

3. Após criar, copie o **ID do produto** (aparece na URL do produto)

### 3. Configurar HotConnect (API)

1. Acesse [developers.hotmart.com](https://developers.hotmart.com)
2. Faça login com sua conta Hotmart
3. Vá em **Applications** → **Create Application**
4. Preencha:
   - **Nome**: Sheriff Bot Store
   - **Description**: Bot Discord Store Integration
5. Após criar, copie:
   - **Client ID**
   - **Client Secret**

### 4. Configurar Webhook

1. Acesse [app-postback.hotmart.com](https://app-postback.hotmart.com)
2. Clique em **+ Register Webhook**
3. Configure:
   - **Nome**: Sheriff Bot Payments
   - **URL**: `https://seu-dominio.com/api/webhook/hotmart`
   - **Eventos**: Selecione
     - `PURCHASE_COMPLETE`
     - `PURCHASE_APPROVED`
     - `PURCHASE_REFUNDED`
     - `PURCHASE_CANCELED`
   - **Produtos**: Todos os produtos
4. Salve e copie o **Hottok** (token de verificação)

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install express express-session axios crypto dotenv typescript ts-node @types/express @types/express-session @types/node
```

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env`:

```env
# Hotmart API Configuration
HOTMART_CLIENT_ID=seu_client_id_aqui
HOTMART_CLIENT_SECRET=seu_client_secret_aqui
HOTMART_HOTTOK=seu_hottok_aqui

# Hotmart Product IDs (copie do painel Hotmart)
HOTMART_PRODUCT_STARTER=id_produto_starter
HOTMART_PRODUCT_POPULAR=id_produto_popular
HOTMART_PRODUCT_GOLD=id_produto_gold
HOTMART_PRODUCT_ULTIMATE=id_produto_ultimate
HOTMART_PRODUCT_BACKPACK_200=id_produto_backpack_200
HOTMART_PRODUCT_BACKPACK_300=id_produto_backpack_300
HOTMART_PRODUCT_BACKPACK_400=id_produto_backpack_400
HOTMART_PRODUCT_BACKPACK_500=id_produto_backpack_500

# Server Configuration
PORT=5000
SESSION_SECRET=chave-aleatoria-segura-32-caracteres
NODE_ENV=development
```

### 3. Estrutura do Projeto

```
website/
├── server.ts              # Express server com Hotmart
├── routes/
│   └── dashboard.ts       # Rotas do dashboard
├── index.html             # Homepage
├── shop.html              # Loja com integração Hotmart
├── dashboard.html         # Dashboard
├── success.html           # Página de sucesso
├── cancel.html            # Página de cancelamento
├── assets/                # Imagens e recursos
├── css/                   # Estilos
├── js/                    # JavaScript
├── package.json
├── tsconfig.json
└── .env                   # Variáveis de ambiente
```

## 🎯 Como Funciona

### Fluxo de Pagamento

1. **Usuário clica em "Buy Now"** → Frontend chama `/api/checkout`
2. **Server gera código de resgate** → Salva em `data/redemption-codes.json`
3. **Server retorna link Hotmart** → Redireciona usuário para checkout Hotmart
4. **Usuário paga na Hotmart** → Hotmart processa pagamento
5. **Hotmart envia webhook** → Server recebe notificação em `/api/webhook/hotmart`
6. **Server confirma pagamento** → Marca código como pago
7. **Usuário retorna ao site** → Página de sucesso mostra código
8. **Usuário resgata no Discord** → `/redeem code:SHERIFF-XXX`

### Endpoints da API

#### GET `/api/config`
Retorna configuração do Hotmart

**Resposta:**
```json
{
  "provider": "hotmart",
  "configured": true,
  "productBaseUrl": "https://pay.hotmart.com"
}
```

#### POST `/api/checkout`
Cria link de checkout Hotmart

**Request:**
```json
{
  "productId": "popular"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://pay.hotmart.com/PRODUCT_ID?sck=REDEMPTION_CODE",
  "redemptionCode": "SHERIFF-POPULAR-ABC123"
}
```

#### POST `/api/webhook/hotmart`
Recebe notificações da Hotmart

**Eventos Suportados:**
- `PURCHASE_COMPLETE`: Compra finalizada
- `PURCHASE_APPROVED`: Pagamento aprovado
- `PURCHASE_REFUNDED`: Reembolso processado
- `PURCHASE_CANCELED`: Compra cancelada

## 🧪 Testando

### Modo Teste Hotmart

1. Use produtos em modo **SANDBOX** na Hotmart
2. A Hotmart fornece cartões de teste no painel
3. Configure webhook apontando para seu servidor de desenvolvimento
4. Use a ferramenta de teste no painel de webhook

### Testando Webhook Localmente

Para testar webhooks no desenvolvimento local:

```bash
# Instale ngrok
npm install -g ngrok

# Exponha seu servidor local
ngrok http 5000

# Use a URL do ngrok no webhook Hotmart
# Exemplo: https://abc123.ngrok.io/api/webhook/hotmart
```

## 🔧 Configuração de Produção

### 1. Produtos em Produção

1. Mude todos os produtos do modo SANDBOX para **PRODUCTION**
2. Atualize os IDs dos produtos nas variáveis de ambiente

### 2. Webhook em Produção

1. Atualize a URL do webhook para seu domínio real
2. Exemplo: `https://sheriff-bot-store.com/api/webhook/hotmart`
3. Certifique-se de usar **HTTPS** (obrigatório)

### 3. Variáveis de Ambiente

```env
NODE_ENV=production
HOTMART_CLIENT_ID=live_client_id
HOTMART_CLIENT_SECRET=live_client_secret
HOTMART_HOTTOK=live_hottok
```

## 🛡️ Segurança

1. **Nunca exponha Client Secret** - Mantenha apenas no `.env`
2. **Valide Hottok** - Sempre verifique o token nos webhooks
3. **Use HTTPS** - Obrigatório em produção
4. **Verifique assinaturas** - O código já implementa validação
5. **Limite taxa de requisições** - Implemente rate limiting se necessário

## 🚨 Problemas Comuns

### Erro: "Hotmart not configured"
**Solução:** Verifique se `HOTMART_CLIENT_ID` e `HOTMART_CLIENT_SECRET` estão no `.env`

### Erro: "Hotmart product ID not configured"
**Solução:** Configure `HOTMART_PRODUCT_XXX` para cada produto no `.env`

### Webhook não recebe eventos
**Solução:** 
- Verifique se a URL está correta
- Use HTTPS em produção
- Teste com a ferramenta de webhook da Hotmart
- Verifique os logs do servidor

### Botões não aparecem
**Solução:** Verifique o console do navegador para erros

## 📚 Recursos

- [Documentação Hotmart Developers](https://developers.hotmart.com/)
- [Webhook Hotmart](https://developers.hotmart.com/docs/en/1.0.0/webhook/using-webhook/)
- [HotConnect API](https://developers.hotmart.com/docs/en/1.0.0/hot-connect/introduction/)
- [Painel de Webhooks](https://app-postback.hotmart.com/)

## 🤝 Suporte

Para problemas com integração Hotmart:
- Consulte a [Central de Ajuda Hotmart](https://help.hotmart.com)
- Revise logs do servidor para erros detalhados
- Teste em modo sandbox primeiro

Para problemas específicos do Sheriff Bot:
- Verifique logs do Discord bot
- Verifique se códigos estão sendo salvos corretamente
- Teste comando `/redeem` no Discord

## ✅ Checklist de Deploy

- [ ] Conta Hotmart criada
- [ ] 8 produtos criados na Hotmart
- [ ] Client ID e Secret obtidos
- [ ] Webhook configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Produtos testados em sandbox
- [ ] Webhook testado e funcionando
- [ ] Códigos de resgate funcionando no Discord
- [ ] HTTPS habilitado no website
- [ ] Páginas success/cancel funcionando
- [ ] Produtos mudados para produção

---

**Pronto para vender! 💰🤠**

## Vantagens da Hotmart vs PayPal

✅ **Popular na América Latina** - Especialmente Brasil
✅ **Suporta Pix** - Pagamento instantâneo brasileiro
✅ **Taxas competitivas** - Geralmente menores que PayPal
✅ **Sistema de afiliados** - Você pode ter afiliados vendendo
✅ **Múltiplas moedas** - BRL, USD, EUR, etc
✅ **Suporte em português** - Atendimento em PT-BR
