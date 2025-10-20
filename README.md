# Sheriff Rex Bot 🤠

A feature-rich Discord bot with a Wild West theme featuring:
- 34 slash commands
- Complete economy system (Saloon Tokens + Silver Coins)
- Gambling games (Bank Robbery, Casino, Dice, Poker)
- Mining system (Solo + Co-op modes)
- Bounty hunting system
- Visual profile cards and wanted posters

## Quick Start

1. **Configure Secrets**
   - Set `DISCORD_TOKEN` in environment secrets
   - Set `CLIENT_ID` in environment secrets
   - Optional: `DISCORD_CLIENT_SECRET`, `SESSION_SECRET` for web features

2. **Run the Bot**
   ```bash
   ts-node src/index.ts
   ```

3. **Deploy Commands**
   ```bash
   ts-node src/deploy-commands.ts
   ```

## Documentation

See [replit.md](./replit.md) for complete documentation including:
- Project architecture
- Command reference
- Environment variables
- Troubleshooting guide

## Website

The web dashboard has been archived to `website.zip`. See [WEBSITE_README.md](./WEBSITE_README.md) for restore instructions.

## Status

✅ **Online:** Sheriff Rex#5281  
✅ **Servers:** 3  
✅ **Commands:** 34  
✅ **Framework:** Discord.js v14 + TypeScript
