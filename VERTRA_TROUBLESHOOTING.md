# 🔧 Troubleshooting - Erros Comuns no Vertra Cloud

## 🚨 Problemas Mais Comuns e Soluções

### 0. ⚠️ High Memory Usage (91%+)

**Causa:** O bot está usando quase toda a memória disponível no plano gratuito do Vertra (geralmente 256MB ou menos).

**Sintomas:**
```
⚠️ High memory usage: 91.1% (20.10MB / 22.06MB)
⚠️ High memory usage: 92.0% (20.29MB / 22.06MB)
```

**Soluções:**

1. **Use o comando start:light (sem otimizações de memória):**
   ```json
   {
     "scripts": {
       "start": "node dist/src/index.js"
     }
   }
   ```

2. **Atualize vertracloud.config:**
   ```
   MEMORY=256
   MAIN=dist/src/index.js
   BUILD_COMMAND=npm install && npm run build
   ```

3. **Desabilite sharding se tiver poucos servidores:**
   - Use `dist/src/index.js` ao invés de `dist/src/shard.js`

4. **Upgrade para plano pago do Vertra** (recomendado para produção):
   - Planos pagos oferecem 512MB+ de RAM
   - Melhor performance e estabilidade

5. **Reduza cache no código** (se necessário):
   - Edite `src/utils/performance.ts`
   - Reduza valores de `maxSize` nos caches

---

### 1. ❌ Erro: "Cannot find module 'typescript'" ou "ts-node not found"

**Causa:** O Vertra Cloud não instalou as dependências corretamente.

**Solução:**
```bash
# Verifique se package.json está correto
# Certifique-se que typescript e ts-node estão em dependencies (não devDependencies)
```

**No package.json:**
```json
{
  "dependencies": {
    "typescript": "^5.9.3",
    "ts-node": "^10.9.2"
  }
}
```

**Alternativa:** Use build antes de fazer deploy:
```json
{
  "scripts": {
    "start": "node dist/src/index.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

---

### 2. ❌ Erro: "DISCORD_TOKEN is not defined" ou "Invalid token"

**Causa:** Variáveis de ambiente não configuradas ou incorretas.

**Solução:**
1. Acesse o painel do Vertra Cloud
2. Vá em **Settings → Environment Variables**
3. Adicione:
   ```
   DISCORD_TOKEN=seu_token_aqui
   DISCORD_CLIENT_ID=seu_client_id
   OWNER_ID=seu_discord_user_id
   ```
4. **Importante:** Não inclua aspas ou espaços extras
5. Reinicie o bot após adicionar variáveis

**Verificar token:**
- Acesse: https://discord.com/developers/applications
- Selecione seu bot
- Bot → Token → Reset Token (se necessário)
- Copie o novo token

---

### 3. ❌ Erro: "ENOENT: no such file or directory, open 'src/data/economy.json'"

**Causa:** Diretórios de dados não foram criados.

**Solução 1 - Automática:**
O bot cria os arquivos automaticamente na primeira execução. Aguarde alguns segundos.

**Solução 2 - Manual:**
Adicione ao início do `src/index.ts`:
```typescript
import { initializeDatabase } from './utils/database';
initializeDatabase();
```

**Solução 3 - Criar diretórios no ZIP:**
Antes de fazer upload, certifique-se que existem:
- `src/data/` (com arquivo `.gitkeep`)
- `data/` (com arquivo `.gitkeep`)

---

### 4. ❌ Erro: "Application did not respond" ou "Interaction failed"

**Causa:** Bot não está respondendo a tempo (3 segundos).

**Solução:**
1. **Aumentar memória no Vertra:**
   - Vá em Settings → Resources
   - Aumente para pelo menos 512MB

2. **Otimizar código:**
   - Use `interaction.deferReply()` para operações longas
   - Implemente cache adequadamente

3. **Verificar logs:**
   - Veja se há erros no console do Vertra
   - Procure por timeouts ou crashes

---

### 5. ❌ Erro: "Missing Access" ou "Missing Permissions"

**Causa:** Bot não tem permissões necessárias no servidor Discord.

**Solução:**
1. **Gerar novo link de convite:**
   ```
   https://discord.com/api/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=8&scope=bot%20applications.commands
   ```
   
2. **Permissões necessárias:**
   - Administrator (recomendado para facilitar)
   - Ou: Send Messages, Embed Links, Attach Files, Use Slash Commands

3. **Habilitar Intents:**
   - Discord Developer Portal → Bot
   - Privileged Gateway Intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent

---

### 6. ❌ Erro: "Slash commands not appearing"

**Causa:** Comandos não foram registrados.

**Solução:**
1. **Registrar comandos:**
   ```bash
   npm run deploy
   ```

2. **Se não funcionar, registre manualmente:**
   - No console do Vertra, execute:
   ```bash
   ts-node src/deploy-commands.ts
   ```

3. **Aguarde propagação:**
   - Comandos globais: até 1 hora
   - Comandos de servidor: instantâneo

4. **Verificar CLIENT_ID:**
   - Certifique-se que `DISCORD_CLIENT_ID` está correto nas variáveis de ambiente

---

### 7. ❌ Erro: "Cannot read property 'id' of undefined"

**Causa:** Objeto esperado está undefined (geralmente `interaction.guild`).

**Solução:**
1. **Verificar contexto do comando:**
   ```typescript
   if (!interaction.guild) {
     await interaction.reply({
       content: '❌ Este comando só pode ser usado em servidores!',
       flags: MessageFlags.Ephemeral
     });
     return;
   }
   ```

2. **Configurar contextos corretos:**
   ```typescript
   .setContexts([0]) // Apenas em servidores
   // ou
   .setContexts([0, 1, 2]) // Servidor, DM, Grupo
   ```

---

### 8. ❌ Erro: "Module not found: @napi-rs/canvas"

**Causa:** Dependência nativa não compilou corretamente.

**Solução:**
1. **Verificar versão do Node:**
   - Vertra Cloud deve usar Node.js 18.x ou superior
   - Verifique em Settings → Runtime

2. **Alternativa - Remover canvas temporariamente:**
   Se não usar recursos de imagem, comente:
   ```typescript
   // import { createCanvas } from '@napi-rs/canvas';
   ```

3. **Rebuild no Vertra:**
   - Delete `node_modules`
   - Reinicie o bot (reinstalará dependências)

---

### 9. ❌ Erro: "Port 3000 already in use"

**Causa:** Tentando rodar servidor web na mesma porta.

**Solução:**
1. **Usar porta dinâmica:**
   ```typescript
   const PORT = process.env.PORT || 3000;
   app.listen(PORT);
   ```

2. **Desabilitar website se não necessário:**
   - Comente código do Express no `index.ts`
   - Ou rode bot e website em projetos separados

---

### 10. ❌ Erro: "Out of memory" ou "JavaScript heap out of memory"

**Causa:** Bot usando muita memória.

**Solução:**
1. **Aumentar memória no Vertra:**
   - Settings → Resources → Memory: 1024MB ou mais

2. **Otimizar cache:**
   ```typescript
   // Reduzir limites de cache
   makeCache: Options.cacheWithLimits({
     MessageManager: 50,  // Reduzir de 100
     GuildMemberManager: { maxSize: 100 }  // Reduzir de 200
   })
   ```

3. **Implementar limpeza periódica:**
   ```typescript
   setInterval(() => {
     client.sweepers.sweepMessages();
   }, 300000); // A cada 5 minutos
   ```

---

### 11. ❌ Erro: "ZIP file too large"

**Causa:** Arquivo ZIP excede limite do Vertra Cloud.

**Solução:**
1. **Use o script de deploy:**
   ```bash
   ./vertra-deploy.sh
   ```

2. **Remover arquivos grandes manualmente:**
   - `node_modules/` (será reinstalado)
   - `attached_assets/`
   - `website_updated.zip`
   - Arquivos `.log`

3. **Criar ZIP otimizado:**
   ```bash
   zip -r sheriffbot.zip . \
     -x "node_modules/*" \
     -x "dist/*" \
     -x ".git/*" \
     -x "attached_assets/*"
   ```

---

### 12. ❌ Erro: "Data not persisting" ou "Data lost after restart"

**Causa:** Arquivos JSON não persistem entre restarts no Vertra.

**Solução:**
1. **Usar volume persistente:**
   - Vertra Cloud → Settings → Volumes
   - Monte volume em `/app/data`

2. **Migrar para banco de dados:**
   - PostgreSQL (recomendado)
   - MongoDB
   - Redis para cache

3. **Configurar backup automático:**
   ```typescript
   // Backup periódico para serviço externo
   setInterval(() => {
     backupDataToS3(); // ou outro serviço
   }, 3600000); // A cada hora
   ```

---

### 13. ❌ Erro: "vertracloud.config not found"

**Causa:** Arquivo de configuração ausente ou mal formatado.

**Solução:**
Crie `vertracloud.config` na raiz:
```
NAME=Sheriff Bot
DESCRIPTION=Western Discord Bot with Economy System
MAIN=src/index.ts
MEMORY=512
AUTORESTART=true
VERSION=recommended
```

**Importante:** Sem espaços extras, sem aspas.

---

### 14. ❌ Erro: "Cannot find module './utils/security'"

**Causa:** Arquivo TypeScript não compilado ou caminho incorreto.

**Solução:**
1. **Verificar importação:**
   ```typescript
   import { isOwner } from './utils/security';
   // ou
   import { isOwner } from '../utils/security';
   ```

2. **Compilar antes de rodar:**
   ```bash
   npm run build
   npm start
   ```

3. **Verificar tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

---

## 🔍 Como Debugar

### 1. Ver Logs em Tempo Real
```bash
# No painel do Vertra Cloud
Logs → Real-time logs
```

### 2. Adicionar Logs de Debug
```typescript
console.log('🔍 DEBUG: Bot iniciando...');
console.log('🔍 DEBUG: Token:', process.env.DISCORD_TOKEN ? 'Definido' : 'Não definido');
console.log('🔍 DEBUG: Comandos carregados:', client.commands.size);
```

### 3. Testar Localmente Primeiro
```bash
# Instalar dependências
npm install

# Criar .env com suas credenciais
cp .env.example .env

# Rodar localmente
npm start
```

### 4. Verificar Status do Vertra
- https://status.vertracloud.app
- Pode haver manutenção ou problemas temporários

---

## 📞 Suporte

Se nenhuma solução funcionou:

1. **Copie os logs de erro completos**
2. **Verifique a documentação do Vertra:** https://vertracloud.app/docs
3. **Discord do Vertra Cloud:** (se disponível)
4. **Abra uma issue no GitHub** com:
   - Logs de erro
   - Configuração do vertracloud.config
   - Versão do Node.js
   - Passos para reproduzir

---

## ✅ Checklist Pré-Deploy

Antes de fazer upload, verifique:

- [ ] `node_modules/` removido do ZIP
- [ ] Variáveis de ambiente configuradas no Vertra
- [ ] `vertracloud.config` presente e correto
- [ ] `package.json` tem todas as dependências
- [ ] Diretórios `src/data/` e `data/` existem
- [ ] Token do Discord é válido
- [ ] Intents habilitados no Discord Portal
- [ ] Bot tem permissões no servidor
- [ ] Comandos serão registrados após deploy

---

**Última atualização:** 2025-10-23
