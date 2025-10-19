const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getItem } = require('../../utils/inventoryManager');
const fs = require('fs');
const path = require('path');

const inventoryFile = path.join(__dirname, '..', '..', 'data', 'inventory.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 View the richest outlaws in the Wild West!')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('What to rank by')
        .setRequired(false)
        .addChoices(
          { name: '🎫 Saloon Tokens', value: 'tokens' },
          { name: '🪙 Silver Coins', value: 'silver' },
          { name: '🥇 Gold Bars', value: 'gold' },
          { name: '💰 Total Wealth', value: 'total' }
        )
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type') || 'total';

    await interaction.deferReply();

    try {
      // Load all inventories
      const data = fs.readFileSync(inventoryFile, 'utf8');
      const inventories = JSON.parse(data);

      // Calculate wealth for each user
      const wealthData = [];
      
      for (const [userId, inventory] of Object.entries(inventories)) {
        const tokens = inventory.items?.saloon_token || 0;
        const silver = inventory.items?.silver || 0;
        const gold = inventory.items?.gold || 0;
        
        // Calculate total wealth (convert everything to silver equivalent)
        // 1 Token = 1000 Silver, 1 Gold = 700 Silver
        const totalWealth = silver + (tokens * 1000) + (gold * 700);

        wealthData.push({
          userId,
          tokens,
          silver,
          gold,
          totalWealth
        });
      }

      // Sort based on type
      let sortedData;
      let emoji, title, field;
      
      switch(type) {
        case 'tokens':
          sortedData = wealthData.sort((a, b) => b.tokens - a.tokens);
          emoji = '🎫';
          title = 'Top Saloon Token Holders';
          field = 'tokens';
          break;
        case 'silver':
          sortedData = wealthData.sort((a, b) => b.silver - a.silver);
          emoji = '🪙';
          title = 'Top Silver Coin Holders';
          field = 'silver';
          break;
        case 'gold':
          sortedData = wealthData.sort((a, b) => b.gold - a.gold);
          emoji = '🥇';
          title = 'Top Gold Bar Holders';
          field = 'gold';
          break;
        default:
          sortedData = wealthData.sort((a, b) => b.totalWealth - a.totalWealth);
          emoji = '💰';
          title = 'Richest Outlaws (Total Wealth)';
          field = 'totalWealth';
      }

      // Get top 10
      const top10 = sortedData.slice(0, 10).filter(data => data[field] > 0);

      if (top10.length === 0) {
        return interaction.editReply({
          content: '📋 No one has any wealth yet! Be the first to get rich! 🤠',
          ephemeral: true
        });
      }

      // Build leaderboard text
      let leaderboard = '';
      
      for (let i = 0; i < top10.length; i++) {
        const userData = top10[i];
        const rank = i + 1;
        
        // Medal for top 3
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        
        // Fetch user from Discord
        let username = 'Unknown User';
        try {
          const user = await interaction.client.users.fetch(userData.userId);
          username = user.username;
        } catch (error) {
          username = `User ${userData.userId.slice(0, 8)}`;
        }

        // Format value based on type
        let value;
        if (type === 'total') {
          value = `💰 ${userData.totalWealth.toLocaleString()} (🎫 ${userData.tokens.toLocaleString()} | 🪙 ${userData.silver.toLocaleString()} | 🥇 ${userData.gold.toLocaleString()})`;
        } else {
          value = `${emoji} ${userData[field].toLocaleString()}`;
        }

        leaderboard += `${medal} **${username}**\n${value}\n\n`;
      }

      // Find current user's rank
      const userRank = sortedData.findIndex(data => data.userId === interaction.user.id) + 1;
      const userData = sortedData.find(data => data.userId === interaction.user.id);

      let footer = '';
      if (userRank > 0) {
        footer = `Your Rank: #${userRank} | Your ${type === 'total' ? 'Wealth' : emoji}: ${userData[field].toLocaleString()}`;
      } else {
        footer = 'You\'re not ranked yet! Start earning to get on the leaderboard!';
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🏆 ${title}`)
        .setDescription(leaderboard || 'No data available')
        .setFooter({ text: footer })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Leaderboard error:', error);
      await interaction.editReply({
        content: '❌ Failed to load leaderboard. Please try again later.',
        ephemeral: true
      });
    }
  },
};
