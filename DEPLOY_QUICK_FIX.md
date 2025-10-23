# 🚀 Correção Rápida - Deploy no Vertra Cloud

## ⚡ Solução Rápida para Erro no Upload ZIP

Se você está tendo erro ao fazer upload do ZIP no Vertra Cloud, siga estes passos:

### 📋 Passo a Passo

#### 1. Prepare o Projeto (Linux/Mac)
```bash
# Execute o script automático
./vertra-deploy.sh
```

#### 2. Prepare o Projeto (Windows)
```powershell
# Abra PowerShell na pasta do projeto

# Remover node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Remover dist
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Criar ZIP (exclui arquivos desnecessários)
Compress-Archive -Path * -DestinationPath sheriffbot-vertra.zip -Force `
  -Exclude node_modules,dist,.git,*.log,.env,attached_assets,website_updated.zip
```

#### 3. Prepare o Projeto (Manual)
Se os scripts não funcionarem:

1. **Delete estas pastas/arquivos:**
   - `node_modules/` (pasta inteira)
   - `dist/` (pasta inteira)
   - `.git/` (pasta inteira)
   - `attached_assets/` (pasta inteira)
   - `website_updated.zip`
   - Todos os arquivos `.log`
   - Arquivo `.env` (se existir)

2. **Mantenha estes arquivos:**
   - ✅ `package.json`
   - ✅ `tsconfig.json`
   - ✅ `vertracloud.config`
   - ✅ Pasta `src/` completa
   - ✅ `.env.example`
   - ✅ Arquivos `.md` (documentação)

3. **Crie o ZIP:**
   - Selecione TODOS os arquivos restantes
   - Clique com botão direito → "Comprimir" ou "Send to → Compressed folder"
   - Nome sugerido: `sheriffbot-vertra.zip`

---

## 🔧 Problemas Comuns e Soluções

### ❌ "ZIP muito grande"
**Solução:** Certifique-se de remover:
- `node_modules/` (125MB+)
- `attached_assets/` (se tiver arquivos grandes)
- `.git/` (histórico do git)

**Tamanho ideal:** 5-20MB

---

### ❌ "Erro ao extrair ZIP"
**Solução:** 
1. Não comprima a pasta do projeto, comprima o CONTEÚDO
2. Estrutura correta no ZIP:
   ```
   sheriffbot-vertra.zip
   ├── package.json
   ├── tsconfig.json
   ├── vertracloud.config
   └── src/
       └── index.ts
   ```

3. Estrutura INCORRETA:
   ```
   sheriffbot-vertra.zip
   └── Sheriffbot-/  ❌ NÃO DEVE TER PASTA PAI
       ├── package.json
       └── src/
   ```

---

### ❌ "Cannot find module"
**Solução:**
1. Verifique se `package.json` está no ZIP
2. Verifique se `typescript` e `ts-node` estão em `dependencies`
3. Aguarde o Vertra instalar dependências (pode levar 2-3 minutos)

---

### ❌ "Bot não inicia"
**Solução:**
1. Configure variáveis de ambiente no Vertra:
   ```
   DISCORD_TOKEN=seu_token
   DISCORD_CLIENT_ID=seu_client_id
   OWNER_ID=seu_user_id
   ```

2. Verifique logs no painel do Vertra

3. Certifique-se que `vertracloud.config` está correto

---

## 📦 Conteúdo Mínimo do ZIP

Arquivos **OBRIGATÓRIOS**:
```
✅ package.json
✅ tsconfig.json
✅ vertracloud.config
✅ src/index.ts
✅ src/commands/ (pasta completa)
✅ src/events/ (pasta completa)
✅ src/utils/ (pasta completa)
```

Arquivos **OPCIONAIS** (mas recomendados):
```
✅ .env.example
✅ README.md
✅ DEPLOY_VERTRA.md
✅ assets/ (se usar imagens/fontes)
```

Arquivos que **NÃO DEVEM** estar no ZIP:
```
❌ node_modules/
❌ dist/
❌ .git/
❌ .env
❌ *.log
❌ attached_assets/ (se muito grande)
❌ website_updated.zip
```

---

## 🎯 Checklist Final

Antes de fazer upload:

- [ ] `node_modules/` foi removido
- [ ] `dist/` foi removido
- [ ] `.git/` foi removido
- [ ] Arquivo `.env` foi removido (use .env.example)
- [ ] ZIP tem menos de 50MB
- [ ] `package.json` está presente
- [ ] `vertracloud.config` está presente
- [ ] Pasta `src/` está completa
- [ ] Estrutura do ZIP está correta (sem pasta pai extra)

---

## 🚀 Após o Upload

1. **Configure variáveis de ambiente:**
   - Settings → Environment Variables
   - Adicione: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `OWNER_ID`

2. **Inicie o bot:**
   - Clique em "Start" ou "Deploy"
   - Aguarde instalação de dependências (2-3 minutos)

3. **Registre comandos:**
   - No console do Vertra, execute:
   ```bash
   npm run deploy
   ```

4. **Verifique:**
   - Bot aparece online no Discord
   - Comandos `/help` e `/ping` funcionam

---

## 📞 Ainda com Problemas?

Consulte o guia completo de troubleshooting:
- **VERTRA_TROUBLESHOOTING.md** - Soluções para 14+ erros comuns
- **DEPLOY_VERTRA.md** - Guia completo de deployment

Ou abra uma issue no GitHub com:
- Logs de erro do Vertra
- Conteúdo do seu `vertracloud.config`
- Tamanho do arquivo ZIP
- Passos que você seguiu

---

**Boa sorte! 🤠**
