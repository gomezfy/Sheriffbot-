# ⛏️ Mining Notification System - Test Plan

## System Status
✅ **ACTIVE AND RUNNING** - System automatically started when bot logged in

## How to Test the Automatic Notification System

### Test 1: Solo Mining Notification
**Steps:**
1. In Discord, run `/mine` command
2. Click "⛏️ Start Solo Mining" button
3. Confirm the mining started (you'll see progress bar)
4. Wait 90 minutes for completion
5. **Within 2 minutes** after completion, check your DMs

**Expected Result:**
- You receive a DM from Sheriff Rex
- DM contains an embed with:
  - ✅ "MINERAÇÃO COMPLETA!" title
  - Gold amount (1-3 Gold Bars)
  - Mining type: "⛏️ Solo Mining"
  - Instruction to use `/mine` to collect

### Test 2: Cooperative Mining Notification
**Steps:**
1. In Discord, run `/mine` command
2. Click "👥 Find Partner" button
3. Another user accepts within 60 seconds
4. Wait 30 minutes for completion
5. **Within 2 minutes** after completion, check DMs for BOTH users

**Expected Result:**
- Both users receive DMs
- DMs show cooperative mining type
- Gold is split between partners (4-6 bars total)

### Test 3: Collecting Gold After Notification
**Steps:**
1. After receiving the completion DM
2. Run `/mine` command again
3. Click "Collect Gold" button

**Expected Result:**
- Gold Bars added to your inventory
- Success message shown
- Mining session marked as claimed
- No more DMs sent for this session

### Test 4: Multiple Users Mining
**Steps:**
1. Have 3+ users start mining at different times
2. Wait for their sessions to complete
3. Monitor the bot logs

**Expected Result:**
- Each user receives their DM within 2 minutes of completion
- Bot logs show: `⛏️ Notified X users about completed mining`
- 1-second delay between each DM (rate limiting)

### Test 5: Blocked DMs Handling
**Steps:**
1. Start a mining operation
2. Block the Sheriff Rex bot from sending you DMs
3. Wait for mining to complete

**Expected Result:**
- Bot logs error: `❌ Failed to send mining DM to user`
- Session still marked as notified (prevents spam attempts)
- Can still collect gold using `/mine` command

## Checking Bot Logs

To monitor the notification system:

1. Check the Discord Bot workflow logs
2. Look for these log messages:
   - `⛏️ Starting automatic mining notification system` - System started
   - `⛏️ Notified X users about completed mining` - Notifications sent
   - `⛏️ Sent mining completion DM to [username]` - Individual DM sent

## Quick Test (Short Duration)

For faster testing, you can temporarily modify the mining duration:
- Edit `src/commands/mining/mine.ts`
- Change line 11-12 to shorter durations:
  - `const SOLO_DURATION = 2 * 60 * 1000; // 2 minutes`
  - `const COOP_DURATION = 1 * 60 * 1000; // 1 minute`
- Rebuild with `npm run build`
- Restart the bot

**Note:** Remember to change durations back to normal after testing!

## Troubleshooting

### No DM Received?
1. Check if you have DMs blocked from the bot
2. Verify bot has permission to send DMs
3. Check bot logs for errors
4. Make sure you're checking within 2 minutes of completion

### DM Received Multiple Times?
1. This shouldn't happen - system marks sessions as notified
2. If it occurs, check `data/mining.json` for the `notified` flag
3. Report this as a bug

### Bot Not Sending DMs?
1. Check if bot is running: Look for "Discord Bot: RUNNING" status
2. Check logs for `⛏️ Starting automatic mining notification system`
3. Verify `data/mining.json` exists and has valid data
4. Restart the bot if needed

## Current Configuration

- **Check Interval:** Every 2 minutes
- **Solo Mining:** 90 minutes (1h 30m)
- **Cooperative Mining:** 30 minutes
- **Gold Value:** 13,439 Silver Coins per Gold Bar
- **Solo Rewards:** 1-3 Gold Bars
- **Coop Rewards:** 4-6 Gold Bars (split between partners)

## System Monitoring

The bot automatically monitors:
- Active mining sessions
- Completed but unclaimed sessions
- Session cleanup (removes claimed sessions after 24 hours)
- Notification status for each session

All data is stored in `data/mining.json` and persists between bot restarts.
