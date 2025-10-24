# 💾 Configurar Volume Persistente no Vertra Cloud

## ❌ Problema: Dados Perdidos Após Git Push/Restart

Quando você faz `git push` ou reinicia o bot no Vertra, todos os dados dos usuários (economia, territórios, perfis) são **perdidos** porque estão salvos em arquivos JSON temporários.

## ✅ Solução: Volume Persistente

Um volume persistente garante que a pasta `/data` seja mantida entre restarts e deploys.

---

## 🔧 Passo a Passo - Configuração no Vertra Cloud

### **1. Acessar Configurações do Projeto**
1. Entre no painel do Vertra Cloud
2. Selecione seu projeto (Sheriff Bot)
3. Vá em **Settings** ou **Configurações**

### **2. Configurar Volume Persistente**

#### **Opção A: Interface Gráfica (se disponível)**
1. Procure por: **Volumes**, **Storage**, ou **Persistent Storage**
2. Clique em **Add Volume** ou **Adicionar Volume**
3. Configure:
   - **Nome**: `bot-data`
   - **Caminho de Montagem**: `/app/data`
   - **Tamanho**: 1GB (ajuste conforme necessário)
4. Salve e reinicie o bot

#### **Opção B: Via Arquivo de Configuração**
Se o Vertra usa arquivo de configuração, adicione ao `vertracloud.config`:

```
NAME=Sheriff Bot
DESCRIPTION=Western Discord Bot with Economy System
MEMORY=2048
AUTORESTART=true
VERSION=recommended
BUILD_COMMAND=npm install && npm run build
START_COMMAND=node --expose-gc --max-old-space-size=1024 dist/src/shard.js
VOLUME_MOUNT=/app/data
VOLUME_SIZE=1GB
```

#### **Opção C: Via CLI do Vertra (se disponível)**
```bash
vertra volumes create bot-data --size 1GB
vertra volumes mount bot-data /app/data --project sheriff-bot
```

---

## 📂 Estrutura de Dados do Bot

O bot salva dados em **JSON** na pasta `/app/data/`:

```
/app/data/
├── economy.json          # Moedas de prata e ouro dos usuários
├── inventory.json        # Inventários dos usuários
├── territories.json      # Territórios comprados
├── territory-income.json # Controle de rendimentos
├── profiles.json         # Perfis dos usuários
├── mining.json           # Sistema de mineração
├── bounties.json         # Recompensas
├── wanted.json           # Sistema de procurados
├── xp.json               # Experiência
├── daily.json            # Recompensas diárias
├── work.json             # Sistema de trabalho
└── ...outros arquivos
```

---

## 🔍 Verificar se Funcionou

### **1. Testar Persistência**

Após configurar o volume:

1. **Adicione dados ao bot:**
   ```
   /daily
   /mine
   /profile
   ```

2. **Reinicie o bot no Vertra:**
   - Settings → Restart Application
   - Ou faça `git push`

3. **Verifique os dados:**
   ```
   /profile
   /balance
   ```

4. **✅ Sucesso:** Dados permanecem após restart
5. **❌ Falhou:** Dados foram perdidos → continue para "Alternativas"

### **2. Verificar Logs**

Procure no console do Vertra por:
```
📁 Data directory: /app/data
✅ Sistema de dados pronto!
```

---

## 🚨 Se o Vertra NÃO Suporta Volumes Persistentes

Algumas plataformas não oferecem volumes persistentes. Neste caso:

### **Alternativa 1: Migrar para PostgreSQL** ⭐ RECOMENDADO
- Dados 100% seguros e permanentes
- Melhor performance
- Suporte a múltiplas instâncias
- Backups automáticos

### **Alternativa 2: Usar Serviço Externo**
- **MongoDB Atlas** (gratuito até 512MB)
- **Supabase PostgreSQL** (gratuito)
- **Redis Cloud** (para cache)

### **Alternativa 3: Backup Automático**
Adicione um script que faz backup para serviço externo (S3, Google Drive, etc.)

---

## 📝 Checklist de Configuração

Antes de fazer deploy com volume persistente:

- [ ] Volume criado no Vertra (1GB+)
- [ ] Volume montado em `/app/data`
- [ ] Variáveis de ambiente configuradas
- [ ] Bot reiniciado após configuração
- [ ] Dados testados (criar e verificar após restart)
- [ ] Logs confirmam diretório correto

---

## 🔧 Configuração Adicional do Bot

O bot já está configurado para usar o diretório correto:

### `src/utils/database.ts`
```typescript
export function getDataPath(...segments: string[]): string {
  const isProduction = process.env.NODE_ENV === 'production' || 
                       !fs.existsSync(path.join(process.cwd(), 'src'));
  
  if (isProduction) {
    // Production: usa /app/data (onde o volume está montado)
    return path.join(process.cwd(), ...segments);
  } else {
    // Development: usa src/data
    if (segments[0] === 'data') {
      return path.join(process.cwd(), 'src', ...segments);
    }
    return path.join(process.cwd(), ...segments);
  }
}
```

### ✅ Detecção Automática de Ambiente

O bot agora **detecta automaticamente** se está em produção! Não precisa configurar `NODE_ENV`.

**Como funciona:**
- Quando roda `node dist/src/shard.js` → Detecta produção → Usa `/app/data`
- Quando roda `ts-node src/index.ts` → Detecta desenvolvimento → Usa `src/data`

**Você NÃO precisa configurar `NODE_ENV=production` no Vertra!**

---

## 📊 Monitoramento

### Ver Dados Salvos
No console do Vertra, execute:
```bash
ls -lh /app/data/
cat /app/data/economy.json | head -20
```

### Backup Manual (se necessário)
```bash
# Fazer backup
tar -czf backup-data.tar.gz /app/data/

# Restaurar backup
tar -xzf backup-data.tar.gz -C /
```

---

## 🆘 Problemas Comuns

### Volume não monta
- **Solução:** Verifique se o caminho está correto (`/app/data` não `/data`)
- Confira se o volume foi criado antes de montar

### Dados ainda são perdidos
- **Solução:** Certifique-se que `NODE_ENV=production` está configurado
- Verifique os logs para confirmar o diretório usado

### Permissões negadas
- **Solução:** O volume precisa ter permissões de escrita
- Configure: `chmod 755 /app/data` no script de inicialização

### Erro ao criar arquivos
- **Solução:** Espaço insuficiente no volume
- Aumente o tamanho do volume para 2GB ou mais

---

## 📞 Suporte

Se nenhuma opção funcionou:

1. **Verifique a documentação oficial do Vertra**
   - https://vertracloud.app/docs
   - Procure por: "persistent storage", "volumes", "data persistence"

2. **Entre em contato com o suporte do Vertra**
   - Pergunte sobre volumes persistentes
   - Solicite ajuda para configurar `/app/data`

3. **Considere migrar para PostgreSQL**
   - Solução mais profissional e confiável
   - Posso ajudá-lo com a migração completa

---

## ✅ Resumo

1. ✅ Crie volume persistente no Vertra (1GB+)
2. ✅ Monte em `/app/data`
3. ✅ Configure `NODE_ENV=production`
4. ✅ Reinicie o bot
5. ✅ Teste criando dados e reiniciando
6. ✅ Sucesso! Dados agora persistem 🎉

---

**Última atualização:** 2025-10-24
