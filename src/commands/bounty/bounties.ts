import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { getAllBounties } = require('../../utils/dataManager');

interface Bounty {
  targetId: string;
  amount: number;
  placedBy: string;
  timestamp: number;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bounties')
    .setDescription('View all active bounties'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    
    const bounties = getAllBounties() as Bounty[];
    
    if (bounties.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#808080')
        .setTitle('🎯 ACTIVE BOUNTIES')
        .setDescription('```\nNo wanted outlaws at the moment.\nThe town is peaceful... for now.\n```')
        .setFooter({ text: 'Keep an eye out for troublemakers!' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const sortedBounties = bounties.sort((a: Bounty, b: Bounty) => b.amount - a.amount);
    
    const bountyList = sortedBounties.map((bounty: Bounty, index: number) => {
      const stars = '⭐'.repeat(Math.min(Math.floor(bounty.amount / 5000), 5)) || '🔸';
      return `${index + 1}. ${stars} <@${bounty.targetId}>\n` +
             `   💰 Reward: **${bounty.amount.toLocaleString()} 🪙**\n` +
             `   🎯 Placed by: <@${bounty.placedBy}>\n` +
             `   📅 ${new Date(bounty.timestamp).toLocaleDateString()}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎯 ACTIVE BOUNTIES')
      .setDescription(`**${bounties.length}** wanted outlaw${bounties.length !== 1 ? 's' : ''} on the run!\n\n${bountyList}`)
      .setFooter({ text: 'Use /wanted to place a bounty • Use /clearbounty to remove one' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
