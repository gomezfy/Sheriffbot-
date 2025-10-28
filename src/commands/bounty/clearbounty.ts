import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { applyLocalizations } from '../../utils/commandLocalizations';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
const { getBountyByTarget, removeBounty } = require('../../utils/dataManager');

interface Bounty {
  targetId: string;
  targetTag: string;
  totalAmount: number;
  contributors: Array<{
    id: string;
    tag: string;
    amount: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

module.exports = {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('clearbounty')
      .setDescription('Remove a bounty (Admin only)')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('User to clear bounty from')
          .setRequired(true)
      ),
    'clearbounty'
  ),
  
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.memberPermissions?.has('Administrator')) {
      const embed = errorEmbed(
        'Permission Denied',
        'Only administrators can clear bounties!',
        'Contact a server admin'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const target = interaction.options.getUser('user', true);
    const bounty: Bounty = getBountyByTarget(target.id);
    
    if (!bounty) {
      const embed = warningEmbed(
        'No Bounty Found',
        `**${target.tag}** doesn't have an active bounty.`,
        'Nothing to clear'
      );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    removeBounty(target.id);

    const embed = successEmbed(
      '🚫 Bounty Cleared',
      `Bounty on **${target.tag}** has been cleared by an administrator.`,
      'The outlaw is no longer wanted'
    )
      .addFields(
        { name: '🎯 Target', value: target.tag, inline: true },
        { name: '💰 Amount Cleared', value: formatCurrency(bounty.totalAmount, 'silver'), inline: true },
        { name: '⚙️ Cleared By', value: interaction.user.tag, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
