import { SlashCommandBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
const { transferItem, ITEMS } = require('../../utils/inventoryManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('🎁 Transfer items or currency to another user')
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
          { name: '🥇 Gold Bar', value: 'gold' }
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

    // Validation: No bots
    if (recipient.bot) {
      const embed = errorEmbed(
        'Invalid Recipient',
        'You can\'t give items to bots, partner!',
        'Choose a real player'
      );
      
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    // Validation: No self-transfers
    if (recipient.id === interaction.user.id) {
      const embed = warningEmbed(
        'Self-Transfer Not Allowed',
        'You can\'t give items to yourself!',
        'That would be mighty strange'
      );
      
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    // Attempt transfer
    const result = transferItem(interaction.user.id, recipient.id, itemId, amount);

    if (!result.success) {
      const embed = errorEmbed(
        'Transfer Failed',
        result.error,
        'Check your inventory and try again'
      );
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Get item details
    const item = ITEMS[itemId];
    const itemEmoji = item?.emoji || '📦';
    const itemName = item?.name || itemId;

    // Format currency display
    let amountDisplay = '';
    if (itemId === 'saloon_token') {
      amountDisplay = formatCurrency(amount, 'tokens');
    } else if (itemId === 'silver') {
      amountDisplay = formatCurrency(amount, 'silver');
    } else {
      amountDisplay = `${itemEmoji} **${amount.toLocaleString()} ${itemName}**`;
    }

    // Success message
    const embed = successEmbed(
      'Transfer Successful!',
      `You gave ${amountDisplay} to **${recipient.tag}**`
    )
      .addFields(
        { name: '👤 From', value: interaction.user.tag, inline: true },
        { name: '👤 To', value: recipient.tag, inline: true },
        { name: '📦 Item', value: `${itemEmoji} ${itemName}`, inline: true },
        { name: '🔢 Quantity', value: amount.toLocaleString(), inline: true }
      )
      .setFooter({ text: 'Generosity is a cowboy virtue!' });

    await interaction.editReply({ embeds: [embed] });
  },
};
