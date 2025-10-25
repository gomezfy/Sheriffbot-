import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { infoEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
import { getScrollEmoji, getDartEmoji, getMoneybagEmoji, getCowboysEmoji } from '../../utils/customEmojis';
const { getAllBounties } = require('../../utils/dataManager');

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
  data: new SlashCommandBuilder()
    .setName('bounties')
    .setDescription('📜 View all active bounties'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const bounties: Bounty[] = getAllBounties();

    if (bounties.length === 0) {
      const embed = warningEmbed(
        'No Active Bounties',
        'The Wild West is peaceful today!\n\nNo outlaws are currently wanted.',
        'Use /wanted to place a bounty'
      );
      
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // Sort by highest bounty first
    const sortedBounties = bounties.sort((a, b) => b.totalAmount - a.totalAmount);

    let description = '**Most Wanted Outlaws:**\n\n';

    const moneyEmoji = getMoneybagEmoji();
    const groupEmoji = getCowboysEmoji();
    
    for (const bounty of sortedBounties.slice(0, 10)) {
      const stars = '⭐'.repeat(Math.min(Math.floor(bounty.totalAmount / 5000), 5)) || '🔸';
      
      description += `${stars} **${bounty.targetTag}**\n`;
      description += `   ${moneyEmoji} Reward: ${formatCurrency(bounty.totalAmount, 'silver')}\n`;
      description += `   ${groupEmoji} Contributors: ${bounty.contributors.length}\n\n`;
    }

    if (bounties.length > 10) {
      description += `*...and ${bounties.length - 10} more outlaws*`;
    }

    const embed = infoEmbed(
      `${getScrollEmoji()} Active Bounties`,
      description
    )
      .addFields(
        { name: `${getDartEmoji()} Total Bounties`, value: bounties.length.toString(), inline: true },
        { name: `${getMoneybagEmoji()} Total Rewards`, value: formatCurrency(
          bounties.reduce((sum, b) => sum + b.totalAmount, 0),
          'silver'
        ), inline: true }
      )
      .setFooter({ text: 'Hunt outlaws and claim rewards!' });

    await interaction.reply({ embeds: [embed] });
  },
};
