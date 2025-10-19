const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getInventory } = require('../../utils/inventoryManager');
const { readData, writeData } = require('../../utils/database');
const path = require('path');

const OWNER_ID = '339772388566892546';
const inventoryPath = path.join(__dirname, '..', '..', '..', 'data', 'inventory.json');

function loadInventory() {
  if (!fs.existsSync(inventoryPath)) {
    fs.writeFileSync(inventoryPath, '{}');
  }
  return JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
}

function saveInventory(data) {
  writeData('inventory.json', data);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addbackpack')
    .setDescription('[OWNER] Add backpack upgrade to a user (100kg → 500kg capacity)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to give backpack upgrade to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    // Check if user is bot owner
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this command!',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');

    // Load inventory data directly (to ensure we get fresh data)
    const inventory = loadInventory();

    // Initialize inventory if doesn't exist
    if (!inventory[targetUser.id]) {
      inventory[targetUser.id] = {
        items: {},
        weight: 0,
        maxWeight: 100
      };
    }

    // Check if already has upgrade
    if (inventory[targetUser.id].maxWeight >= 500) {
      return interaction.reply({
        content: `❌ ${targetUser.username} already has the backpack upgrade! (${inventory[targetUser.id].maxWeight}kg capacity)`,
        ephemeral: true
      });
    }

    const oldCapacity = inventory[targetUser.id].maxWeight || 100;

    // Apply backpack upgrade
    inventory[targetUser.id].maxWeight = 500;
    
    // IMPORTANT: Save directly to ensure it persists
    saveInventory(inventory);
    
    // Force reload in inventoryManager by triggering getInventory (this will refresh cache)
    getInventory(targetUser.id);

    const embed = new EmbedBuilder()
      .setColor('#8B4513')
      .setTitle('🎒 BACKPACK UPGRADE SUCCESSFUL')
      .setDescription(`Successfully upgraded **${targetUser.username}**'s saddlebag capacity!`)
      .addFields(
        { name: '📦 Old Capacity', value: `\`${oldCapacity}kg\``, inline: true },
        { name: '✨ New Capacity', value: `\`500kg\``, inline: true },
        { name: '📈 Increase', value: `\`+${500 - oldCapacity}kg\``, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: `🤠 Action by ${interaction.user.username} | Use /inventory to confirm` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    
    // Send follow-up confirmation
    await interaction.followUp({
      content: `✅ ${targetUser} now has **500kg** inventory capacity! Use \`/inventory\` to verify.`,
      ephemeral: false
    });
  },
};
