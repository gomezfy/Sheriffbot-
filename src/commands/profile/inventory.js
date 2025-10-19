const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getInventory, calculateWeight, MAX_WEIGHT, ITEMS } = require('../../utils/inventoryManager');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your inventory')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Check another user\'s inventory (optional)')
        .setRequired(false)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    // Only allow viewing own inventory for privacy
    if (targetUser.id !== interaction.user.id) {
      return interaction.reply({
        content: t(interaction, 'inventory_private'),
        ephemeral: true
      });
    }
    
    await interaction.deferReply();
    
    const inventory = getInventory(targetUser.id);
    const currentWeight = calculateWeight(inventory);
    
    // Criar lista de itens (excluindo moedas, pois já aparecem separadamente)
    let itemsList = '';
    let totalItems = 0;
    const currencies = ['saloon_token', 'silver'];
    const otherItems = [];
    
    for (const [itemId, quantity] of Object.entries(inventory.items)) {
      if (!currencies.includes(itemId)) {
        otherItems.push([itemId, quantity]);
        totalItems += quantity;
      } else {
        totalItems += quantity; // Contar moedas no total
      }
    }
    
    if (otherItems.length === 0) {
      itemsList = '```\n' + t(interaction, 'inventory_no_items') + '\n```';
    } else {
      itemsList = '```diff\n';
      for (const [itemId, quantity] of otherItems) {
        const item = ITEMS[itemId];
        if (item) {
          const itemWeight = item.weight * quantity;
          // Only show weight if it's significant (>= 0.1kg)
          const weightDisplay = itemWeight >= 0.1 ? ` (${itemWeight.toFixed(1)}kg)` : '';
          itemsList += `+ ${item.emoji} ${item.name} x${quantity.toLocaleString()}${weightDisplay}\n`;
        }
      }
      itemsList += '```';
    }
    
    // Get user's max weight (can be upgraded to 500kg)
    const userMaxWeight = inventory.maxWeight; // getInventory() always returns maxWeight
    
    // Weight progress bar
    const weightPercentage = (currentWeight / userMaxWeight) * 100;
    const filledBars = Math.floor(weightPercentage / 10);
    const emptyBars = 10 - filledBars;
    
    let weightBar = '🟩'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    
    if (weightPercentage >= 90) {
      weightBar = '🟥'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    } else if (weightPercentage >= 70) {
      weightBar = '🟨'.repeat(filledBars) + '⬜'.repeat(emptyBars);
    }
    
    // Create currency summary
    const saloonTokens = inventory.items['saloon_token'] || 0;
    const silverCoins = inventory.items['silver'] || 0;
    const currencyDisplay = `\`\`\`yaml\n🎫 Saloon Tokens: ${saloonTokens.toLocaleString()}\n🪙 Silver Coins: ${silverCoins.toLocaleString()}\n\`\`\``;
    
    const embed = new EmbedBuilder()
      .setColor(weightPercentage >= 90 ? '#8B4513' : weightPercentage >= 70 ? '#D2691E' : '#DEB887')
      .setTitle(t(interaction, 'inventory_title', { username: targetUser.username }))
      .setDescription(t(interaction, 'inventory_desc'))
      .addFields(
        { name: t(interaction, 'inventory_currency'), value: currencyDisplay, inline: false },
        { name: t(interaction, 'inventory_items'), value: itemsList, inline: false },
        { 
          name: t(interaction, 'inventory_weight'), 
          value: `\`\`\`yaml\n${currentWeight.toFixed(2)}kg / ${userMaxWeight}kg\n\`\`\`\n${weightBar}`, 
          inline: false 
        },
        { name: t(interaction, 'inventory_items_count'), value: `\`${totalItems.toLocaleString()}\` items`, inline: true },
        { name: t(interaction, 'inventory_different_items'), value: `\`${Object.keys(inventory.items).length}/50\``, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
      .setFooter({ 
        text: weightPercentage >= 90 
          ? t(interaction, 'inventory_nearly_full')
          : targetUser.id === interaction.user.id 
            ? t(interaction, 'inventory_use_give')
            : `${targetUser.username}'s saddlebag` 
      })
      .setTimestamp();
    
    if (weightPercentage >= 100) {
      embed.addFields({
        name: t(interaction, 'inventory_full_warning'),
        value: '```diff\n' + t(interaction, 'inventory_full_msg') + '\n```',
        inline: false
      });
    }
    
    await interaction.editReply({ embeds: [embed] });
  },
};
