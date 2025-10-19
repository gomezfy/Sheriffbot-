const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { transferItem, ITEMS } = require('../../utils/inventoryManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give items to another player')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give items to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('The item to give')
        .setRequired(true)
        .addChoices(
          { name: '🎫 Saloon Token', value: 'saloon_token' },
          { name: '🪙 Silver Coin', value: 'silver' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('Amount to give')
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const itemId = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity');
    
    // Cannot give to yourself
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot give items to yourself!',
        ephemeral: true
      });
    }
    
    // Cannot give to bots
    if (targetUser.bot) {
      return interaction.reply({
        content: '❌ You cannot give items to bots!',
        ephemeral: true
      });
    }
    
    const item = ITEMS[itemId];
    const result = transferItem(interaction.user.id, targetUser.id, itemId, quantity);
    
    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('❌ Transfer Failed!')
        .setDescription(result.error)
        .setTimestamp();
      
      if (result.currentWeight && result.maxWeight) {
        embed.addFields(
          { name: 'Recipient\'s Current Weight', value: `${result.currentWeight}kg`, inline: true },
          { name: 'Maximum Weight', value: `${result.maxWeight}kg`, inline: true },
          { name: 'Additional Weight', value: `${result.additionalWeight}kg`, inline: true }
        );
      }
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Transfer Completed!')
      .setDescription(`**${interaction.user.tag}** gave **${item.emoji} ${quantity.toLocaleString()} ${item.name}${quantity > 1 ? 's' : ''}** to **${targetUser.tag}**`)
      .addFields(
        { name: 'Item', value: `${item.emoji} ${item.name}`, inline: true },
        { name: 'Quantity', value: `${quantity.toLocaleString()}`, inline: true },
        { name: 'Total Weight', value: `${(item.weight * quantity).toFixed(3)}kg`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: `Transferred by ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
