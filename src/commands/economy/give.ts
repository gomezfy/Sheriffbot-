import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { transferItem } = require('../../utils/inventoryManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give items or currency to another user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('item')
        .setDescription('The item to give')
        .setRequired(true)
        .addChoices(
          { name: '🎫 Saloon Tokens', value: 'saloon_token' },
          { name: '🪙 Silver Coins', value: 'silver' },
          { name: '🥇 Gold Bar', value: 'gold' },
          { name: '🍺 Whiskey Bottle', value: 'whiskey' },
          { name: '🎰 Lucky Charm', value: 'lucky_charm' },
          { name: '🗝️ Skeleton Key', value: 'skeleton_key' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount to give')
        .setRequired(true)
        .setMinValue(1)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const recipient = interaction.options.getUser('user', true);
    const itemId = interaction.options.getString('item', true);
    const amount = interaction.options.getInteger('amount', true);

    if (recipient.bot) {
      await interaction.reply({
        content: '❌ You can\'t give items to bots!',
        ephemeral: true
      });
    }

    if (recipient.id === interaction.user.id) {
      await interaction.reply({
        content: '❌ You can\'t give items to yourself!',
        ephemeral: true
      });
    }

    const result = transferItem(interaction.user.id, recipient.id, itemId, amount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ ${result.error}`,
        ephemeral: true
      });
    }

    const itemEmojis: Record<string, string> = {
      'saloon_token': '🎫',
      'silver': '🪙',
      'gold': '🥇',
      'whiskey': '🍺',
      'lucky_charm': '🎰',
      'skeleton_key': '🗝️'
    };

    const itemNames: Record<string, string> = {
      'saloon_token': 'Saloon Tokens',
      'silver': 'Silver Coins',
      'gold': 'Gold Bars',
      'whiskey': 'Whiskey Bottles',
      'lucky_charm': 'Lucky Charms',
      'skeleton_key': 'Skeleton Keys'
    };

    const emoji = itemEmojis[itemId] || '📦';
    const name = itemNames[itemId] || itemId;

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Transfer Successful!')
      .setDescription(`You gave **${amount.toLocaleString()} ${emoji} ${name}** to ${recipient}!`)
      .addFields(
        { name: '👤 From', value: `${interaction.user}`, inline: true },
        { name: '👤 To', value: `${recipient}`, inline: true },
        { name: '📦 Item', value: `${emoji} ${name}`, inline: true },
        { name: '🔢 Amount', value: `${amount.toLocaleString()}`, inline: true },
        { name: '💼 Your Weight', value: `${result.senderWeight.toFixed(2)}kg`, inline: true },
        { name: '💼 Their Weight', value: `${result.recipientWeight.toFixed(2)}kg`, inline: true }
      )
      .setFooter({ text: 'Generosity is a cowboy virtue!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
