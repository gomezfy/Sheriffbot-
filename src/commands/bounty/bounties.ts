import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { applyLocalizations } from '../../utils/commandLocalizations';
import { warningEmbed, formatCurrency, infoEmbed } from '../../utils/embeds';
import { getDartEmoji, getMoneybagEmoji, getScrollEmoji, getCowboysEmoji, getStarEmoji } from '../../utils/customEmojis';
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
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName('bounties')
      .setDescription('View all active bounties'),
    'bounties'
  ),
  
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

    // Filtrar apenas procurados que estão no servidor
    let bountiesInServer: Bounty[] = [];
    
    if (interaction.guild) {
      for (const bounty of bounties) {
        try {
          await interaction.guild.members.fetch(bounty.targetId);
          bountiesInServer.push(bounty);
        } catch (error) {
          // Usuário não está no servidor, não incluir na lista
        }
      }
    } else {
      bountiesInServer = bounties;
    }

    if (bountiesInServer.length === 0) {
      const embed = warningEmbed(
        'No Outlaws in Server',
        'No wanted outlaws are currently in this server!\n\nAll the outlaws have fled.',
        'Use /wanted to place a bounty'
      );
      
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const sortedBounties = bountiesInServer.sort((a, b) => b.totalAmount - a.totalAmount);
    let description = '**Most Wanted Outlaws:**\n\n';
    const moneyEmoji = getMoneybagEmoji();
    const groupEmoji = getCowboysEmoji();
    
    for (const bounty of sortedBounties.slice(0, 10)) {
      const starEmoji = getStarEmoji();
      const stars = starEmoji.repeat(Math.min(Math.floor(bounty.totalAmount / 5000), 5)) || '🔸';
      
      description += `${stars} **${bounty.targetTag}**\n`;
      description += `   ${moneyEmoji} Reward: ${formatCurrency(bounty.totalAmount, 'silver')}\n`;
      description += `   ${groupEmoji} Contributors: ${bounty.contributors.length}\n\n`;
    }

    if (bountiesInServer.length > 10) {
      description += `*...and ${bountiesInServer.length - 10} more outlaws*`;
    }

    const embed = infoEmbed(
      `${getScrollEmoji()} Active Bounties`,
      description
    )
      .addFields(
        { name: `${getDartEmoji()} Total Bounties`, value: bountiesInServer.length.toString(), inline: true },
        { name: `${getMoneybagEmoji()} Total Rewards`, value: formatCurrency(
          bountiesInServer.reduce((sum, b) => sum + b.totalAmount, 0),
          'silver'
        ), inline: true }
      )
      .setFooter({ text: 'Hunt outlaws and claim rewards with /capture!' });

    await interaction.reply({ embeds: [embed] });
  }
};
