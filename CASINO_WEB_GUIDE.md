# 🎰 Casino Web Interface - Guia Completo

## ✅ Status: FUNCIONANDO PERFEITAMENTE

O comando `/casino` agora abre uma interface web interativa, igual ao Wordle Bot!

## 🎮 Como Funciona

### 1. **No Discord**
Quando um usuário digita `/casino`, o bot:
- Cria uma sessão única e segura (expira em 30 minutos)
- Envia um botão "🎰 Play Casino"
- O botão abre a interface web em uma nova aba

### 2. **Na Interface Web**
A página mostra:
- Slot machine animado com 3 rolos
- Saldo em tempo real
- Controles de aposta (10, 50, 100, 500 ou valor customizado)
- Botão SPIN grande e chamativo
- Estatísticas (Vitórias, Derrotas, Streak)
- Tabela de pagamentos completa

### 3. **Animação**
- Os rolos giram um por um (efeito dramático)
- Primeiro rolo para → segundo rolo para → terceiro rolo para
- Resultado é exibido com cores e mensagens

## 🎨 Recursos da Interface

### Visual
- ✨ Gradiente moderno (azul escuro para roxo)
- 🌟 Animações suaves e profissionais
- 💫 Efeitos de brilho no título
- 🎰 Design de slot machine realístico
- 📱 Responsivo (funciona em mobile)

### Funcionalidades
- 💰 Saldo atualiza automaticamente
- 🔥 Sistema de streak de vitórias
- 📊 Estatísticas rastreadas
- ⚡ Resultados instantâneos
- 🎯 Validação de apostas

### Segurança
- 🔐 Sessões únicas e temporárias
- ⏰ Expiração automática (30 min)
- ✅ Validação server-side
- 🛡️ Proteção contra fraudes

## 💎 Multiplicadores

| Símbolos | Multiplicador | Prêmio |
|----------|--------------|--------|
| 💎💎💎 | x50 | MEGA JACKPOT |
| ⭐⭐⭐ | x20 | SUPER WIN |
| 🔔🔔🔔 | x10 | BIG WIN |
| 🍊🍊🍊 | x5 | GREAT WIN |
| 🍋🍋🍋 | x3 | NICE WIN |
| 🍒🍒🍒 | x2.5 | WIN |
| 💎💎 | x5 | DIAMOND BONUS |
| ⭐⭐ | x2 | STAR PAIR |
| 🔔🔔 | x1.5 | BELL PAIR |
| Outros | x1.2 | SMALL WIN |

## 🔧 Arquitetura Técnica

### Backend (Express Server)
- **Porta:** 5000
- **Rotas:**
  - `POST /api/casino/create-session` - Criar sessão de jogo
  - `GET /api/casino/session/:sessionId` - Obter dados da sessão
  - `POST /api/casino/spin` - Processar jogada
- **Arquivos Estáticos:** `/public/casino/game.html`

### Frontend (HTML/CSS/JavaScript)
- **Arquivo:** `public/casino/game.html`
- **Tecnologias:** HTML5, CSS3, JavaScript Vanilla
- **Animações:** CSS Animations + JavaScript timing
- **API Calls:** Fetch API

### Bot Discord
- **Comando:** `/casino`
- **Integração:** Cria sessão via API e envia link
- **Botão:** Link direto para a interface web

## 📁 Estrutura de Arquivos

```
project/
├── public/
│   └── casino/
│       └── game.html         # Interface do jogo
├── src/
│   ├── commands/gambling/
│   │   └── casino.ts         # Comando Discord
│   └── linked-roles-server.ts # Servidor Express
└── package.json
```

## 🚀 Comandos Úteis

```bash
# Iniciar tudo (Bot + Web Server)
npm run start:all

# Build do projeto
npm run build

# Testar servidor
curl http://localhost:5000/health

# Criar sessão de teste
curl -X POST http://localhost:5000/api/casino/create-session \
  -H "Content-Type: application/json" \
  -d '{"userId":"123"}'
```

## 🌐 URLs

- **Web Server:** https://[seu-replit-domain]
- **Interface Casino:** https://[seu-replit-domain]/casino/game.html
- **Health Check:** https://[seu-replit-domain]/health

## 🎯 Próximas Melhorias Possíveis

- [ ] Sons e efeitos sonoros
- [ ] Modo turbo (jogar mais rápido)
- [ ] Histórico de jogadas
- [ ] Leaderboard global
- [ ] Missões diárias
- [ ] Jackpot progressivo
- [ ] Temas customizáveis
- [ ] Multi-idioma

## ✅ Checklist de Funcionamento

- [x] Servidor Express rodando na porta 5000
- [x] Arquivos estáticos sendo servidos
- [x] API de criação de sessão funcionando
- [x] API de jogada (spin) funcionando
- [x] Interface HTML carregando
- [x] Animações funcionando
- [x] Saldo atualizando
- [x] Estatísticas rastreando
- [x] Integração Discord funcionando
- [x] Botão de link funcionando

## 🎉 Conclusão

O sistema está 100% funcional! Os usuários podem agora jogar casino em uma interface web bonita e profissional, direto do Discord!

**Comandos removidos:** `/rank`, `/poker`
**Novo sistema:** `/casino` com interface web interativa
