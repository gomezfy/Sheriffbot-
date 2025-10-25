# 🚀 Configuração Vertra Cloud - Plano Enterprise-4

## 📋 Configuração Otimizada para Enterprise

Com o plano Enterprise-4, você tem recursos suficientes para rodar o bot com todas as otimizações.

### 1. Configuração do Painel Vertra

No painel do Vertra Cloud, configure:

**Settings → General:**
- **Memory Limit:** 2048 MB (ou mais se disponível)
- **CPU:** Auto ou 2+ cores
- **Auto Restart:** Enabled
- **Node Version:** 18.x ou superior

**Settings → Build:**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:shard`
- **Main File:** `dist/src/shard.js`

### 2. Variáveis de Ambiente Obrigatórias

```env
DISCORD_TOKEN=seu_token_do_bot
DISCORD_CLIENT_ID=seu_client_id
NODE_ENV=production
```

### 3. Variáveis Opcionais (Recomendadas)

```env
# Owner do bot
OWNER_ID=seu_discord_user_id

# Stripe (pagamentos)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Hotmart (integração)
HOTMART_CLIENT_ID=...
HOTMART_CLIENT_SECRET=...
HOTMART_HOTTOK=...

# Discord OAuth (dashboard web)
DISCORD_CLIENT_SECRET=...
DISCORD_REDIRECT_URI=https://seu-dominio.vertracloud.app/auth/callback
```

### 4. Estrutura de Arquivos no Vertra

Certifique-se que estes arquivos estão no root do projeto:

```
├── package.json
├── tsconfig.json
├── vertracloud.config
├── src/
│   ├── index.ts
│   ├── shard.ts
│   ├── commands/
│   ├── events/
│   └── utils/
├── data/
│   └── .gitkeep
└── assets/
    ├── fonts/
    ├── emojis/
    └── profile-backgrounds/
```

### 5. Processo de Deploy

#### Opção A: Via Git (Recomendado)

```bash
# 1. Commit suas mudanças
git add .
git commit -m "Deploy to Vertra Enterprise"

# 2. Push para o Vertra
git push vertra main

# 3. O Vertra irá automaticamente:
#    - Instalar dependências (npm install)
#    - Compilar TypeScript (npm run build)
#    - Iniciar o bot (npm run start:shard)
```

#### Opção B: Upload Manual

```bash
# 1. Preparar o projeto
./vertra-deploy.sh

# 2. Fazer upload do ZIP gerado
# 3. No painel Vertra, clicar em "Deploy"
```

### 6. Registrar Comandos do Discord

Após o primeiro deploy, execute uma vez:

```bash
# No terminal do Vertra ou localmente
npm run deploy
```

Isso registrará todos os comandos slash no Discord.

### 7. Monitoramento

O bot inclui monitoramento automático de:
- ✅ Uso de memória
- ✅ Performance de comandos
- ✅ Health checks
- ✅ Auto-restart em caso de falha

**Ver logs no Vertra:**
- Painel → Logs → Real-time logs

### 8. Troubleshooting

#### Problema: "High memory usage" mesmo com Enterprise

**Causa:** O Vertra pode estar usando um limite padrão.

**Solução:**
1. Verifique no painel: Settings → Resources
2. Aumente o Memory Limit para 2048 MB ou mais
3. Reinicie o bot

#### Problema: Bot não inicia após deploy

**Checklist:**
- [ ] `DISCORD_TOKEN` está configurado?
- [ ] Build foi executado com sucesso?
- [ ] Arquivo `dist/src/shard.js` existe?
- [ ] Logs mostram algum erro específico?

**Comando de debug:**
```bash
# No terminal do Vertra
node dist/src/index.js
```

#### Problema: Comandos não aparecem no Discord

**Solução:**
```bash
# Execute o deploy de comandos
npm run deploy

# Aguarde até 1 hora para propagação global
# Ou use: Ctrl+R no Discord para forçar refresh
```

### 9. Otimizações Específicas Enterprise

Com recursos abundantes, você pode:

**Aumentar cache para melhor performance:**

Edite `src/utils/performance.ts`:
```typescript
GuildMemberManager: {
  maxSize: 5000, // Aumentado de 1000
  // ...
},

UserManager: {
  maxSize: 10000, // Aumentado de 2000
  // ...
}
```

**Aumentar memória por shard:**

Edite `src/shard.ts`:
```typescript
execArgv: [
  '--max-old-space-size=1024', // Aumentado de 512
  '--expose-gc'
]
```

### 10. Backup e Persistência

Os dados do bot são salvos em arquivos JSON em `src/data/`.

**Para backup automático:**
1. Configure um cron job no Vertra
2. Ou use um serviço externo de backup
3. Considere migrar para PostgreSQL para maior confiabilidade

**Migração para PostgreSQL (opcional):**
```bash
# No Vertra, crie um banco PostgreSQL
# Adicione a variável de ambiente:
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 11. Suporte

**Documentação completa:**
- `DEPLOY_VERTRA.md` - Guia geral de deploy
- `VERTRA_TROUBLESHOOTING.md` - Solução de problemas
- `PERFORMANCE.md` - Otimizações de performance

**Logs úteis:**
```bash
# Ver logs em tempo real
vertra logs --follow

# Ver últimas 100 linhas
vertra logs --tail 100

# Filtrar por erro
vertra logs | grep ERROR
```

---

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Comandos registrados no Discord (`npm run deploy`)
- [ ] Bot online e respondendo a comandos
- [ ] Logs sem erros críticos
- [ ] Memory limit configurado para 2048 MB+
- [ ] Auto-restart habilitado
- [ ] Backup dos dados configurado

---

**🎉 Seu bot está pronto para produção no Vertra Enterprise!**
