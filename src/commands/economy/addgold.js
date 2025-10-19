const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addUserGold, getUserGold } = require('../../utils/dataManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addgold')
    .setDescription('[OWNER ONLY] Add Saloon Tokens to a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give tokens to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of Saloon Tokens to add')
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

    // Add gold
    const result = addUserGold(targetUser.id, amount);
    
    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Failed to Add Tokens')
        .setDescription(result.error)
        .addFields(
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'Attempted Amount', value: `${amount.toLocaleString()}`, inline: true }
        )
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('👑 Owner Command - Add Saloon Tokens')
      .setDescription(`Successfully added Saloon Tokens to **${targetUser.tag}**`)
      .addFields(
        { name: '➕ Amount Added', value: `🪙 ${amount.toLocaleString()} Saloon Tokens`, inline: true },
        { name: '🪙 New Balance', value: `🪙 ${result.totalQuantity.toLocaleString()} Saloon Tokens`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: `Action by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
