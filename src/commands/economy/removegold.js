const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { removeUserGold, getUserGold } = require('../../utils/dataManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removegold')
    .setDescription('[OWNER ONLY] Remove Saloon Tokens from a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to remove tokens from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of Saloon Tokens to remove')
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
    const currentGold = getUserGold(targetUser.id);

    // Remove gold
    const result = removeUserGold(targetUser.id, amount);
    
    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Failed to Remove Tokens')
        .setDescription(result.error)
        .addFields(
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'Current Balance', value: `${currentGold.toLocaleString()}`, inline: true },
          { name: 'Attempted to Remove', value: `${amount.toLocaleString()}`, inline: true }
        )
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#FF6B6B')
      .setTitle('👑 Owner Command - Remove Saloon Tokens')
      .setDescription(`Successfully removed Saloon Tokens from **${targetUser.tag}**`)
      .addFields(
        { name: '➖ Amount Removed', value: `🪙 ${amount.toLocaleString()} Saloon Tokens`, inline: true },
        { name: '🪙 New Balance', value: `🪙 ${result.remainingQuantity.toLocaleString()} Saloon Tokens`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: `Action by ${interaction.user.tag}` })
      .setTimestamp();

    if (currentGold < amount) {
      embed.addFields({ 
        name: '⚠️ Note', 
        value: `User only had 🪙 ${currentGold.toLocaleString()} Saloon Tokens. Balance set to 0.` 
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
