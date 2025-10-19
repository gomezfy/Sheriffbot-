const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addItem, getItem } = require('../../utils/inventoryManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addsilver')
    .setDescription('[OWNER ONLY] Add Silver Coins to a user\'s inventory')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give silver to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of Silver Coins to add')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    // Check if user is owner
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ 
        content: '❌ This command is only available to the bot owner!', 
        ephemeral: true 
      });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const result = addItem(targetUser.id, 'silver', amount);

    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Failed to Add Silver')
        .setDescription(result.error)
        .setTimestamp();
      
      if (result.currentWeight && result.maxWeight) {
        embed.addFields(
          { name: 'Current Weight', value: `${result.currentWeight.toFixed(2)}kg`, inline: true },
          { name: 'Maximum Weight', value: `${result.maxWeight}kg`, inline: true },
          { name: 'Additional Weight', value: `${result.additionalWeight.toFixed(3)}kg`, inline: true }
        );
      }
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Get user's max weight
    const { getInventory } = require('../../utils/inventoryManager');
    const inventory = getInventory(targetUser.id);
    const userMaxWeight = inventory.maxWeight; // Remove fallback - getInventory always returns maxWeight
    
    const embed = new EmbedBuilder()
      .setColor('#C0C0C0')
      .setTitle('👑 Owner Command - Add Silver Coins')
      .setDescription(`Successfully added Silver Coins to **${targetUser.tag}**`)
      .addFields(
        { name: '➕ Amount Added', value: `🪙 ${amount.toLocaleString()} Silver Coins`, inline: true },
        { name: '🪙 New Total', value: `${result.totalQuantity.toLocaleString()} Silver Coins`, inline: true },
        { name: '⚖️ New Weight', value: `${result.newWeight.toFixed(2)}kg / ${userMaxWeight}kg`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: `Action by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
