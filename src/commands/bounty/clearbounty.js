const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBountyByTarget, removeBounty, addUserGold } = require('../../utils/dataManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearbounty')
    .setDescription('[OWNER ONLY] Remove a bounty and optionally refund the contributors')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The user whose bounty to remove')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('refund')
        .setDescription('Refund the Saloon Tokens to all contributors who posted the bounty?')
        .setRequired(false)
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

    const target = interaction.options.getUser('target');
    const shouldRefund = interaction.options.getBoolean('refund') ?? false;

    // Check if bounty exists
    const bounty = getBountyByTarget(target.id);
    if (!bounty) {
      return interaction.reply({ 
        content: `❌ There is no active bounty on **${target.tag}**!`, 
        ephemeral: true 
      });
    }

    // Refund if requested
    let refundInfo = 'No';
    if (shouldRefund) {
      // Refund all contributors
      bounty.contributors.forEach(contributor => {
        addUserGold(contributor.id, contributor.amount);
      });
      refundInfo = `Yes - ${bounty.contributors.length} contributor(s) refunded`;
    }

    // Build contributors list
    const contributorsList = bounty.contributors
      .map(c => `${c.tag}: ${c.amount.toLocaleString()} Saloon Tokens`)
      .join('\n');

    // Remove bounty
    removeBounty(target.id);

    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('👑 Owner Command - Bounty Cleared')
      .setDescription(`Successfully removed bounty on **${target.tag}**`)
      .addFields(
        { name: '🎯 Target', value: target.tag, inline: true },
        { name: '🎫 Total Bounty', value: `${bounty.totalAmount.toLocaleString()} Saloon Tokens`, inline: true },
        { name: '💳 Refunded?', value: refundInfo, inline: true },
        { name: '📝 Contributors', value: contributorsList, inline: false }
      )
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: `Action by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
