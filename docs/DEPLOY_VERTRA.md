# 🚀 Deploy no Vertra Cloud

Guia completo para fazer deploy do Sheriff Rex Bot no Vertra Cloud.

## 📋 Pré-requisitos

1. Conta no [Vertra Cloud](https://vertracloud.app)
2. Bot do Discord criado no [Discord Developer Portal](https://discord.com/developers/applications)
3. Token do bot e Client ID

## 🔧 Configuração das Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Vertra Cloud:

### Obrigatórias (Bot Discord)
```
DISCORD_TOKEN=seu_token_do_bot
DISCORD_CLIENT_ID=seu_client_id
```

### Opcionais (Website e Pagamentos)
```
# Stripe (para sistema de pagamentos)
STRIPE_SECRET_KEY=sk_live_sua_chave
STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave

# Hotmart (integração opcional)
HOTMART_CLIENT_ID=seu_client_id
HOTMART_CLIENT_SECRET=seu_secret
HOTMART_HOTTOK=seu_hottok

# Configuração do Discord OAuth (para dashboard web)
DISCORD_CLIENT_SECRET=seu_client_secret
DISCORD_REDIRECT_URI=https://seu-dominio.vertracloud.app/auth/callback
```

## 📦 Instalação

### 1. Criar Novo Projeto no Vertra Cloud

1. Acesse o painel do Vertra Cloud
2. Clique em "New Project" ou "Create Application"
3. Selecione "Discord Bot" como tipo de projeto
4. Escolha Node.js 18.x ou superior

### 2. Fazer Upload do Código

**Opção A: Via Git (Recomendado)**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add vertra <url-do-repositorio-vertra>
git push vertra main
```

**Opção B: Upload direto**
- Faça upload do projeto compactado (sem node_modules)
- O Vertra instalará as dependências automaticamente

### 3. Configurar Variáveis de Ambiente

No painel do Vertra Cloud:
1. Vá em "Settings" → "Environment Variables"
2. Adicione cada variável de ambiente listada acima
3. Salve as configurações

### 4. Configurar Script de Inicialização

O Vertra Cloud usará automaticamente o script `start` do `package.json`:
```json
"scripts": {
  "start": "ts-node src/index.ts"
}
```

Se necessário, você pode especificar um comando customizado no painel do Vertra.

## 🗄️ Banco de Dados (Opcional)

Se você precisar de persistência de dados além dos arquivos JSON:

### PostgreSQL
1. No Vertra Cloud, crie um banco PostgreSQL
2. Copie a URL de conexão
3. Adicione como variável de ambiente:
```
DATABASE_URL=postgresql://usuario:senha@host:5432/database
```

### MongoDB
1. Crie um banco MongoDB no Vertra
2. Configure a variável:
```
MONGODB_URI=mongodb://usuario:senha@host:27017/database
```

## 🌐 Website (Opcional)

Se quiser rodar o website junto com o bot:

### Opção 1: Dois Processos Separados
- Crie dois projetos no Vertra:
  - Um para o bot Discord
  - Um para o website

### Opção 2: Processo Único
Modifique o script de start para rodar ambos:
```json
"scripts": {
  "start": "concurrently \"ts-node src/index.ts\" \"cd website && node server.js\""
}
```

Instale a dependência:
```bash
npm install concurrently
```

## ✅ Deploy Commands (Slash Commands)

Após o primeiro deploy, registre os comandos do Discord:

```bash
npm run deploy
```

Ou configure um script de pós-deploy no Vertra Cloud.

## 🔍 Verificação

Após o deploy, verifique:

1. ✅ Bot aparece online no Discord
2. ✅ Comandos slash funcionam (`/help`, `/ping`)
3. ✅ Logs não mostram erros
4. ✅ Sistema de economia funciona
5. ✅ Website acessível (se configurado)

## 📊 Monitoramento

No painel do Vertra Cloud você pode:
- Ver logs em tempo real
- Monitorar uso de recursos
- Configurar alertas
- Reiniciar o bot se necessário

## 🛠️ Troubleshooting

### Bot não inicia
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o DISCORD_TOKEN é válido
- Verifique os logs para erros específicos

### Comandos não aparecem
- Execute `npm run deploy` para registrar os comandos
- Aguarde até 1 hora para propagação global
- Verifique se o bot tem permissões necessárias

### Erros de módulo não encontrado
- Certifique-se de que `node_modules` não está no repositório
- O Vertra instalará as dependências automaticamente
- Verifique se `package.json` está correto

### Dados não persistem
- Arquivos JSON em `src/data/` podem não persistir entre restarts
- Considere usar PostgreSQL ou MongoDB para dados permanentes
- Configure volume persistente no Vertra se disponível

## 💡 Dicas

1. **Performance**: O bot usa otimizações de cache - não precisa de recursos pesados
2. **Escalabilidade**: Para muitos servidores, considere um plano com mais RAM
3. **Backups**: Exporte os dados JSON regularmente
4. **Updates**: Use Git para facilitar atualizações futuras
5. **Logs**: Mantenha os logs habilitados para diagnóstico

## 📞 Suporte

- Documentação Vertra Cloud: https://vertracloud.app/docs
- Discord do Sheriff Rex: [Seu servidor]
- Issues: [Seu repositório GitHub]

---

**Boa sorte com o deploy! 🤠**
