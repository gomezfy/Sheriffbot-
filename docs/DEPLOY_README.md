# 🚀 Como Fazer Deploy no Vertra Cloud - GUIA DEFINITIVO

## 🎯 Problema Resolvido

Se você estava tendo **erro ao fazer upload do ZIP** no Vertra Cloud, agora está RESOLVIDO! ✅

---

## ⚡ Solução Rápida (3 Passos)

### Opção 1: Script Automático (Linux/Mac) 🐧🍎

```bash
# 1. Dê permissão ao script
chmod +x vertra-deploy.sh

# 2. Execute o script
./vertra-deploy.sh

# 3. Faça upload do ZIP gerado
# Arquivo: sheriffbot-vertra-YYYYMMDD-HHMMSS.zip
```

### Opção 2: Manual (Windows/Qualquer OS) 🪟

```bash
# 1. Delete estas pastas:
- node_modules/
- dist/
- .git/
- attached_assets/

# 2. Crie um ZIP com o resto
# 3. Faça upload no Vertra Cloud
```

---

## 📚 Documentação Completa

Criamos **3 guias** para você:

### 1. 🚀 DEPLOY_QUICK_FIX.md
**Para quem quer resolver AGORA**
- Solução rápida em 3 passos
- Checklist de verificação
- Problemas mais comuns

### 2. 🔧 VERTRA_TROUBLESHOOTING.md
**Para quando der erro**
- 14+ erros comuns e soluções
- Como debugar
- Logs e diagnóstico

### 3. 📖 DEPLOY_VERTRA.md
**Guia completo e detalhado**
- Configuração passo a passo
- Variáveis de ambiente
- Banco de dados
- Website

---

## 🎯 Por Que Estava Dando Erro?

### Problemas Identificados:

1. **ZIP muito grande** ❌
   - `node_modules/` tem 125MB+
   - `attached_assets/` com arquivos grandes
   - `.git/` com histórico completo

2. **Estrutura incorreta** ❌
   - ZIP com pasta pai extra
   - Arquivos na estrutura errada

3. **Arquivos desnecessários** ❌
   - Logs, cache, arquivos temporários
   - Dados de desenvolvimento

### Soluções Implementadas:

1. **Script automático** ✅
   - Remove arquivos desnecessários
   - Cria ZIP otimizado
   - Verifica estrutura

2. **.vertraignore** ✅
   - Lista de arquivos a ignorar
   - Similar ao .gitignore

3. **Documentação completa** ✅
   - 3 guias diferentes
   - Troubleshooting detalhado
   - Exemplos práticos

---

## 📦 O Que Deve Estar no ZIP

### ✅ INCLUIR:
```
✅ package.json
✅ tsconfig.json
✅ vertracloud.config
✅ src/ (pasta completa)
✅ assets/ (fontes, imagens necessárias)
✅ .env.example
✅ README.md
```

### ❌ NÃO INCLUIR:
```
❌ node_modules/
❌ dist/
❌ .git/
❌ .env (use .env.example)
❌ *.log
❌ attached_assets/ (se muito grande)
❌ website_updated.zip
```

### 📊 Tamanho Ideal:
- **Antes**: 150MB+ ❌
- **Depois**: 5-20MB ✅

---

## 🔧 Configuração no Vertra Cloud

### 1. Variáveis de Ambiente (OBRIGATÓRIAS)

```env
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id
OWNER_ID=seu_discord_user_id
```

### 2. Configurações Recomendadas

```
Memory: 512MB (mínimo)
Node Version: 18.x ou superior
Auto Restart: Enabled
```

### 3. Após Deploy

```bash
# Registrar comandos slash
npm run deploy
```

---

## 🎬 Passo a Passo Completo

### 1️⃣ Preparar o Projeto

**Linux/Mac:**
```bash
./vertra-deploy.sh
```

**Windows:**
```powershell
# Remover node_modules
Remove-Item -Recurse -Force node_modules

# Remover dist
Remove-Item -Recurse -Force dist

# Criar ZIP
Compress-Archive -Path * -DestinationPath sheriffbot.zip
```

### 2️⃣ Upload no Vertra

1. Acesse: https://vertracloud.app
2. Novo Projeto → Discord Bot
3. Upload do ZIP
4. Aguarde instalação (2-3 minutos)

### 3️⃣ Configurar Variáveis

1. Settings → Environment Variables
2. Adicione:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `OWNER_ID`
3. Save

### 4️⃣ Iniciar Bot

1. Clique em "Start"
2. Aguarde bot ficar online
3. Verifique logs

### 5️⃣ Registrar Comandos

```bash
# No console do Vertra
npm run deploy
```

### 6️⃣ Testar

```
/help
/ping
/profile
```

---

## 🆘 Problemas Comuns

### "ZIP muito grande"
→ Use o script `vertra-deploy.sh`

### "Cannot find module"
→ Aguarde instalação de dependências (2-3 min)

### "Bot não inicia"
→ Verifique variáveis de ambiente

### "Comandos não aparecem"
→ Execute `npm run deploy`

### "Data not persisting"
→ Configure volume persistente ou use banco de dados

**Para mais soluções:** Veja `VERTRA_TROUBLESHOOTING.md`

---

## 📞 Suporte

### Documentação:
- 📄 `DEPLOY_QUICK_FIX.md` - Solução rápida
- 🔧 `VERTRA_TROUBLESHOOTING.md` - 14+ erros e soluções
- 📖 `DEPLOY_VERTRA.md` - Guia completo

### Scripts:
- 🤖 `vertra-deploy.sh` - Deploy automático
- ⚙️ `vertracloud.config` - Configuração do Vertra
- 🚫 `.vertraignore` - Arquivos a ignorar

### Links:
- Vertra Cloud: https://vertracloud.app
- Discord Portal: https://discord.com/developers/applications
- Documentação Vertra: https://vertracloud.app/docs

---

## ✅ Checklist Final

Antes de fazer upload:

- [ ] Executei `vertra-deploy.sh` OU removi manualmente:
  - [ ] `node_modules/`
  - [ ] `dist/`
  - [ ] `.git/`
  - [ ] `attached_assets/`
- [ ] ZIP tem menos de 50MB
- [ ] `package.json` está no ZIP
- [ ] `vertracloud.config` está no ZIP
- [ ] Pasta `src/` está completa no ZIP
- [ ] Tenho meu `DISCORD_TOKEN` pronto
- [ ] Tenho meu `DISCORD_CLIENT_ID` pronto
- [ ] Tenho meu `OWNER_ID` (meu user ID do Discord)

---

## 🎉 Pronto!

Agora você tem tudo para fazer deploy sem erros! 🚀

**Boa sorte, parceiro! 🤠**

---

**Última atualização:** 2025-10-23  
**Versão:** 1.0.0
