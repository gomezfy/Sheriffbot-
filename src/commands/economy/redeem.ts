import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
import { getDataPath, writeData, readData } from '../../utils/database';
const { addItem, upgradeBackpack, getBackpackLevel } = require('../../utils/inventoryManager');
const { showProgressBar } = require('../../utils/progressBar');

const redemptionCodesPath = path.join(getDataPath('data'), 'redemption-codes.json');

interface RedemptionCode {
  productId: string;
  productName: string;
  tokens: number;
  coins: number;
  vip: boolean;
  background: boolean;
  backpack?: number | boolean;
  createdAt: number;
  createdBy: string;
  redeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: number;
}

function loadRedemptionCodes(): Record<string, RedemptionCode> {
  try {
    return readData('redemption-codes.json');
  } catch (error) {
    console.error('Error loading redemption codes:', error);
    return {};
  }
}

function saveRedemptionCodes(data: Record<string, RedemptionCode>): void {
  writeData('redemption-codes.json', data);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('🎁 Redeem a purchase code from the website shop')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addStringOption(option =>
      option
        .setName('code')
        .setDescription('Your redemption code (e.g. SHERIFF-GOLD-ABC123)')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true).toUpperCase().trim();
    const userId = interaction.user.id;

    await interaction.deferReply();
    
    try {
      const redemptionCodes = loadRedemptionCodes();
      
      // Check if code exists
      if (!redemptionCodes[code]) {
        const embed = errorEmbed(
          'Invalid Code',
          `The code \`${code}\` does not exist.\n\nMake sure you copied it correctly from the shop!`,
          'Buy products at the website shop'
        );
        
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const redemption = redemptionCodes[code];

      // Check if already redeemed
      if (redemption.redeemed) {
        const redeemedDate = redemption.redeemedAt ? new Date(redemption.redeemedAt).toLocaleString() : 'Unknown';
        
        const embed = warningEmbed(
          'Already Redeemed',
          `This code has already been used!\n\n**Product:** ${redemption.productName}\n**Redeemed on:** ${redeemedDate}`,
          'Each code can only be used once'
        );
        
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Show progress bar
      await showProgressBar(interaction, '🎁 REDEEMING CODE', 'Processing your purchase...', 2000, '#FFD700');

      // Apply rewards
      const rewards = [];
      let backpackUpgraded = false;
      let newCapacity = 0;

      // Add tokens
      if (redemption.tokens > 0) {
        const tokenResult = addItem(userId, 'saloon_token', redemption.tokens);
        if (tokenResult.success) {
          rewards.push(`+${formatCurrency(redemption.tokens, 'tokens')}`);
        }
      }

      // Add coins
      if (redemption.coins > 0) {
        const coinResult = addItem(userId, 'silver', redemption.coins);
        if (coinResult.success) {
          rewards.push(`+${formatCurrency(redemption.coins, 'silver')}`);
        }
      }

      // Apply backpack upgrade
      if (redemption.backpack) {
        const targetCapacity = typeof redemption.backpack === 'number' ? redemption.backpack : 500;
        const currentLevel = getBackpackLevel(userId);
        
        // Check if user already has this capacity or higher
        const { getInventory } = require('../../utils/inventoryManager');
        const inventory = getInventory(userId);
        
        if (inventory.maxWeight >= targetCapacity) {
          const embed = warningEmbed(
            'Upgrade Not Needed',
            `You already have a backpack with **${inventory.maxWeight}kg** capacity!\n\nThis upgrade is for **${targetCapacity}kg**, which you already have or exceeded.\n\n**Note:** Your redemption code was **not consumed** and can be given to another player.`,
            'Consider buying a higher tier upgrade'
          );
          
          await interaction.editReply({ embeds: [embed] });
          return;
        }
        
        // Apply upgrade
        const upgradeResult = upgradeBackpack(userId, targetCapacity);
        if (upgradeResult.success) {
          backpackUpgraded = true;
          newCapacity = targetCapacity;
          rewards.push(`📦 Inventory upgraded to **${targetCapacity}kg**`);
        }
      }

      // Mark as redeemed
      redemption.redeemed = true;
      redemption.redeemedBy = userId;
      redemption.redeemedAt = Date.now();
      redemptionCodes[code] = redemption;
      saveRedemptionCodes(redemptionCodes);

      // Create success embed
      const embed = successEmbed(
        'Code Redeemed Successfully!',
        `Thank you for your purchase! 🎉\n\n**Product:** ${redemption.productName}\n**Code:** \`${code}\``,
        'Enjoy your rewards, partner!'
      ).addFields(
        { name: '🎁 Rewards Received', value: rewards.length > 0 ? rewards.join('\n') : 'Special perks activated!', inline: false }
      );

      if (redemption.vip) {
        embed.addFields({ name: '🌟 VIP Status', value: 'Activated! You now have access to exclusive features.', inline: false });
      }

      if (redemption.background) {
        embed.addFields({ name: '🎨 Exclusive Background', value: 'Unlocked! Use it in your profile.', inline: false });
      }

      if (backpackUpgraded) {
        embed.addFields({ name: '🎒 Backpack Upgraded', value: `Your inventory capacity is now **${newCapacity}kg**!`, inline: false });
      }

      await interaction.editReply({ embeds: [embed] });

      console.log(`✅ Code redeemed: ${code} by ${interaction.user.tag} (${userId})`);

    } catch (error) {
      console.error('Error redeeming code:', error);
      
      const embed = errorEmbed(
        'Redemption Error',
        `An error occurred while processing your code.\n\nPlease try again or contact support if the issue persists.`,
        'Error details have been logged'
      );
      
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
