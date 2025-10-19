const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBountyByTarget, removeBounty, addUserSilver, getUserSilver } = require('../../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim a bounty on a wanted player')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The wanted player to capture')
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const claimer = interaction.user;

    // Check if trying to claim their own bounty
    if (target.id === claimer.id) {
      return interaction.reply({ 
        content: '❌ You cannot claim a bounty on yourself!', 
        ephemeral: true 
      });
    }

    // Check if bounty exists
    const bounty = getBountyByTarget(target.id);
    if (!bounty) {
      return interaction.reply({ 
        content: `❌ There is no active bounty on **${target.tag}**!`, 
        ephemeral: true 
      });
    }

    // Award silver to claimer
    const result = addUserSilver(claimer.id, bounty.totalAmount);
    
    if (!result.success) {
      return interaction.reply({
        content: `🚫 Your inventory is too heavy to carry the bounty reward of ${bounty.totalAmount.toLocaleString()} Silver Coins!\n\nThe bounty on **${target.tag}** remains active. Clean out your inventory and try again.`,
        ephemeral: true
      });
    }
    
    const newBalance = getUserSilver(claimer.id);

    // Build contributors list
    const contributorsList = bounty.contributors
      .map(c => `${c.tag}: ${c.amount.toLocaleString()} Silver Coins`)
      .join('\n');

    // Remove bounty
    removeBounty(target.id);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🏆 BOUNTY CLAIMED!')
      .setDescription(`**${claimer.tag}** successfully captured **${target.tag}**!`)
      .addFields(
        { name: '🎯 Target Captured', value: target.tag, inline: true },
        { name: '🪙 Reward Earned', value: `${bounty.totalAmount.toLocaleString()} Silver Coins`, inline: true },
        { name: '💳 New Balance', value: `${newBalance.toLocaleString()} Silver Coins`, inline: true },
        { name: '📝 Bounty Contributors', value: contributorsList, inline: false }
      )
      .setThumbnail(target.displayAvatarURL())
      .setFooter({ text: 'Great work, bounty hunter!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
