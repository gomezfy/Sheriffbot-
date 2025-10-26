# 🛡️ Sheriff Bot - Documentação de Segurança

## Visão Geral

Este documento descreve as medidas de segurança implementadas no Sheriff Bot para proteger contra ataques maliciosos, exploits e uso indevido.

## 🔒 Medidas de Segurança Implementadas

### 1. Autenticação e Autorização

#### Validação de Proprietário (Owner)
- **Arquivo**: `src/utils/security.ts`
- **Função**: `isOwner()` e `validateOwnerId()`

**Proteções:**
- ✅ Valida que `OWNER_ID` está definido nas variáveis de ambiente
- ✅ Previne execução de comandos admin se `OWNER_ID` não estiver configurado
- ✅ Mensagens de erro claras para configuração incorreta
- ✅ Logs de segurança para tentativas de acesso não autorizado

**Comandos Protegidos:**
- `/addgold` - Adicionar Saloon Tokens
- `/addsilver` - Adicionar Silver Coins
- `/addtokens` - Adicionar tokens
- `/removegold` - Remover tokens
- `/addbackpack` - Aumentar capacidade de inventário
- `/setuptoken` - Dar tokens iniciais
- `/generatecode` - Gerar códigos de resgate
- `/migrate` - Migração de dados

**Vulnerabilidade Corrigida:**
- ❌ **ANTES**: `setuptoken.ts` tinha OWNER_ID hardcoded (`'339772388566892546'`)
- ✅ **DEPOIS**: Usa `process.env.OWNER_ID` com validação adequada

### 2. Limitação de Taxa (Rate Limiting)

#### Rate Limiting Global
- **Arquivo**: `src/index.ts`
- **Cooldown**: 1 segundo entre comandos (por usuário)

#### Rate Limiting de Comandos Admin
- **Arquivo**: `src/utils/security.ts`
- **Classe**: `AdminRateLimiter`
- **Cooldown**: 1 segundo entre comandos administrativos

**Proteções:**
- ✅ Previne spam de comandos admin
- ✅ Evita condições de corrida em operações de arquivo
- ✅ Protege contra sobrecarga do sistema de cache
- ✅ Limpeza automática de entradas antigas (5 minutos)

#### Rate Limiting de Jogos
- **Casino**: 10 segundos
- **Poker**: 15 segundos
- **Dice**: 30 segundos
- **Duel**: 30 segundos
- **Bank Rob**: 5 minutos

### 3. Validação de Entrada

#### Limites de Moeda
- **Arquivo**: `src/utils/security.ts`
- **Constantes**:
  - `MAX_CURRENCY_AMOUNT`: 1.000.000.000 (1 bilhão)
  - `MAX_BET_AMOUNT`: 10.000.000 (10 milhões)
  - `MAX_BOUNTY_AMOUNT`: 100.000.000 (100 milhões)

**Proteções:**
- ✅ Previne integer overflow em operações matemáticas
- ✅ Valida que valores estão dentro de `Number.MAX_SAFE_INTEGER`
- ✅ Limites máximos em todos os comandos de moeda
- ✅ Validação antes de multiplicações (ganhos de jogos)

**Comandos com Validação:**
- `/addgold` - Máximo 1 bilhão
- `/addsilver` - Máximo 1 bilhão
- `/poker` - Aposta máxima 10 milhões
- `/dice` - Aposta máxima 10 milhões
- `/duel` - Aposta máxima 10 milhões
- `/wanted` - Recompensa máxima 100 milhões

#### Validação de Códigos de Resgate
- **Função**: `isValidRedemptionCode()`
- **Formato**: `SHERIFF-[A-Z0-9_-]{1,90}`
- **Comprimento máximo**: 100 caracteres

**Proteções:**
- ✅ Previne códigos malformados
- ✅ Evita DoS via códigos extremamente longos
- ✅ Valida formato antes de processar

#### Validação de Mensagens de Anúncio
- **Função**: `validateAnnouncementMessage()`
- **Comprimento máximo**: 4000 caracteres (limite do Discord)

**Proteções:**
- ✅ Previne mensagens excessivamente longas
- ✅ Remove bytes nulos
- ✅ Sanitiza caracteres especiais

### 4. Proteção Contra Path Traversal

#### Validação de Nomes de Arquivo
- **Arquivo**: `src/utils/database.ts`
- **Função**: `isValidDataFilename()`

**Arquivos Permitidos (Whitelist):**
```typescript
[
  'daily.json', 'economy.json', 'economy.backup.json',
  'profiles.json', 'xp.json', 'inventory.json',
  'wanted.json', 'welcome.json', 'logs.json',
  'bounties.json', 'backgrounds.json', 'punishment.json',
  'mining.json', 'work.json', 'redemption-codes.json'
]
```

**Proteções:**
- ✅ Previne leitura de arquivos arbitrários (`../../../etc/passwd`)
- ✅ Previne leitura de variáveis de ambiente (`.env`)
- ✅ Logs de segurança para tentativas de acesso inválido
- ✅ Exceção lançada para filenames inválidos

### 5. Proteção Contra Integer Overflow

#### Verificação de Multiplicação Segura
- **Função**: `isSafeMultiplication()`
- **Uso**: Antes de calcular ganhos em jogos

**Exemplo (Casino):**
```typescript
// Antes de calcular ganhos
if (won && !isSafeMultiplication(bet, multiplier)) {
  // Reembolsa aposta se overflow ocorreria
  addUserGold(userId, bet);
  return;
}
```

**Proteções:**
- ✅ Previne overflow em cálculos de ganhos
- ✅ Reembolso automático se operação seria insegura
- ✅ Valida resultado está dentro de `MAX_CURRENCY_AMOUNT`

#### Verificação de Adição Segura
- **Função**: `isSafeAddition()`
- **Uso**: Antes de adicionar grandes quantidades

**Proteções:**
- ✅ Previne overflow ao adicionar moedas
- ✅ Valida que resultado é um inteiro seguro

### 6. Proteção Contra Condições de Corrida

#### Transaction Lock Manager
- **Arquivo**: `src/utils/security.ts`
- **Classe**: `TransactionLockManager`

**Funcionalidade:**
```typescript
const release = await transactionLockManager.acquire([userId1, userId2]);
try {
  // Operações críticas aqui
  // Re-verificar saldos
  // Executar transação
} finally {
  release();
}
```

**Proteções:**
- ✅ Previne double-spending
- ✅ Garante atomicidade de transações
- ✅ Ordena locks para prevenir deadlocks
- ✅ Liberação automática via finally

**Vulnerabilidade Corrigida:**
- ❌ **ANTES**: Duel verificava saldo no início, mas deduzia após 30 segundos
- ✅ **DEPOIS**: Re-verifica saldo imediatamente antes de deduzir

### 7. Sanitização de Erros

#### Proteção Contra Vazamento de Informações
- **Função**: `sanitizeErrorForLogging()`

**Informações Removidas:**
- ✅ Caminhos de arquivo completos
- ✅ Tokens e secrets (strings hex longas)
- ✅ Valores de variáveis de ambiente
- ✅ Stack traces completos

**Exemplo:**
```typescript
// ANTES (vazava informações)
error: error.stack || error.message

// DEPOIS (sanitizado)
error: sanitizeErrorForLogging(error)
```

### 8. Validação de Permissões

#### Comandos Admin
- **Permissão**: `Administrator` (Discord)
- **Método**: `.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)`

**Comandos Protegidos:**
- `/setlogs` - Configurar sistema de logs
- `/setwelcome` - Configurar mensagens de boas-vindas
- `/announcement` - Enviar anúncios

#### Comandos Owner-Only
- **Permissão**: Verificação de `OWNER_ID`
- **Método**: `.setDefaultMemberPermissions(0)` + validação runtime

**Proteção em Camadas:**
1. Discord não mostra comando para não-admins
2. Validação runtime se comando for invocado diretamente
3. Rate limiting adicional

### 9. Sistema de Punição

#### Jail System
- **Arquivo**: `src/utils/punishmentManager.ts`
- **Duração**: 30 minutos

**Comandos Bloqueados Durante Punição:**
- Todos os comandos de economia
- Todos os comandos de jogo
- Comandos de transferência

**Comandos Permitidos:**
- `/help` - Ajuda
- `/ping` - Status
- `/inventory` - Ver inventário
- `/profile` - Ver perfil
- `/bounties` - Ver recompensas

## 🚨 Vulnerabilidades Corrigidas

### Críticas

1. **Hardcoded Owner ID** ⚠️ **CRÍTICO**
   - **Arquivo**: `src/commands/economy/setuptoken.ts`
   - **Problema**: OWNER_ID hardcoded permitia acesso permanente a usuário específico
   - **Correção**: Usa `process.env.OWNER_ID` com validação

2. **Missing Owner ID Validation** ⚠️ **CRÍTICO**
   - **Problema**: Se `OWNER_ID` não estivesse definido, qualquer usuário poderia executar comandos admin
   - **Correção**: Validação explícita com mensagem de erro

3. **Missing Return Statements** ⚠️ **ALTO**
   - **Arquivo**: `src/commands/economy/setuptoken.ts`
   - **Problema**: Comando continuava executando após negar acesso
   - **Correção**: Adicionado `return` após todas as verificações de permissão

### Altas

4. **Integer Overflow** ⚠️ **ALTO**
   - **Problema**: Sem limites máximos em apostas e moedas
   - **Correção**: Limites máximos + validação de overflow

5. **Race Conditions** ⚠️ **ALTO**
   - **Problema**: Saldo verificado no início, mas deduzido depois
   - **Correção**: Re-verificação imediata antes de dedução + locks

### Médias

6. **Path Traversal** ⚠️ **MÉDIO**
   - **Problema**: Sem validação de filename em operações de arquivo
   - **Correção**: Whitelist de arquivos permitidos

7. **Information Leakage** ⚠️ **MÉDIO**
   - **Problema**: Stack traces completos em logs
   - **Correção**: Sanitização de erros antes de logging

## 📋 Checklist de Segurança

### Para Desenvolvedores

- [ ] Sempre use `isOwner()` para comandos admin
- [ ] Sempre adicione `return` após verificações de permissão
- [ ] Use `isValidCurrencyAmount()` para validar quantidades
- [ ] Use `isSafeMultiplication()` antes de calcular ganhos
- [ ] Use `transactionLockManager` para operações críticas
- [ ] Sanitize user input com `sanitizeInput()`
- [ ] Use `sanitizeErrorForLogging()` para logs de erro
- [ ] Adicione rate limiting para novos comandos sensíveis
- [ ] Valide todos os inputs do usuário
- [ ] Nunca hardcode IDs, tokens ou secrets

### Para Deployment

- [ ] Definir `OWNER_ID` nas variáveis de ambiente
- [ ] Definir `DISCORD_TOKEN` nas variáveis de ambiente
- [ ] Definir `SESSION_SECRET` (64 caracteres hex aleatórios)
- [ ] Verificar permissões de arquivo em `data/`
- [ ] Configurar logs de segurança
- [ ] Testar comandos admin com usuário não-owner
- [ ] Testar rate limiting
- [ ] Verificar que `.env` não está no repositório

## 🔍 Monitoramento

### Logs de Segurança

O bot registra as seguintes tentativas de segurança:

1. **Tentativas de acesso não autorizado**
   - Usuários tentando executar comandos owner
   - Tentativas de path traversal

2. **Operações suspeitas**
   - Valores fora dos limites
   - Tentativas de overflow
   - Códigos de resgate inválidos

3. **Erros de sistema**
   - Falhas de transação
   - Erros de arquivo
   - Problemas de cache

### Recomendações

- Monitore logs regularmente
- Configure alertas para tentativas de acesso não autorizado
- Revise transações de alto valor
- Faça backup regular dos dados
- Mantenha dependências atualizadas

## 🆘 Reportando Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Entre em contato com o proprietário do bot diretamente
3. Forneça detalhes da vulnerabilidade
4. Aguarde confirmação antes de divulgar

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Discord.js Security Best Practices](https://discordjs.guide/popular-topics/common-questions.html#security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 📝 Changelog de Segurança

### 2025-10-23
- ✅ Adicionado módulo de segurança centralizado (`security.ts`)
- ✅ Corrigido hardcoded OWNER_ID em `setuptoken.ts`
- ✅ Adicionada validação de OWNER_ID em todos os comandos admin
- ✅ Implementado rate limiting para comandos admin
- ✅ Adicionados limites máximos para moedas e apostas
- ✅ Implementada proteção contra integer overflow
- ✅ Adicionada validação de path traversal
- ✅ Implementada sanitização de erros
- ✅ Corrigidas condições de corrida em transações
- ✅ Adicionado Transaction Lock Manager
- ✅ Documentação de segurança criada

---

**Última atualização**: 2025-10-23
**Versão**: 1.0.0
