import { Client, EmbedBuilder } from 'discord.js';
import { getUserTerritories, getTerritory } from './territoryManager';
import { readData, writeData } from './database';
import { t } from './i18n';
import { getSilverCoinEmoji, getGoldBarEmoji } from './customEmojis';

const { addItem } = require('./inventoryManager');

interface TerritoryIncomeData {
  [userId: string]: {
    lastPayout: number;
    lastGoldPayout?: number; // For weekly Gold Bar rewards from Gold Mine Shares
  };
}

const PAYOUT_COOLDOWN = 23 * 60 * 60 * 1000; // 23 hours
const GOLD_PAYOUT_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days (1 week)

/**
 * Get territory income data
 */
function getIncomeData(): TerritoryIncomeData {
  return readData('territory-income.json');
}

/**
 * Save territory income data
 */
function saveIncomeData(data: TerritoryIncomeData): void {
  writeData('territory-income.json', data);
}

/**
 * Check if user can claim territory income
 */
export function canClaimTerritoryIncome(userId: string): boolean {
  const data = getIncomeData();
  
  if (!data[userId]) {
    return true;
  }
  
  const timeSinceLastPayout = Date.now() - data[userId].lastPayout;
  return timeSinceLastPayout >= PAYOUT_COOLDOWN;
}

/**
 * Get time until next payout
 */
export function getTimeUntilNextPayout(userId: string): number {
  const data = getIncomeData();
  
  if (!data[userId]) {
    return 0;
  }
  
  const timeSinceLastPayout = Date.now() - data[userId].lastPayout;
  const timeRemaining = PAYOUT_COOLDOWN - timeSinceLastPayout;
  
  return Math.max(0, timeRemaining);
}

/**
 * Process territory income for a user and send DM
 */
export async function processTerritoryIncome(client: Client, userId: string): Promise<boolean> {
  try {
    // Check if user has territories
    const userTerritories = getUserTerritories(userId);
    
    if (userTerritories.length === 0) {
      return false; // No territories, nothing to pay
    }
    
    // Check cooldown
    if (!canClaimTerritoryIncome(userId)) {
      return false; // Still on cooldown
    }
    
    // Calculate income
    let totalSilver = 0;
    let totalGold = 0;
    const incomeDetails: string[] = [];
    
    // Check if it's time for weekly Gold Bar payout (Gold Mine Shares)
    const data = getIncomeData();
    const hasGoldMine = userTerritories.includes('gold_mine_shares');
    let shouldPayGold = false;
    
    if (hasGoldMine) {
      const lastGoldPayout = data[userId]?.lastGoldPayout || 0;
      const timeSinceGoldPayout = Date.now() - lastGoldPayout;
      shouldPayGold = timeSinceGoldPayout >= GOLD_PAYOUT_COOLDOWN;
    }
    
    for (const territoryId of userTerritories) {
      const territory = getTerritory(territoryId);
      if (!territory) continue;
      
      // Get user for locale
      const user = await client.users.fetch(userId);

      if (territoryId === 'saloon_business') {
        totalSilver += 5000;
        incomeDetails.push(`🍺 **${t(user, 'territory_saloon')}:** +5,000 ${t(user, 'silver_coins')}`);
      } else if (territoryId === 'gold_mine_shares') {
        totalSilver += 12000;
        incomeDetails.push(`⛏️ **${t(user, 'territory_mine')}:** +12,000 ${t(user, 'silver_coins')}`);
        
        // Add weekly Gold Bars if it's time
        if (shouldPayGold) {
          totalGold += 2;
          incomeDetails.push(`🥇 **${t(user, 'territory_dm_weekly_bonus')}:** +2 ${t(user, 'gold_bars')}`);
        }
      } else if (territoryId === 'ranch') {
        totalSilver += 15000;
        incomeDetails.push(`🐴 **${t(user, 'territory_ranch')}:** +15,000 ${t(user, 'silver_coins')}`);
      }
    }
    
    // Add income to inventory
    if (totalSilver > 0) {
      addItem(userId, 'silver', totalSilver);
    }
    if (totalGold > 0) {
      addItem(userId, 'gold_bar', totalGold);
    }
    
    // Update payout timestamps
    if (!data[userId]) {
      data[userId] = { lastPayout: 0 };
    }
    
    data[userId].lastPayout = Date.now();
    
    // Update Gold Bar payout timestamp if we paid Gold
    if (shouldPayGold) {
      data[userId].lastGoldPayout = Date.now();
    }
    
    saveIncomeData(data);
    
    // Send DM to user
    try {
      const user = await client.users.fetch(userId);
      
      const silverEmoji = getSilverCoinEmoji();
      const goldEmoji = getGoldBarEmoji();
      
      const embed = new EmbedBuilder()
        .setColor(0xFFD700) // Gold color
        .setTitle(t(user, 'territory_dm_title'))
        .setDescription(t(user, 'territory_dm_description'))
        .addFields(
          {
            name: t(user, 'territory_dm_breakdown'),
            value: incomeDetails.join('\n'),
            inline: false
          },
          {
            name: t(user, 'territory_dm_total'),
            value: `${totalSilver.toLocaleString()} ${silverEmoji} ${t(user, 'silver_coins')}${totalGold > 0 ? `\n${totalGold} ${goldEmoji} ${t(user, 'gold_bars')}` : ''}`,
            inline: false
          }
        )
        .setFooter({ text: t(user, 'territory_dm_footer') })
        .setTimestamp();
      
      await user.send({ embeds: [embed] });
      
      console.log(`💰 Territory income sent to ${user.tag}: ${totalSilver} silver`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send DM to user ${userId}:`, error);
      // Even if DM fails, we still gave them the money
      return true;
    }
  } catch (error) {
    console.error('❌ Error processing territory income:', error);
    return false;
  }
}

/**
 * Process territory income for all users
 */
export async function processAllTerritoryIncome(client: Client): Promise<void> {
  try {
    const territories = readData('territories.json');
    const userIds = Object.keys(territories);
    
    let processed = 0;
    let skipped = 0;
    
    for (const userId of userIds) {
      const success = await processTerritoryIncome(client, userId);
      if (success) {
        processed++;
      } else {
        skipped++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`💰 Territory income processed: ${processed} users paid, ${skipped} skipped`);
  } catch (error) {
    console.error('❌ Error processing all territory income:', error);
  }
}

/**
 * Start automatic territory income processing
 * Checks every hour and automatically pays users who are eligible
 */
export function startAutomaticTerritoryIncome(client: Client): NodeJS.Timeout {
  console.log('🏛️ Starting automatic territory income system (23-hour cycle)');
  
  // Run immediately on startup
  processAllTerritoryIncome(client).catch(error => {
    console.error('❌ Error in initial territory income processing:', error);
  });
  
  // Then run every hour to check for eligible users
  const interval = setInterval(async () => {
    try {
      await processAllTerritoryIncome(client);
    } catch (error) {
      console.error('❌ Error in automatic territory income processing:', error);
    }
  }, 60 * 60 * 1000); // Check every hour
  
  return interval;
}
