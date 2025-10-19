const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addItem } = require('../../utils/inventoryManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addtokens')
    .setDescription('[OWNER] Add Saloon Tokens to a user for testing')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give tokens to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of Saloon Tokens to add')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    // Check if user is bot owner
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this command!',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    // Add tokens to user inventory
    const result = addItem(targetUser.id, 'saloon_token', amount);

    if (!result.success) {
      return interaction.reply({
        content: `❌ Failed to add tokens: ${result.error}`,
        ephemeral: true
      });
    }

    // Get user's max weight
    const { getInventory } = require('../../utils/inventoryManager');
    const inventory = getInventory(targetUser.id);
    const userMaxWeight = inventory.maxWeight; // Remove fallback - getInventory always returns maxWeight
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 Owner Command - Add Saloon Tokens')
      .setDescription(`Successfully added Saloon Tokens to **${targetUser.tag}**`)
      .addFields(
        { name: '➕ Amount Added', value: `🎫 ${amount.toLocaleString()} Saloon Tokens`, inline: true },
        { name: '🎫 New Total', value: `${result.totalQuantity.toLocaleString()} Tokens`, inline: true },
        { name: '⚖️ New Weight', value: `${result.newWeight.toFixed(5)}kg / ${userMaxWeight}kg`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: `Action by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
