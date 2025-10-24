# Sheriff Rex Bot - Western Discord Bot

## Overview
Sheriff Rex Bot is a Discord bot with a Wild West theme, featuring an economy system, gambling, mining, bounty hunting, and an integrated web dashboard with e-commerce. It aims to provide an immersive and interactive Western experience within Discord, including real-money purchase options for in-game advantages. The bot and its accompanying website are designed for independent hosting.

## User Preferences
None specified yet.

## System Architecture

### UI/UX Decisions
- **Minimalist Embed System:** Uses a neutral color palette for clean and modern Discord embeds.
- **Visual Leaderboard:** Generates professional visual leaderboards using Canvas, displaying rankings, top users' images, medals, colored avatar borders, and gradients.
- **Visual Profile Cards:** Employs Canvas with the Nunito font for appealing user profiles and wanted posters.
- **Custom Emojis:** Integrates 47 custom emojis to enhance the Western theme.

### Technical Implementations
- **Language & Runtime:** Built with TypeScript on Node.js 20, using `ts-node`.
- **Discord Integration:** Leverages `discord.js v14` for Discord API interactions.
- **Command Structure:** Features 34 slash commands across various categories (Admin, Bounty, Economy, Gambling, Mining, Profile, Utility).
- **Dual Economy System:** Manages "Saloon Tokens" and "Silver Coins."
- **Progressive Backpack Upgrades:** Implements a system for backpack capacity upgrades.
- **Redemption Code System:** Allows users to redeem website shop purchase codes for in-game items.
- **Canvas Rendering:** Uses `@napi-rs/canvas` for dynamic image generation.
- **Localization:** Supports PT-BR, EN-US, and ES-ES.
- **Owner Commands:** Restricted commands for bot owners using `OWNER_ID`.
- **Separate Hosting:** Bot and web dashboard are designed for separate hosting environments.
- **Territory Investment System:** Allows users to invest in territories (e.g., Saloon Business, Gold Mine Shares) for automatic income.
- **Mining Session Tracker:** Tracks active and unclaimed mining sessions server-wide.

### Feature Specifications
- **Bounty System:** Set, view, and capture bounties with a success rate and cooldown.
- **Mining System:** Includes solo and co-op mining modes.
- **Gambling Games:** Features Bank Robbery, Casino, Dice, and Poker.
- **PvP Duels:** A system for player-versus-player combat.
- **E-commerce Shop:** Offers backpack upgrade tiers and coin packs via the web dashboard.
- **Discord Permissions:** Requires specific bot permissions including "Moderate Members."
- **Automatic Territory Income System:** Automatically distributes territory income to users.
- **Profile Customization:** Allows users to purchase and select custom profile backgrounds.
- **Advanced Announcement System:** Features preview, color presets, customization, targeting, and template system for announcements.
- **DM Support:** Enabled DM functionality for user-focused commands.
- **Multilingual Help System:** `help` command is fully translated and supports automatic language detection.

### System Design Choices
- **File-based Storage:** All persistent data is stored in JSON files within `src/data/` (development) or `/app/data/` (production).
  - ⚠️ **CRITICAL FOR VERTRA:** Data persistence requires volume mounting at `/app/data/` - see `VERTRA_VOLUME_PERSISTENTE.md`
  - Without persistent volume, all user data is lost on restart/redeploy
- **High-Performance Caching:** In-memory cache layer with automatic sync reduces file I/O by 90% for 4-5x faster response times.
- **Modular Design:** Code is organized into `commands`, `data`, `events`, and `utils` directories.
- **Environment Variables:** Utilizes environment variables for sensitive data.
- **Performance Optimizations:** Includes Discord.js v14 advanced features, command rate limiting, and Canvas optimization.

## External Dependencies
- **Discord Library:** `discord.js v14`
- **Web Framework:** `Express v5` (for the separate web dashboard)
- **Payment Processing:** `Hotmart API` (for e-commerce)
- **Canvas Rendering:** `@napi-rs/canvas`
- **Session Management:** `express-session` (for the web dashboard)

## Recent Changes
- **October 24, 2025:**
  - **Territory Image URLs Updated:** Fixed `/territories` command images not displaying
    - Updated all territory image URLs to use current Replit domain
    - Fixed: Saloon Business, Gold Mine Shares, and Ranch images now load correctly
    - Images properly served from website/assets/ via port 5000
  - **Vertra Cloud Data Persistence Documentation:** Created comprehensive guide
    - Added `VERTRA_VOLUME_PERSISTENTE.md` with step-by-step volume configuration
    - Updated `vertracloud.config` with `NODE_ENV=production` and build command
    - Documented critical issue: data lost on restart without persistent volume
    - Provided alternatives: PostgreSQL migration, external services, backups
    - Updated `replit.md` to warn about Vertra data persistence requirements
  - **Mining Sessions Button Integration:** Improved UX for mining session tracking
    - Removed `/mining-sessions` slash command (deprecated)
    - Integrated "📊 Ver Sessões" button directly into `/mine` command
    - Button now appears in ALL `/mine` states: idle, in-progress, and claim-ready
    - Users can view server-wide mining statistics from any mining screen
    - Shows active sessions, unclaimed rewards, progress bars, and time remaining
    - Ephemeral responses ensure privacy and reduce channel clutter
    - Consolidated functionality improves discoverability and accessibility
  - **Automatic Territory Income System:** Implemented automatic territory income distribution
    - Changed payout cooldown from 24 hours to 23 hours for more frequent rewards
    - Created `startAutomaticTerritoryIncome()` function that runs on bot startup
    - System checks every hour for users eligible to receive territory income
    - Automatically credits Silver Coins to user inventory when 23 hours have passed
    - Sends DM notification to users with breakdown of income from each territory
    - Includes 1-second delay between users to avoid Discord rate limiting
    - Integrated into main bot initialization in `index.ts`
    - Users no longer need to manually claim territory income with `/claim-territories`
    - Income data persisted in `territory-income.json` with timestamps
  - **Automatic Mining Notification System:** Fixed critical bug in DM notification persistence
    - System automatically checks every 2 minutes for completed mining sessions
    - Sends private DM notifications when mining completes
    - Fixed bug where failed DM sends weren't persisted, causing infinite retries
    - Added `dataModified` flag to track session changes regardless of DM success
    - System now properly handles blocked users without spam attempts
    - Integrated into bot startup in `index.ts` via `startMiningNotifications()`
    - Created comprehensive documentation in `MINING_SYSTEM.md` and `MINING_TEST_PLAN.md`
  - **Removed `/claim-territories` Command:** System is fully automatic now
    - Users no longer need to manually claim territory income
    - All territory benefits are distributed automatically every 23 hours
    - DM notifications sent automatically when income is credited
    - Simplified user experience - just buy territories and receive passive income
  - **Weekly Gold Bar Rewards Implemented:** Gold Mine Shares now give 2 Gold Bars weekly
    - System tracks weekly cooldown separately from daily income (7 days)
    - Gold Bars automatically credited when 1 week passes
    - Bonus shown in DM notification: "🥇 Weekly Bonus: +2 Gold Bars"
    - Data persisted in `territory-income.json` with `lastGoldPayout` timestamp