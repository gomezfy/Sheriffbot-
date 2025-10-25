# 🏛️ Territory System - Automatic Income Distribution

## Overview
The territory system allows users to purchase valuable properties in the Wild West that generate passive income automatically.

## Available Territories

### 🍺 Saloon Business (360,000 Silver Coins)
**Daily Benefits:**
- 💰 5,000 Silver Coins automatically every 23 hours
- 🎰 Unlock exclusive gambling events
- 👥 Host private poker tournaments
- 🍻 50% discount on casino games

### ⛏️ Gold Mine Shares (699,000 Silver Coins)
**Daily Benefits:**
- 💎 12,000 Silver Coins automatically every 23 hours

**Weekly Benefits:**
- 🥇 2 Gold Bars automatically every 7 days
- ⚡ 25% faster mining operations
- 📊 Priority access to new mining spots

### 🐴 Ranch (810,000 Silver Coins)
**Daily Benefits:**
- 🌾 15,000 Silver Coins automatically every 23 hours
- 🐄 Breed and sell premium livestock
- 🏇 Unlock horse racing events
- 🛡️ Immunity from bounty hunters

## How the Automatic System Works

### 1. Purchase Territory
Use `/territories` command to:
- Browse available territories
- View prices and benefits
- Purchase territories with Silver Coins

### 2. Automatic Income Distribution
The bot automatically:
- **Checks every hour** for eligible users
- **Daily rewards**: Distributed every 23 hours
- **Weekly rewards**: Gold Bars from Gold Mine Shares every 7 days
- **Sends DM notification** when income is credited

### 3. Receive Income
Users receive a DM with:
- Breakdown of income from each territory
- Total Silver Coins received
- Gold Bars received (if applicable)
- Timestamp of next payout

## Example DM Notification

### Daily Income (without Gold Bars)
```
🏛️ Territory Income Received!
Your territories have generated profits!

💰 Daily Income Breakdown
🍺 Saloon Business: +5,000 Silver Coins
⛏️ Gold Mine Shares: +12,000 Silver Coins

📊 Total Received
17,000 🪙 Silver Coins

🤠 Keep investing in your empire!
```

### Weekly Income (with Gold Bars)
```
🏛️ Territory Income Received!
Your territories have generated profits!

💰 Daily Income Breakdown
⛏️ Gold Mine Shares: +12,000 Silver Coins
🥇 Weekly Bonus: +2 Gold Bars

📊 Total Received
12,000 🪙 Silver Coins
2 🥇 Gold Bars

🤠 Keep investing in your empire!
```

## Technical Details

### Files Involved
- `src/utils/territoryManager.ts` - Territory definitions and ownership
- `src/utils/territoryIncome.ts` - Automatic income processing
- `src/commands/economy/territories.ts` - Territory browsing and purchase
- `data/territories.json` - User territory ownership
- `data/territory-income.json` - Income payout timestamps

### System Configuration
- **Daily income cooldown**: 23 hours
- **Weekly Gold Bar cooldown**: 7 days (168 hours)
- **Check interval**: Every hour
- **Rate limiting**: 1 second delay between users

### Income Calculation
The system:
1. Checks user's owned territories
2. Verifies daily cooldown (23 hours passed)
3. Verifies weekly cooldown for Gold Bars (7 days passed)
4. Calculates total Silver Coins and Gold Bars
5. Adds items to user inventory
6. Updates payout timestamps
7. Sends DM notification

## Current Status
✅ **System is ACTIVE and RUNNING**
- Automatically distributes income every hour
- Tracks both daily and weekly payouts separately
- Sends private DM notifications
- No manual claiming required

## User Commands
- `/territories` - Browse and purchase territories (ONLY command needed)
- ❌ `/claim-territories` - **REMOVED** (system is fully automatic)

## Investment ROI

### Saloon Business
- **Cost**: 360,000 Silver Coins
- **Daily return**: 5,000 Silver Coins
- **Break-even**: ~72 days

### Gold Mine Shares
- **Cost**: 699,000 Silver Coins
- **Daily return**: 12,000 Silver Coins + 0.286 Gold Bars/day (≈3,840 Silver)
- **Effective daily**: ~15,840 Silver Coins
- **Break-even**: ~44 days

### Ranch
- **Cost**: 810,000 Silver Coins
- **Daily return**: 15,000 Silver Coins
- **Break-even**: ~54 days

## Data Persistence
All data is stored in JSON files:
- Territory ownership tracked in `territories.json`
- Payout timestamps in `territory-income.json` with:
  - `lastPayout`: Last daily income timestamp
  - `lastGoldPayout`: Last weekly Gold Bar timestamp
