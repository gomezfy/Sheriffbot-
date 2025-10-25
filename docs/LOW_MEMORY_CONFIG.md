# 🔧 Configuração para Ambientes de Baixa Memória

Se você está vendo avisos de **"High memory usage: 86%+"** com apenas **18-50MB disponíveis**, use esta configuração.

---

## 🚨 Problema Identificado

O Vertra está alocando apenas **18-50MB** ao invés dos **2048MB** configurados.

---

## ✅ Soluções (em ordem de prioridade)

### 1️⃣ **Aumentar Memória no Painel Vertra** (RECOMENDADO)

**Acesse:** Settings → Resources → Memory Limit

**Configure:**
- Memory: **2048 MB** (ou pelo menos 512 MB)
- CPU: Auto ou 1+ core
- Auto Restart: Enabled

**Depois reinicie o bot.**

---

### 2️⃣ **Usar Modo Low Memory** (Se não puder aumentar)

Se o Vertra não permitir mais memória, use o modo otimizado:

#### No Painel Vertra:

**Settings → Environment Variables:**
```env
LOW_MEMORY=true
```

**Settings → Start Command:**
```bash
LOW_MEMORY=true node --expose-gc --max-old-space-size=64 dist/src/index.js
```

#### Ou use o script npm:
```bash
npm run start:low-memory
```

---

## 🎯 Diferenças entre Modos

### Modo Normal (2GB+):
```bash
node --max-old-space-size=1024 dist/src/shard.js
```
- ✅ Sharding habilitado
- ✅ Cache otimizado (2000 users, 1000 members)
- ✅ Suporta 10,000+ usuários
- ✅ Melhor performance

### Modo Low Memory (< 100MB):
```bash
LOW_MEMORY=true node --max-old-space-size=64 dist/src/index.js
```
- ⚠️ Sem sharding
- ⚠️ Cache mínimo (200 users, 100 members)
- ⚠️ Suporta até ~1000 usuários
- ✅ Usa apenas 15-30MB

---

## 📊 Configurações de Cache

### Modo Normal (PRODUCTION_CACHE_CONFIG):
```typescript
GuildMemberManager: maxSize: 1000
UserManager: maxSize: 2000
MessageManager: maxSize: 50
```

### Modo Low Memory (LOW_MEMORY_CACHE_CONFIG):
```typescript
GuildMemberManager: maxSize: 100
UserManager: maxSize: 200
MessageManager: maxSize: 10
```

---

## 🔧 Configuração Completa para Low Memory

### 1. Environment Variables (Vertra):
```env
DISCORD_TOKEN=seu_token
DISCORD_CLIENT_ID=seu_client_id
OWNER_ID=seu_user_id
LOW_MEMORY=true
NODE_ENV=production
```

### 2. Start Command (Vertra):
```bash
LOW_MEMORY=true node --expose-gc --max-old-space-size=64 dist/src/index.js
```

### 3. Build Command (Vertra):
```bash
npm install && npm run build
```

### 4. Memory Limit (Vertra):
- Mínimo: 64 MB
- Recomendado: 128 MB
- Ideal: 256 MB+

---

## 📈 Uso de Memória Esperado

| Modo | Memória Inicial | Memória Pico | Usuários Suportados |
|------|----------------|--------------|---------------------|
| **Low Memory** | 10-15 MB | 30-50 MB | ~1,000 |
| **Normal** | 50-100 MB | 200-500 MB | ~5,000 |
| **Shard (Enterprise)** | 100-200 MB | 500-1000 MB | 10,000+ |

---

## ⚠️ Limitações do Modo Low Memory

### O que funciona:
- ✅ Todos os comandos
- ✅ Sistema de economia
- ✅ Eventos e interações
- ✅ Comandos slash
- ✅ Perfis e XP

### O que é limitado:
- ⚠️ Cache de membros (apenas 100)
- ⚠️ Cache de usuários (apenas 200)
- ⚠️ Sem sharding
- ⚠️ Performance reduzida em servidores grandes

### O que NÃO funciona:
- ❌ Múltiplos shards
- ❌ Cache extensivo
- ❌ Suporte para 10k+ usuários

---

## 🔍 Como Verificar o Modo Ativo

Ao iniciar, o bot mostra:

**Modo Normal:**
```
🎯 Memory mode: PRODUCTION
```

**Modo Low Memory:**
```
🎯 Memory mode: LOW MEMORY
```

---

## 🚀 Recomendações por Plano

### Plano Gratuito (< 100MB):
```bash
START_COMMAND=LOW_MEMORY=true node --max-old-space-size=64 dist/src/index.js
MEMORY=64
```

### Plano Básico (256-512MB):
```bash
START_COMMAND=node --max-old-space-size=256 dist/src/index.js
MEMORY=512
```

### Plano Enterprise-4 (2GB+):
```bash
START_COMMAND=node --max-old-space-size=1024 dist/src/shard.js
MEMORY=2048
```

---

## 🐛 Troubleshooting

### Ainda vendo "High memory usage"?

1. **Verifique o modo:**
   ```bash
   # Deve mostrar: LOW MEMORY
   grep "Memory mode" logs
   ```

2. **Verifique variável de ambiente:**
   ```bash
   echo $LOW_MEMORY
   # Deve retornar: true
   ```

3. **Reduza ainda mais o limite:**
   ```bash
   LOW_MEMORY=true node --max-old-space-size=32 dist/src/index.js
   ```

4. **Desabilite features não essenciais:**
   - Remova comandos pesados
   - Desabilite logging extensivo
   - Reduza cooldowns de cache

---

## 📞 Suporte

Se o problema persistir:

1. Verifique o plano do Vertra
2. Confirme os limites de recursos
3. Considere upgrade para plano com mais RAM
4. Entre em contato com suporte do Vertra

---

## ✅ Checklist de Configuração

- [ ] Variável `LOW_MEMORY=true` configurada
- [ ] Start command atualizado
- [ ] Memory limit ajustado (mínimo 64MB)
- [ ] Bot reiniciado
- [ ] Logs verificados (deve mostrar "LOW MEMORY")
- [ ] Uso de memória abaixo de 80%

---

**Última atualização:** 23/10/2025  
**Versão:** 1.0.0
