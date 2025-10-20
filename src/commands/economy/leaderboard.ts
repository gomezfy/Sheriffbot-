import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { getTopUsers } = require('../../utils/inventoryManager');
const { getTopXPUsers } = require('../../utils/xpManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('📊 View the top cowboys in the Wild West!')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Leaderboard category')
        .setRequired(false)
        .addChoices(
          { name: '🎫 Saloon Tokens', value: 'tokens' },
          { name: '🪙 Silver Coins', value: 'silver' },
          { name: '⭐ XP/Level', value: 'xp' }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    
    const category = interaction.options.getString('category') || 'tokens';

    if (category === 'xp') {
      const topUsers = getTopXPUsers(10);
      
      if (topUsers.length === 0) {
        await interaction.editReply({
          content: '❌ No users found on the XP leaderboard!'
        });
        return;
      }

      let leaderboardText = '';
      for (let i = 0; i < topUsers.length; i++) {
        const userData = topUsers[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        
        leaderboardText += `${medal} <@${userData.userId}>\n`;
        leaderboardText += `   ⭐ Level ${userData.level} • ${userData.xp.toLocaleString()} XP\n\n`;
      }

      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('⭐ XP LEADERBOARD')
        .setDescription(leaderboardText || 'No users yet!')
        .setFooter({ text: 'Keep leveling up, partner!' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const itemType = category === 'tokens' ? 'saloon_token' : 'silver';
    const topUsers = getTopUsers(itemType, 10);

    if (topUsers.length === 0) {
      await interaction.editReply({
        content: `❌ No users found on the ${category} leaderboard!`
      });
      return;
    }

    const emoji = category === 'tokens' ? '🎫' : '🪙';
    const name = category === 'tokens' ? 'Saloon Tokens' : 'Silver Coins';
    const color = category === 'tokens' ? '#FFD700' : '#C0C0C0';

    let leaderboardText = '';
    for (let i = 0; i < topUsers.length; i++) {
      const userData = topUsers[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      
      leaderboardText += `${medal} <@${userData.userId}>\n`;
      leaderboardText += `   ${emoji} ${userData.amount.toLocaleString()} ${name}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} ${name.toUpperCase()} LEADERBOARD`)
      .setDescription(leaderboardText || 'No users yet!')
      .setFooter({ text: 'Work hard and climb the ranks!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
