const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAllBounties } = require('../../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bounties')
    .setDescription('View all active bounties'),
  async execute(interaction) {
    const bounties = getAllBounties();

    if (bounties.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#808080')
        .setTitle('📋 Active Bounties')
        .setDescription('There are no active bounties at the moment.')
        .setFooter({ text: 'Use /wanted to place a bounty!' });

      return interaction.reply({ embeds: [embed] });
    }

    // Sort bounties by amount (highest first)
    const sortedBounties = bounties.sort((a, b) => b.totalAmount - a.totalAmount);

    // Create bounty list (limit to 10 for display)
    const bountyList = sortedBounties.slice(0, 10).map((bounty, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯';
      const contributorCount = bounty.contributors.length;
      const contributorText = contributorCount === 1 
        ? `Posted by: ${bounty.contributors[0].tag}` 
        : `${contributorCount} contributors`;
      
      return `${medal} **${bounty.targetTag}**\n🪙 Reward: **${bounty.totalAmount.toLocaleString()} Silver Coins**\n📝 ${contributorText}\n`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📋 Active Bounties')
      .setDescription(bountyList)
      .setFooter({ text: `Total bounties: ${bounties.length} | Use /claim <user> to capture a bounty!` })
      .setTimestamp();

    if (bounties.length > 10) {
      embed.addFields({ 
        name: '📊 More Bounties', 
        value: `... and ${bounties.length - 10} more bounties available!` 
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
