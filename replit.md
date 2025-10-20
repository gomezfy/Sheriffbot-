# Sheriff Rex Bot - Western Discord Bot

## Overview
Sheriff Rex Bot is a feature-rich Discord bot with a Wild West theme. It includes a complete economy system, gambling games, mining mechanics, bounty hunting, and an integrated web dashboard with e-commerce functionality powered by Stripe.

**Current Status:** Fully functional and running on Replit
- Bot Name: Sheriff Rex#5281
- Connected to: 3 Discord servers
- Active Users: 1
- Website: **LIVE** on port 5000 with Stripe integration

## Recent Changes
**October 20, 2025** - E-commerce Integration & Minimalist UI
- **NEW:** `/redeem` command - Redeem purchase codes from website shop for backpack upgrades
- **NEW:** E-commerce shop with 4 backpack upgrade tiers (200kg → 500kg, $2.99-$9.99)
- **NEW:** Website restored and running on port 5000 with Stripe payment integration
- **UPDATED:** `/inventory` command - Minimalist design with clean embeds and upgrade suggestions
- **UPDATED:** `inventoryManager.ts` - Simplified `getNextUpgrade()` to show website pricing
- **UPDATED:** `generatecode.ts` - Now supports 4 backpack tiers (backpack_200, backpack_300, backpack_400, backpack_500)
- Implemented minimalist embed system in `/inventory` (blue info embeds, progress bars)
- Website shows next available upgrade with pricing information
- Total Commands: 35 (added `/redeem`)

**October 20, 2025** - Minimalist Modernization
- Created minimalist embed system (`src/utils/embeds.ts`) with neutral color palette
- Implemented new embed system in `/daily` command (green/red/amber colors)
- Added utility functions: `formatCurrency()`, `formatDuration()`, `progressBar()`
- Added Nunito font to all profile cards and wanted posters
- Added Discord timeout punishment to `/bankrob` (30 minutes when captured)

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
│   ├── commands/          # Slash commands (35 total)
│   │   ├── admin/         # Server management (8 commands)
│   │   ├── bounty/        # Bounty system (3 commands)
│   │   ├── economy/       # Economy system (13 commands - includes /redeem)
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
- **35 Commands** across 6 categories
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

This command starts both the Discord bot AND the website server on port 5000

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

## Web Dashboard (LIVE)
The web dashboard is running on port 5000 and includes:

**Active Features:**
- Homepage with bot information and "Add to Discord" button
- **Shop** - Purchase backpack upgrades with Stripe checkout
  - Small Backpack (200kg) - $2.99
  - Medium Backpack (300kg) - $4.99
  - Large Backpack (400kg) - $6.99
  - Ultimate Backpack (500kg) - $9.99
- Dashboard with Discord OAuth (login required)
- User statistics and leaderboards
- Redemption code generation on purchase
- E-commerce tracking in `data/redemption-codes.json`

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
Use this authorization URL:
```
https://discord.com/api/oauth2/authorize?client_id=1426734768111747284&permissions=277025770496&scope=bot%20applications.commands
```

### Required Bot Permissions
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Use Slash Commands

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
