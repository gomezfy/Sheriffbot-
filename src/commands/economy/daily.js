const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addItem, getItem } = require('../../utils/inventoryManager');
const { t } = require('../../utils/i18n');
const fs = require('fs');
const path = require('path');

const dailyFile = path.join(__dirname, '..', '..', '..', 'data', 'daily.json');

// Initialize daily file if it doesn't exist
if (!fs.existsSync(dailyFile)) {
  fs.writeFileSync(dailyFile, JSON.stringify({}, null, 2));
}

function getLastDaily(userId) {
  const data = fs.readFileSync(dailyFile, 'utf8');
  const dailyData = JSON.parse(data);
  return dailyData[userId] || 0;
}

function setLastDaily(userId) {
  const data = fs.readFileSync(dailyFile, 'utf8');
  const dailyData = JSON.parse(data);
  dailyData[userId] = Date.now();
  fs.writeFileSync(dailyFile, JSON.stringify(dailyData, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily Silver Coins reward (100 coins every 24 hours)'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const lastClaim = getLastDaily(userId);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Check if cooldown has passed
    if (lastClaim && (now - lastClaim) < cooldown) {
      const timeLeft = cooldown - (now - lastClaim);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(t(interaction, 'daily_cooldown_title'))
        .setDescription(t(interaction, 'daily_cooldown_desc', { time: `${hoursLeft}h ${minutesLeft}m` }))
        .setFooter({ text: t(interaction, 'daily_cooldown_footer') });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Give daily reward
    const dailyAmount = 100;
    
    // Add to inventory
    const result = addItem(userId, 'silver', dailyAmount);
    
    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Inventory Full!')
        .setDescription(t(interaction, 'inventory_full'))
        .setTimestamp();
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    setLastDaily(userId);
    const totalCoins = result.totalQuantity;
    
    // Get user's inventory for correct maxWeight display
    const { getInventory } = require('../../utils/inventoryManager');
    const userInventory = getInventory(userId);
    const userMaxWeight = userInventory.maxWeight;

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(t(interaction, 'daily_title'))
      .setDescription(t(interaction, 'daily_success', { amount: dailyAmount }))
      .addFields(
        { name: 'New Balance', value: `🪙 ${totalCoins.toLocaleString()} Silver Coins`, inline: true },
        { name: '⚖️ Weight Added', value: `${(result.item.weight * dailyAmount).toFixed(3)}kg`, inline: true },
        { name: '📦 Total Weight', value: `${result.newWeight.toFixed(2)}kg / ${userMaxWeight}kg`, inline: true }
      )
      .setFooter({ text: t(interaction, 'daily_footer') })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
