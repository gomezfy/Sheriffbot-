# Sheriff Rex Bot - Western Discord Bot

## Overview
Sheriff Rex Bot is a Discord bot with a Wild West theme, offering an immersive experience through an economy system, gambling, mining, bounty hunting, and a web dashboard with e-commerce functionality. It supports real-money purchases for in-game advantages and is designed for independent hosting of both the bot and its accompanying website.

## User Preferences
- Owner ID configured: 339772388566892546
- All admin/owner commands require appropriate permissions
- `/admin` command only visible to server administrators
- Owner-only commands (generatecode, migrate, automodall) require OWNER_ID verification

## Recent Changes (October 29, 2025)
- ✅ **Added Diamond (💎) item to the economy system:**
  - New rare item with 0.1kg weight
  - Can be found in mining (5% chance) and bank robberies (3% chance)
  - Convertible to 41,493 Silver Coins in `/middleman`
  - Uses custom emoji 'gem.png'
  - Fully integrated with inventory system

## Recent Changes (October 28, 2025)
- ✅ Removed music system and all related commands
- ✅ Added full internationalization (i18n) support to `/territories` command
- ✅ Implemented automatic language detection based on user's Discord language preference
- ✅ Added translations in 4 languages: Portuguese (PT-BR), English (EN-US), Spanish (ES-ES), and French (FR)
- ✅ All buttons, labels, messages, and embeds in `/territories` now support multi-language
- ✅ Configured OWNER_ID for owner-only command access
- ✅ Ensured `/admin` command visibility restricted to server administrators only
- ✅ Added emoji synchronization feature (`/admin uploademojis sync`)
- ✅ **Expanded i18n support to additional commands (October 28, 2025):**
  - ✅ All 4 bounty commands now fully internationalized: `/wanted`, `/capture`, `/clearbounty`, `/bounties`
  - ✅ Economy command `/give` now fully internationalized
  - ✅ Added complete translations for give and dice commands in all 4 languages
  - ✅ Fixed TypeScript compilation issues (removed unused imports)
  - ✅ All bounty and give commands now automatically detect and respond in user's Discord language

## System Architecture

### UI/UX Decisions
- **Discord Embeds:** Uses a minimalist, neutral color palette for clean and modern embeds.
- **Visuals:** Generates professional visual leaderboards and profile cards using Canvas, featuring custom fonts, avatar borders, and gradients.
- **Custom Emojis:** Integrates 47 custom emojis to enhance the Western theme.

### Technical Implementations
- **Language & Runtime:** Built with TypeScript on Node.js 20, utilizing `ts-node`.
- **Discord Integration:** Uses `discord.js v14` for all Discord API interactions.
- **Command Structure:** Features 26 slash commands across categories like Admin, Bounty, Economy, Gambling, Mining, Profile, and Utility. Commands are organized with subcommands and subcommand groups to reduce clutter (e.g., `/bounty` with `list`, `wanted`, `capture`, `clear` subcommands, and `/admin` consolidating 11 administrative functions into subcommand groups).
- **Economy System:** Implements a dual economy with "Saloon Tokens" and "Silver Coins."
- **Upgrades & Redemption:** Includes progressive backpack upgrades and a system for redeeming website purchase codes.
- **Image Generation:** Employs `@napi-rs/canvas` for dynamic image rendering.
- **Localization:** Supports PT-BR, EN-US, ES-ES, and FR (French). All commands automatically detect and respond in the user's Discord language preference.
- **Owner Commands:** Restricted commands accessible only to bot owners.
- **Territory Investment:** Allows users to invest in territories (e.g., Saloon Business, Gold Mine Shares) for passive income. The `/territories` command is fully localized in 4 languages with automatic language detection.
- **Mining Session Tracking:** Tracks active and unclaimed mining sessions server-wide.
- **Announcement System:** Advanced announcement features with previews, templates, and targeting.
- **DM Support:** Enabled for user-focused commands.
- **Multilingual Help:** `help` command is fully translated and supports automatic language detection.
- **AutoMod Integration:** Manages Discord AutoMod rules to earn the "Uses AutoMod" badge.

### Feature Specifications
- **Bounty System:** Set, view, and capture bounties with success rates and cooldowns.
- **Mining System:** Offers solo and co-op mining modes.
- **Gambling Games:** Includes Bank Robbery, Casino, Dice, and Poker.
- **PvP Duels:** A system for player-versus-player combat.
- **E-commerce Shop:** Offers in-game items and currency packs via the web dashboard.
- **Automatic Income:** Automatically distributes territory income and weekly Gold Bar rewards.
- **Profile Customization:** Users can purchase and select custom profile backgrounds.

### System Design Choices
- **File-based Storage:** All persistent data is stored in JSON files (`src/data/` or `/app/data/`). Critical: requires volume mounting at `/app/data/` for data persistence.
- **High-Performance Caching:** An in-memory cache layer significantly reduces file I/O for faster response times.
- **Modular Design:** Codebase is organized into `commands`, `data`, `events`, and `utils`.
- **Environment Variables:** Used for sensitive configuration.
- **Performance Optimizations:** Includes Discord.js v14 advanced features, command rate limiting, and Canvas optimization.

## External Dependencies
- **Discord Library:** `discord.js v14`
- **Web Framework:** `Express v5` (for the separate web dashboard)
- **Payment Processing:** `Hotmart API`
- **Canvas Rendering:** `@napi-rs/canvas`
- **Session Management:** `express-session` (for the web dashboard)