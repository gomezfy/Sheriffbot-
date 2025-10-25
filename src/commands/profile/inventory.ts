import { SlashCommandBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { infoEmbed, warningEmbed, formatCurrency, progressBar } from '../../utils/embeds';
import { getBackpackEmoji, getMoneybagEmoji, getStatsEmoji, getCrateEmoji, getBalanceEmoji, getWarningEmoji, getAlarmEmoji, getSparklesEmoji } from '../../utils/customEmojis';
const { getInventory, calculateWeight, ITEMS, getNextUpgrade } = require('../../utils/inventoryManager');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription(`${getBackpackEmoji()} View your backpack inventory`)
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Check another user\'s inventory (optional)')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    // Only allow viewing own inventory for privacy
    if (targetUser.id !== interaction.user.id) {
      const embed = warningEmbed(
        'Private Inventory',
        'For privacy reasons, you can only view your own inventory.',
        'Use /inventory without parameters to see yours'
      );
      
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }
    
    await interaction.deferReply();
    
    const inventory = getInventory(targetUser.id);
    const currentWeight = calculateWeight(inventory);
    const maxWeight = inventory.maxWeight;
    
    // Currency totals
    const saloonTokens = inventory.items['saloon_token'] || 0;
    const silverCoins = inventory.items['silver'] || 0;
    
    // Count items (excluding currencies)
    const currencies = ['saloon_token', 'silver'];
    const otherItems: [string, number][] = [];
    let totalItems = 0;
    
    for (const [itemId, quantity] of Object.entries(inventory.items)) {
      const quantityNum = Number(quantity);
      totalItems += quantityNum;
      
      if (!currencies.includes(itemId)) {
        otherItems.push([itemId, quantityNum]);
      }
    }
    
    // Build items list
    let itemsList = '';
    if (otherItems.length === 0) {
      itemsList = '*Your backpack is empty. Start working or mining to collect items!*';
    } else {
      for (const [itemId, quantity] of otherItems) {
        const item = (ITEMS as any)[itemId as string];
        if (item) {
          const itemWeight = item.weight * quantity;
          const weightDisplay = itemWeight >= 0.1 ? ` • ${itemWeight.toFixed(1)}kg` : '';
          itemsList += `${item.emoji} **${item.name}** ×${quantity.toLocaleString()}${weightDisplay}\n`;
        }
      }
    }
    
    // Weight status
    const weightPercentage = (currentWeight / maxWeight) * 100;
    const weightColor = weightPercentage >= 90 ? 'red' : weightPercentage >= 70 ? 'amber' : 'green';
    const weightBar = progressBar(currentWeight, maxWeight, 20);
    
    // Check for upgrade
    const nextUpgrade = getNextUpgrade(targetUser.id);
    let upgradeInfo = '';
    
    if (nextUpgrade) {
      upgradeInfo = `\n💡 **Next Upgrade:** ${nextUpgrade.capacity}kg for **$${nextUpgrade.price}** at the shop`;
    } else {
      upgradeInfo = `\n${getSparklesEmoji()} **Maximum capacity reached!**`;
    }
    
    // Create embed
    const embed = infoEmbed(
      `${getBackpackEmoji()} ${targetUser.username}'s Backpack`,
      `Manage your items, currency, and inventory space.`
    )
      .addFields(
        {
          name: `${getMoneybagEmoji()} Currency`,
          value: `${formatCurrency(saloonTokens, 'tokens')}\n${formatCurrency(silverCoins, 'silver')}`,
          inline: true
        },
        {
          name: `${getStatsEmoji()} Inventory Stats`,
          value: `**Items:** ${totalItems.toLocaleString()}\n**Types:** ${Object.keys(inventory.items).length}/50\n**Weight:** ${currentWeight.toFixed(1)}kg / ${maxWeight}kg`,
          inline: true
        },
        {
          name: `${getCrateEmoji()} Items in Backpack`,
          value: itemsList,
          inline: false
        },
        {
          name: `${getBalanceEmoji()} Weight Capacity`,
          value: `${weightBar}\n${currentWeight.toFixed(1)}kg / ${maxWeight}kg (${weightPercentage.toFixed(0)}%)${upgradeInfo}`,
          inline: false
        }
      )
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }));
    
    // Warning if nearly full
    if (weightPercentage >= 90) {
      embed.setFooter({ text: `${getWarningEmoji()} Your backpack is nearly full! Use /give to transfer items or upgrade your capacity.` });
    } else if (weightPercentage >= 100) {
      embed.setFooter({ text: `${getAlarmEmoji()} BACKPACK FULL! You cannot collect more items until you free up space.` });
    } else {
      embed.setFooter({ text: 'Use /give to transfer items to other players' });
    }
    
    await interaction.editReply({ embeds: [embed] });
  },
};
