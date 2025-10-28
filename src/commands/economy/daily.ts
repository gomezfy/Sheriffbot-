import { SlashCommandBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { addXp } from '../../utils/xpManager';
import { economyEmbed, errorEmbed, warningEmbed, formatCurrency, formatDuration, field } from '../../utils/embeds';
import { getSilverCoinEmoji, getSaloonTokenEmoji } from '../../utils/customEmojis';
import { t } from '../../utils/i18n';
const { addItem } = require('../../utils/inventoryManager');
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
    .setDescription('Claim your daily reward and build a streak!')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]), // Guild Install, User Install
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
      const pluralSuffix = userData.streak !== 1 ? 's' : '';
      
      const embed = warningEmbed(
        t(interaction, 'daily_title'),
        t(interaction, 'daily_already_claimed', { time: formatDuration(timeLeft), streak: userData.streak, plural: pluralSuffix }),
        t(interaction, 'daily_come_back')
      );
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    // Defer reply immediately for better performance
    await interaction.deferReply();

    const wasStreakBroken = timeSinceLastClaim > (dailyCooldown * 2);
    const previousStreak = userData.streak; // Capture previous streak before mutation
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
        t(interaction, 'daily_failed_title'),
        t(interaction, 'daily_inventory_too_full', { error }),
        t(interaction, 'daily_free_space')
      );
      
      await interaction.editReply({
        embeds: [embed]
      });
      return;
    }

    addXp(userId, xpAmount);
    
    userData.lastClaim = now;
    userData.streak = newStreak;
    dailyData[userId] = userData;
    saveDailyData(dailyData);

    const streakText = newStreak !== 1 ? t(interaction, 'daily_days') : t(interaction, 'daily_day');
    
    const embed = economyEmbed(
      t(interaction, 'daily_title'),
      wasStreakBroken && previousStreak > 1 
        ? t(interaction, 'daily_streak_broken')
        : t(interaction, 'daily_claimed_success'),
      t(interaction, 'daily_comeback_24h')
    ).addFields(
      field(`${getSilverCoinEmoji()} ${t(interaction, 'daily_field_silver')}`, `+${formatCurrency(silverAmount, 'silver')}`, true),
      field(`${getSaloonTokenEmoji()} ${t(interaction, 'daily_field_tokens')}`, `+${formatCurrency(tokenAmount, 'tokens')}`, true),
      field(t(interaction, 'daily_field_xp'), `+${xpAmount}`, true),
      field(t(interaction, 'daily_field_streak'), `${newStreak} ${streakText} 🔥`, true),
      field(t(interaction, 'daily_field_bonus'), `+${Math.floor(streakBonus * 100)}%`, true),
      field('\u200B', '\u200B', true)
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
