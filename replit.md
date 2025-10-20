# Sheriff Rex Bot - Western Discord Bot

## Overview
Sheriff Rex Bot is a feature-rich Discord bot with a Wild West theme. It includes a complete economy system, gambling games, mining mechanics, bounty hunting, and an integrated web dashboard with e-commerce functionality powered by Stripe.

**Current Status:** Bot pronto para hospedagem independente
- Bot Name: Sheriff Rex#5281
- Connected to: 3 Discord servers
- Active Users: 1
- Website: Removido (disponível em website.zip para hospedagem separada)

## Recent Changes
**October 20, 2025** - Leaderboard Visual com Canvas
- **UPDATED:** `/leaderboard` - Agora gera imagem visual profissional com canvas
- **DESIGN:** Lado esquerdo mostra rankings de até 10 usuários
- **DESIGN:** Lado direito mostra fotos dos 3 primeiros mais ricos
- **FEATURES:** Medalhas 🥇🥈🥉, avatares com bordas coloridas, gradientes elegantes
- Suporta categorias: Saloon Tokens e Silver Coins

**October 20, 2025** - Limpeza de Comandos Desnecessários
- **REMOVED:** `/work` command - Removido (comando não estava sendo usado)
- **REMOVED:** `/claim` command - Removido (substituído pelo sistema de bounty)
- Total de comandos: 34 (reduzido de 36)

**October 20, 2025** - Sistema de Captura de Outlaws Implementado
- **NEW:** `/capture` command - Capture wanted outlaws and claim bounty rewards!
- **FEATURES:** 50% success rate, 30-minute cooldown, complete bounty system integration
- **REWARDS:** Automatically receive silver coins from bounty pool when successful
- Sistema de bounty agora está completo: colocar recompensa → visualizar → capturar

**October 20, 2025** - Comandos de Owner Restritos + Correções de Bugs
- **FIXED:** `/leaderboard` - Adicionado `return` statements faltando
- **FIXED:** `/casino` - Corrigido `InteractionAlreadyReplied` error com `return` statements
- **FIXED:** `/bankrob` - Corrigido permissão de timeout (verifica `ModerateMembers` antes)
- **UPDATED:** Comandos de Owner agora usam `OWNER_ID` do environment (7 comandos)
- **UPDATED:** Comandos Owner só aparecem para o dono do bot (.setDefaultMemberPermissions(0))
- **UPDATED:** Substituído deprecated `ephemeral: true` por `flags: [MessageFlags.Ephemeral]`
- **UPDATED:** Substituído deprecated `fetchReply: true` por `response.fetch()`
- Comandos restritos: addgold, addsilver, addtokens, addbackpack, removegold, generatecode, migrate

**October 20, 2025** - Preparação para Hospedagem Separada
- **REMOVIDO:** Arquivos do website da raiz do projeto (index.html, shop.html, dashboard.html, etc)
- **REMOVIDO:** Pasta routes/ e js/ (código do servidor web)
- **REMOVIDO:** server.ts da raiz
- **ATUALIZADO:** src/index.ts - Removida inicialização do servidor web
- **ATUALIZADO:** website.zip (21 KB) - Backup completo com correções ES6
- **ATUALIZADO:** Workflow agora é apenas "Sheriff Bot" (sem website)
- Bot pronto para hospedar na **Vertra Cloud** (Discord apenas)
- Website disponível em website.zip para hospedar separadamente na **Vertra Cloud**

**October 20, 2025** - E-commerce Integration & Minimalist UI
- **NEW:** `/redeem` command - Redeem purchase codes from website shop for backpack upgrades
- **NEW:** E-commerce shop with 4 backpack upgrade tiers (200kg → 500kg, $2.99-$9.99)
- **NEW:** Website restored and running on port 5000 with Stripe payment integration
- **UPDATED:** `/inventory` command - Minimalist design with clean embeds and upgrade suggestions
- **UPDATED:** `/work` command - Minimalist design, removed broken XP system, added proper cooldown handling
- **UPDATED:** `/wanted` command - Fixed import error, minimalist design with proper embed system
- **UPDATED:** `/give` command - Fixed missing return statements, removed undefined properties, minimalist design
- **UPDATED:** `/bounties` command - Fixed amount property (amount → totalAmount), minimalist design
- **UPDATED:** `/clearbounty` command - Fixed amount property, temporarily disabled for maintenance
- **UPDATED:** `inventoryManager.ts` - Simplified `getNextUpgrade()` to show website pricing
- **UPDATED:** `generatecode.ts` - Now supports 4 backpack tiers (backpack_200, backpack_300, backpack_400, backpack_500)
- **FIXED:** Critical bug in `/work` - removed non-functional addUserXP, fixed missing return in cooldown
- **FIXED:** Critical bug in `/wanted` - wrong function name + wrong property (amount → totalAmount)
- **FIXED:** Critical bug in `/give` - missing return statements caused continued execution, undefined properties crash
- **FIXED:** Critical bug in `/bounties` - wrong property (amount → totalAmount)
- **FIXED:** Critical bug in `/clearbounty` - wrong property + missing returns
- Implemented minimalist embed system in 6 commands (`/inventory`, `/work`, `/wanted`, `/give`, `/bounties`, `/clearbounty`)
- All 35 commands synchronized successfully with Discord
- Website shows next available upgrade with pricing information
- Total Commands: 35 (added `/redeem`)

**October 20, 2025** - Minimalist Modernization
- Created minimalist embed system (`src/utils/embeds.ts`) with neutral color palette
- Implemented new embed system in `/daily` command (green/red/amber colors)
- Added utility functions: `formatCurrency()`, `formatDuration()`, `progressBar()`
- Added Nunito font to all profile cards and wanted posters
- Added Discord timeout punishment to `/bankrob` (30 minutes when captured)
- **UPDATED:** `/bankrob` - Automatic wanted poster creation for escapees only (not for captured outlaws)

**October 19, 2025** - TypeScript Migration & Replit Setup
- Migrated entire codebase from JavaScript to TypeScript (56 files)
- Removed all Discloud references and configurations
- Installed Node.js 20, TypeScript, and all dependencies
- Configured environment secrets (Discord tokens, session secret)
- Created workflow for bot + website (single process with ts-node)
- Configured deployment settings for VM (always-on bot)
- Added .gitignore for node_modules, .env, data files, and TypeScript artifacts
- Created .env.example with all required environment variables
- Updated all commands, events, and utilities with proper TypeScript types

## Project Architecture

### Structure
```
sheriff-bot/
├── src/                    # Bot source code
│   ├── commands/          # Slash commands (34 total)
│   │   ├── admin/         # Server management (8 commands)
│   │   ├── bounty/        # Bounty system (4 commands - includes /capture)
│   │   ├── economy/       # Economy system (11 commands - includes /redeem)
│   │   ├── gambling/      # Casino games (5 commands)
│   │   ├── mining/        # Mining system (1 command)
│   │   ├── profile/       # User profiles (3 commands)
│   │   └── utility/       # Helper commands (2 commands)
│   ├── data/              # JSON database files
│   ├── events/            # Discord event handlers (TypeScript)
│   ├── utils/             # Utility modules (TypeScript)
│   │   ├── embeds.ts      # 🆕 Minimalist embed system
│   │   └── ...            # Other utility modules
│   ├── deploy-commands.ts # Register slash commands
│   └── index.ts           # Main bot entry point
├── assets/                # Bot assets (avatar, images, fonts)
│   └── fonts/             # Nunito font family
├── server.ts              # 🆕 Express website server with Stripe
├── *.html                 # Website pages (index, shop, dashboard)
└── tsconfig.json          # TypeScript configuration
```

### Key Features
- **34 Commands** across 6 categories
- **Minimalist Embed System** with neutral color palette (green/red/amber/blue/gray/gold)
- **E-commerce Shop** with 4 backpack upgrade tiers ($2.99-$9.99)
- **Stripe Payment Processing** for real money purchases
- **Redemption Code System** - Purchase on website, redeem in Discord
- **47 Custom Emojis** for immersive Western theme
- **3 Languages** supported (PT-BR, EN-US, ES-ES)
- **Dual Economy** system (Saloon Tokens + Silver Coins)
- **Progressive Backpack Upgrades** (100kg → 200kg → 300kg → 400kg → 500kg)
- **Work System** with 5 Western-themed jobs
- **Leaderboard Rankings** (Top 10 users)
- **PvP Duels** system
- **Mining System** (Solo + Co-op modes)
- **Gambling Games** (Bank Robbery, Casino, Dice, Poker)
- **Bounty System** with wanted posters
- **Visual Profile Cards** using Canvas with Nunito font
- **Web Dashboard** with Discord OAuth

### Technology Stack
- **Language:** TypeScript (compiled with ts-node)
- **Runtime:** Node.js 20
- **Discord Library:** discord.js v14
- **Web Framework:** Express v5
- **Payment Processing:** Stripe
- **Canvas Rendering:** @napi-rs/canvas
- **Session Management:** express-session
- **Database:** JSON file-based storage

## Environment Variables

### Required Secrets (Already Configured)
- `DISCORD_TOKEN` - Bot authentication token
- `CLIENT_ID` - Discord application client ID
- `DISCORD_CLIENT_SECRET` - OAuth secret for dashboard login
- `SESSION_SECRET` - Secure session encryption key
- `OWNER_ID` - Discord User ID do dono do bot (para comandos de owner)

### Optional Secrets (For Payment Processing)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key (client-side)
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

### Auto-Configured by Replit
- `REPL_SLUG` - Replit project slug
- `REPL_OWNER` - Replit username
- `PORT` - Server port (5000)

## Running the Project

### Development
The project automatically runs via the configured workflow:
```bash
ts-node src/index.ts
```

This command starts ONLY the Discord bot (website removed for separate hosting)

### Deploying Slash Commands
If you add new commands or modify existing ones:
```bash
ts-node src/deploy-commands.ts
```

### TypeScript Compilation
The project uses `ts-node` for direct TypeScript execution without a build step. If you need to compile to JavaScript:
```bash
tsc
```
This will generate compiled JavaScript in the `dist/` directory according to `tsconfig.json`.

### Production Deployment
The project is configured for VM deployment (always-on) since it's a stateful Discord bot that needs to maintain persistent connections.

## Web Dashboard (Separado)
O website foi removido deste projeto e está disponível em `website.zip` para hospedar separadamente na **Vertra Cloud**.

**Conteúdo do website.zip (21 KB):**

**Arquivos incluídos:**
- `server.ts` (10.4 KB) - Servidor Express com Stripe
- `routes/dashboard.ts` (7.5 KB) - API do dashboard
- `index.html` (35 KB) - Homepage
- `shop.html` (14 KB) - Loja com 4 upgrades ($2.99-$9.99)
- `dashboard.html` (15 KB) - Dashboard com Discord OAuth
- `success.html` / `cancel.html` - Páginas de pagamento

**Features:**
- Sistema de pagamento Stripe completo
- Discord OAuth para login
- 4 produtos de upgrade de mochila
- Geração automática de códigos de resgate
- Dashboard com estatísticas e configurações

## Data Storage
All data is stored in JSON files in the `src/data/` directory:
- `economy.json` - User balances and transactions
- `profiles.json` - User profiles and settings
- `inventory.json` - User items and backpacks
- `bounties.json` - Active bounties
- `wanted.json` - Wanted poster configurations
- `redemption-codes.json` - Generated purchase codes
- `logs.json` - Server log configurations
- And more...

## Adding the Bot to Discord
Use this authorization URL (with Moderate Members permission):
```
https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=1376537398272&scope=bot%20applications.commands
```

### Required Bot Permissions
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Use Slash Commands
- **Moderate Members** (for timeout punishment in /bankrob)

### Required Gateway Intents
- Server Members Intent
- Message Content Intent
- Presence Intent

## User Preferences
None specified yet.

## Troubleshooting

### Bot Not Responding
1. Check workflow is running (should show "RUNNING" status)
2. Verify `DISCORD_TOKEN` is valid
3. Check Discord Developer Portal for intent settings
4. Review logs for connection errors
5. Run `ts-node src/deploy-commands.ts` to re-register commands

### Website Not Working
- The website is archived in `website.zip`
- See `WEBSITE_README.md` for restoration instructions

### Payment Issues (if website restored)
1. Ensure `STRIPE_SECRET_KEY` is configured
2. Verify Stripe account is in live mode (for production)
3. Check webhook configuration matches Stripe dashboard

## Support Commands
- `/help` - View all available commands
- `/ping` - Check bot latency
- `/profile` - View your Western profile
- `/leaderboard` - See top players

## Notes
- The bot uses file-based JSON storage (not a traditional database)
- Data files are gitignored to prevent data loss during version control
- Sessions are stored in memory (will reset on server restart)
- For production, consider implementing database persistence
