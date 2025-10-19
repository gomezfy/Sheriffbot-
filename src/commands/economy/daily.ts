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
    
    const userData = dailyData[userId];
    const now = Date.now();
    const timeSinceLastClaim = now - userData.lastClaim;
    
    if (timeSinceLastClaim < dailyCooldown) {
      const timeLeft = dailyCooldown - timeSinceLastClaim;
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      
      const currentBonus = Math.min(userData.streak * 0.1, 1.0);
      const nextBonus = Math.min((userData.streak + 1) * 0.1, 1.0);
      
      const cooldownEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('⏰ DAILY REWARD - ON COOLDOWN')
        .setDescription('**You already claimed your daily reward today!**\n\nCome back later to continue your streak and earn more rewards.')
        .addFields(
          { name: '⏱️ Time Remaining', value: `\`\`\`${hoursLeft}h ${minutesLeft}m\`\`\``, inline: true },
          { name: '🔥 Current Streak', value: `\`\`\`${userData.streak} day${userData.streak !== 1 ? 's' : ''}\`\`\``, inline: true },
          { name: '📈 Current Bonus', value: `\`\`\`+${Math.floor(currentBonus * 100)}%\`\`\``, inline: true },
          { name: '💡 Next Reward', value: `Claim tomorrow to reach **${userData.streak + 1} days** and unlock **+${Math.floor(nextBonus * 100)}%** bonus!`, inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: '🤠 Keep your streak going, partner!' })
        .setTimestamp();
      
      await interaction.reply({
        embeds: [cooldownEmbed],
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

    const streakColor = newStreak >= 7 ? 0xFF1493 : newStreak >= 3 ? 0xFF6B35 : 0xFFD700;
    const nextStreak = newStreak + 1;
    const nextBonus = Math.min(nextStreak * 0.1, 1.0);
    
    let description = '';
    if (wasStreakBroken && userData.streak > 1) {
      description = '```diff\n- Your streak was broken! Starting fresh from day 1.\n```';
    } else if (newStreak === 1) {
      description = '```yaml\n🌟 Welcome! Start claiming daily to build your streak!\n```';
    } else if (newStreak >= 7) {
      description = '```diff\n+ 🎉 Amazing! You have a 7+ day streak!\n```';
    } else {
      description = '```diff\n+ Daily reward claimed successfully!\n```';
    }

    const rewardEmbed = new EmbedBuilder()
      .setColor(streakColor)
      .setTitle('🌅 DAILY REWARD CLAIMED!')
      .setDescription(description)
      .addFields(
        { name: '💰 Rewards Received', value: '\u200B', inline: false },
        { name: '🪙 Silver Coins', value: `\`+${silverAmount.toLocaleString()}\``, inline: true },
        { name: '🎫 Saloon Tokens', value: `\`+${tokenAmount}\``, inline: true },
        { name: '⭐ Experience', value: `\`+${xpAmount} XP\``, inline: true },
        { name: '🔥 Streak Status', value: '\u200B', inline: false },
        { name: 'Current Streak', value: `\`\`\`${newStreak} day${newStreak !== 1 ? 's' : ''}\`\`\``, inline: true },
        { name: 'Current Bonus', value: `\`\`\`+${Math.floor(streakBonus * 100)}%\`\`\``, inline: true },
        { name: 'Max Bonus', value: `\`\`\`+100% (10 days)\`\`\``, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: newStreak < 10 ? `🎯 Next bonus: +${Math.floor(nextBonus * 100)}% at ${nextStreak} days | Come back in 24 hours!` : '🏆 Max bonus reached! Come back in 24 hours!' })
      .setTimestamp();

    if (newStreak >= 7) {
      rewardEmbed.setImage('https://media.giphy.com/media/g9582DNuQppxC/giphy.gif');
    }

    await interaction.editReply({ embeds: [rewardEmbed] });
  },
};
