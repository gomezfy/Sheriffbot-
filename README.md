# Sheriff Rex Bot 🤠

A feature-rich Discord bot with a Wild West theme featuring:
- 34 slash commands
- Complete economy system (Saloon Tokens + Silver Coins)
- Gambling games (Bank Robbery, Casino, Dice, Poker)
- Mining system (Solo + Co-op modes)
- Bounty hunting system
- Visual profile cards and wanted posters

## Quick Start

### Desenvolvimento Local (Replit)

1. **Configure Secrets**
   - Set `DISCORD_TOKEN` in environment secrets
   - Set `CLIENT_ID` in environment secrets
   - Optional: `DISCORD_CLIENT_SECRET`, `SESSION_SECRET` for web features

2. **Run the Bot**
   ```bash
   npm start
   ```

3. **Deploy Commands**
   ```bash
   npm run deploy
   ```

### Deploy em Produção (Vertra Cloud)

Para fazer deploy do bot no Vertra Cloud:
- 📋 **Guia Rápido:** Veja [QUICK_START_VERTRA.txt](./QUICK_START_VERTRA.txt)
- 📖 **Documentação Completa:** Veja [DEPLOY_VERTRA.md](./DEPLOY_VERTRA.md)

**Resumo:**
1. Crie conta no [Vertra Cloud](https://vertracloud.app)
2. Configure as variáveis de ambiente (DISCORD_TOKEN, DISCORD_CLIENT_ID)
3. Faça upload do código
4. O bot iniciará automaticamente

## Documentation

See [replit.md](./replit.md) for complete documentation including:
- Project architecture
- Command reference
- Environment variables
- Troubleshooting guide

## Website

The web dashboard has been archived to `website.zip`. See [WEBSITE_README.md](./WEBSITE_README.md) for restore instructions.

## Status

✅ **Commands:** 34  
✅ **Framework:** Discord.js v14 + TypeScript  
✅ **Language:** TypeScript  
✅ **Node.js:** 18.0.0+

## Legal

- [Terms of Service](./TERMS_OF_SERVICE.md)
- [Privacy Policy](./PRIVACY_POLICY.md)
- [Security Policy](./SECURITY.md)

## Discord Linked Roles

Sheriff Rex Bot supports Discord's Linked Roles feature! Server admins can gate roles based on:
- 💰 Total Coins (wealth requirement)
- 🎫 Total Tokens (premium currency)
- ⭐ Level (calculated from wealth)
- 🎯 Bounties Captured
- 🎰 Games Played
- ⛏️ Mining Sessions

**Setup Guide:** [LINKED_ROLES_SETUP.md](./LINKED_ROLES_SETUP.md)

## Features

### 💰 Economy System
- Dual currency: Saloon Tokens + Silver Coins
- Daily rewards and trading
- Secure middleman system
- Visual leaderboards

### 🎰 Gambling & Games
- Bank Robbery, Casino, Dice, Poker
- PvP Duels with betting
- Fair RNG system

### ⛏️ Mining System
- Solo and cooperative mining
- Progressive backpack upgrades (100kg → 500kg)
- Resource management

### 🎯 Bounty Hunting
- Set bounties on users
- Capture system with rewards
- Visual wanted posters

### 👤 Profiles & Customization
- Visual profile cards with Canvas
- Inventory management
- Statistics tracking
- Multilingual support (PT-BR, EN-US, ES-ES, FR)

## Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/gomezfy/Sheriffbot-/issues)
- **Documentation:** See [replit.md](./replit.md) for complete docs

## License

This project is licensed under the MIT License - see the LICENSE file for details.
