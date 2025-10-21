# Sheriff Rex Bot - Western Discord Bot

## Overview
Sheriff Rex Bot is a feature-rich Discord bot with a Wild West theme, offering an economy system, gambling games, mining mechanics, bounty hunting, and an integrated web dashboard with e-commerce functionality. The project aims to provide an immersive and interactive Western experience within Discord, complete with real-money purchase options for in-game advantages. The bot is designed for independent hosting and its accompanying website is provided for separate deployment.

## User Preferences
None specified yet.

## System Architecture

### UI/UX Decisions
- **Minimalist Embed System:** Utilizes a neutral color palette (green/red/amber/blue/gray/gold) for clean and modern Discord embeds.
- **Visual Leaderboard:** Generates professional visual leaderboards using Canvas, featuring rankings for up to 10 users, images of the top 3 richest, medals, colored avatar borders, and elegant gradients.
- **Visual Profile Cards:** Uses Canvas with the Nunito font for visually appealing user profiles and wanted posters.
- **Custom Emojis:** Incorporates 47 custom emojis to enhance the Western theme immersion.

### Technical Implementations
- **Language & Runtime:** Built with TypeScript on Node.js 20, using `ts-node` for direct execution.
- **Discord Integration:** Leverages `discord.js v14` for all Discord API interactions.
- **Command Structure:** Features 34 slash commands categorized into Admin, Bounty, Economy, Gambling, Mining, Profile, and Utility.
- **Dual Economy System:** Manages both "Saloon Tokens" and "Silver Coins."
- **Progressive Backpack Upgrades:** Implements a system for backpack capacity upgrades (100kg to 500kg).
- **Redemption Code System:** Allows users to redeem purchase codes from the website shop for in-game items.
- **Canvas Rendering:** Uses `@napi-rs/canvas` for generating dynamic images like leaderboards and profile cards.
- **Localization:** Supports 3 languages: PT-BR, EN-US, ES-ES.
- **Owner Commands:** Restricted commands for bot owners, using `OWNER_ID` for authentication.
- **Separate Hosting:** The bot and its web dashboard (e-commerce) are designed for separate hosting environments.

### Feature Specifications
- **Bounty System:** Allows setting, viewing, and capturing bounties with a 50% success rate and cooldown.
- **Mining System:** Includes solo and co-op mining modes.
- **Gambling Games:** Features Bank Robbery, Casino, Dice, and Poker.
- **PvP Duels:** A system for player-versus-player combat.
- **E-commerce Shop:** Offers 4 backpack upgrade tiers and coin packs via the web dashboard.
- **Discord Permissions:** Requires specific bot permissions including "Moderate Members" for features like timeout punishments.

### System Design Choices
- **File-based Storage:** All persistent data is stored in JSON files within the `src/data/` directory (e.g., `economy.json`, `profiles.json`, `bounties.json`).
- **Modular Design:** Code is organized into `commands`, `data`, `events`, and `utils` directories for maintainability.
- **Environment Variables:** Utilizes environment variables for sensitive data like Discord tokens, API keys, and configuration settings.

## External Dependencies
- **Discord Library:** `discord.js v14`
- **Web Framework:** `Express v5` (for the separate web dashboard)
- **Payment Processing:** `Hotmart API` (for e-commerce and digital products)
- **Canvas Rendering:** `@napi-rs/canvas`
- **Session Management:** `express-session` (for the web dashboard)

## Recent Changes
- **October 21, 2025:** 
  - **Enhanced Leaderboard Design:** Completely redesigned /leaderboard with modern gradients, star-shaped badges for Top 3, Hall of Fame panel with large avatars, glow effects, user position highlighting, and expanded 1400x900px canvas
  - **Payment Migration:** Migrated payment processing from PayPal to Hotmart API
    - Implemented Hotmart OAuth 2.0 authentication
    - Added webhook integration for payment notifications (PURCHASE_COMPLETE, PURCHASE_APPROVED, PURCHASE_REFUNDED, PURCHASE_CANCELED)
    - Created comprehensive setup documentation (HOTMART_SETUP.md)
    - Updated shop.html with Hotmart checkout flow
    - Removed all PayPal dependencies and references