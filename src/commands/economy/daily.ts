import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { addXP } from '../../utils/xpManager';
import { economyEmbed, errorEmbed, warningEmbed, formatCurrency, formatDuration, field } from '../../utils/embeds';
const { addItem } = require('../../utils/inventoryManager');
const { showProgressBar } = require('../../utils/progressBar');
const { readData, writeData } = require('../../utils/database');

const dailyCooldown = 24 * 60 * 60 * 1000;

interface DailyData {
  [userId: string]: {
    lastClaim: number;
    streak: number;
  };
}

function getDailyData(): DailyData {
  return readData('daily.json');
}

function saveDailyData(data: DailyData): void {
  writeData('daily.json', data);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('🌅 Claim your daily reward and build a streak!'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const dailyData = getDailyData();
    
    if (!dailyData[userId]) {
      dailyData[userId] = {
        lastClaim: 0,
        streak: 0
      };
    }
    
    let userData = dailyData[userId];
    
    // Fix corrupted data (if userData is just a number instead of an object)
    if (typeof userData === 'number') {
      userData = {
        lastClaim: userData,
        streak: 1
      };
      dailyData[userId] = userData;
      saveDailyData(dailyData);
    }
    
    const now = Date.now();
    const timeSinceLastClaim = now - userData.lastClaim;
    
    if (timeSinceLastClaim < dailyCooldown) {
      const timeLeft = dailyCooldown - timeSinceLastClaim;
      
      const embed = warningEmbed(
        'Daily Reward',
        `You already claimed your daily reward!\n\n**Time remaining:** ${formatDuration(timeLeft)}\n**Current streak:** ${userData.streak} day${userData.streak !== 1 ? 's' : ''}`,
        'Come back tomorrow!'
      );
      
      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();
    await showProgressBar(interaction, '🌅 DAILY REWARD', 'Collecting your daily reward...', 2000, '#FFD700');

    const wasStreakBroken = timeSinceLastClaim > (dailyCooldown * 2);
    const newStreak = wasStreakBroken ? 1 : userData.streak + 1;
    
    const baseSilver = 500;
    const baseTokens = 5;
    const baseXP = 100;
    
    const streakBonus = Math.min(newStreak * 0.1, 1.0);
    
    const silverAmount = Math.floor(baseSilver * (1 + streakBonus));
    const tokenAmount = Math.floor(baseTokens * (1 + streakBonus));
    const xpAmount = Math.floor(baseXP * (1 + streakBonus));

    const silverResult = addItem(userId, 'silver', silverAmount);
    const tokenResult = addItem(userId, 'saloon_token', tokenAmount);

    if (!silverResult.success || !tokenResult.success) {
      const error = !silverResult.success ? silverResult.error : tokenResult.error;
      
      const embed = errorEmbed(
        'Daily Reward Failed',
        `${error}\n\nYour inventory is too full to claim this reward!`,
        'Free up space and try again!'
      );
      
      await interaction.editReply({
        embeds: [embed]
      });
      return;
    }

    addXP(userId, xpAmount);
    
    userData.lastClaim = now;
    userData.streak = newStreak;
    dailyData[userId] = userData;
    saveDailyData(dailyData);

    const embed = economyEmbed(
      'Daily Reward',
      wasStreakBroken && userData.streak > 1 
        ? '⚠️ Your streak was broken! Starting fresh.'
        : '✅ Daily reward claimed successfully!',
      'Come back in 24 hours!'
    ).addFields(
      field('Silver Coins', `+${formatCurrency(silverAmount, 'silver')}`, true),
      field('Saloon Tokens', `+${formatCurrency(tokenAmount, 'tokens')}`, true),
      field('XP Earned', `+${xpAmount}`, true),
      field('Streak', `${newStreak} day${newStreak !== 1 ? 's' : ''} 🔥`, true),
      field('Bonus', `+${Math.floor(streakBonus * 100)}%`, true),
      field('\u200B', '\u200B', true)
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
