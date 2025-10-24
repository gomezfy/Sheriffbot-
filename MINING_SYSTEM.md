# ⛏️ Automatic Mining Notification System

## Overview
The bot now includes an **automatic mining notification system** that runs in the background and sends private messages to users when their mining operations complete.

## How It Works

### 1. Starting Mining
Users can start mining using the `/mine` command:
- **Solo Mining**: Takes 90 minutes (1h30m), rewards 1-3 Gold Bars
- **Cooperative Mining**: Takes 30 minutes, rewards 4-6 Gold Bars (split between partners)

### 2. Automatic Monitoring
Once the bot is running, the automatic notification system:
- **Checks every 2 minutes** for completed mining sessions
- Runs automatically in the background (no manual intervention needed)
- Tracks all active mining sessions across all servers

### 3. Completion Notifications
When a mining operation finishes:
- **Sends a private DM** to the user automatically
- Shows mining type (Solo or Cooperative)
- Displays the gold amount earned
- Reminds user to run `/mine` to collect their reward

### 4. Collecting Rewards
Users collect their gold by:
1. Running `/mine` command again
2. Clicking the "Collect Gold" button
3. Gold Bars are automatically added to their inventory
4. Can exchange Gold Bars for Silver Coins (1 Gold Bar = 13,439 Silver Coins)

## Technical Details

### Files Involved
- `src/utils/miningTracker.ts` - Core notification system
- `src/commands/mining/mine.ts` - Mining command implementation
- `src/index.ts` - Initializes the system on bot startup
- `data/mining.json` - Stores active mining sessions

### System Features
- **Smart Tracking**: Marks users as notified to prevent spam
- **Auto-Cleanup**: Removes old claimed sessions after 24 hours
- **Session Stats**: Track active, completed, and unclaimed mining across the server
- **Error Handling**: Gracefully handles DM failures (blocked users, etc.)

### Configuration
The system is configured to:
- Check interval: **2 minutes**
- Solo mining duration: **90 minutes**
- Cooperative mining duration: **30 minutes**
- Gold value: **13,439 Silver Coins per Gold Bar**

## Current Status
✅ **System is ACTIVE and RUNNING**
- Automatically started when bot logged in
- Monitoring all mining sessions
- Sending notifications every 2 minutes for completed mining
- **Bug fix applied**: Properly handles failed DMs without spam retries

## User Experience

### Example Notification DM
When mining completes, users receive:

```
✅ MINERAÇÃO COMPLETA!

Sua operação de mineração foi concluída!

💰 Recompensa: 2 🥇 Gold Bars!

⛏️ Tipo de Mineração: ⛏️ Solo Mining
💎 Ouro Disponível: 2 🥇

Use /mine para coletar seu ouro!
```

## Testing the System

To test the automatic notification system:
1. Start a mining operation with `/mine`
2. Choose Solo (90 min) or Cooperative (30 min)
3. Wait for the timer to complete
4. **Within 2 minutes** of completion, you'll receive a DM notification
5. Run `/mine` again to collect your gold

## Logs
The system logs its activity:
- `⛏️ Starting automatic mining notification system` - System started
- `⛏️ Notified X users about completed mining` - Notifications sent
- `⛏️ Sent mining completion DM to [username]` - Individual notification sent
