import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { removeBounty, getBountyByTarget } = require('../../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearbounty')
    .setDescription('Remove a bounty on someone')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to remove bounty from')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user', true);
    
    const existingBounty = getBountyByTarget(target.id);
    
    if (!existingBounty) {
      await interaction.reply({
        content: `❌ ${target.tag} doesn't have an active bounty!`,
        ephemeral: true
      });
    }

    if (existingBounty.posterId !== interaction.user.id) {
      await interaction.reply({
        content: '❌ You can only remove bounties that you placed!',
        ephemeral: true
      });
    }

    removeBounty(target.id);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Bounty Cleared')
      .setDescription(`The bounty on **${target.tag}** has been removed.\n\nThey are no longer wanted by the law!`)
      .addFields(
        { name: '🎯 Target', value: `${target}`, inline: true },
        { name: '💰 Bounty Amount', value: `${existingBounty.amount.toLocaleString()} 🪙`, inline: true }
      )
      .setFooter({ text: 'Justice has been served!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
