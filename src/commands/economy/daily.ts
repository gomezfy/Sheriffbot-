import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { addXP } from '../../utils/xpManager';
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
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      await interaction.reply({
        embeds: [{
          color: 0xFF6B6B,
          title: '⏰ Daily Reward',
          description: `You already claimed your daily reward!\n\n**Time remaining:** ${hoursLeft}h ${minutesLeft}m\n**Current streak:** ${userData.streak} day${userData.streak !== 1 ? 's' : ''}`,
          footer: { text: 'Come back tomorrow!' }
        }],
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
      await interaction.editReply({
        embeds: [{
          color: 0xFF0000,
          title: '❌ DAILY REWARD FAILED',
          description: `${error}\n\nYour inventory is too full to claim this reward!`,
          footer: { text: 'Free up space and try again!' }
        }]
      });
      return;
    }

    addXP(userId, xpAmount);
    
    userData.lastClaim = now;
    userData.streak = newStreak;
    dailyData[userId] = userData;
    saveDailyData(dailyData);

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🌅 Daily Reward')
      .setDescription(wasStreakBroken && userData.streak > 1 
        ? '⚠️ Your streak was broken! Starting fresh.'
        : '✅ Daily reward claimed successfully!')
      .addFields(
        { name: '🪙 Silver Coins', value: `+${silverAmount.toLocaleString()}`, inline: true },
        { name: '🎫 Saloon Tokens', value: `+${tokenAmount}`, inline: true },
        { name: '⭐ XP', value: `+${xpAmount}`, inline: true },
        { name: '🔥 Streak', value: `${newStreak} day${newStreak !== 1 ? 's' : ''}`, inline: true },
        { name: '📈 Bonus', value: `+${Math.floor(streakBonus * 100)}%`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true }
      )
      .setFooter({ text: 'Come back in 24 hours!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
