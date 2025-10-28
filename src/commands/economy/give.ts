import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { successEmbed, errorEmbed, warningEmbed, formatCurrency } from '../../utils/embeds';
import { t } from '../../utils/i18n';
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

    if (recipient.bot) {
      const embed = errorEmbed(
        t(interaction, 'give_invalid_recipient'),
        t(interaction, 'give_cant_give_bots'),
        t(interaction, 'give_choose_real_player')
      );
      
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    if (recipient.id === interaction.user.id) {
      const embed = warningEmbed(
        t(interaction, 'give_self_transfer'),
        t(interaction, 'give_cant_give_self'),
        t(interaction, 'give_mighty_strange')
      );
      
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply();

    const result = transferItem(interaction.user.id, recipient.id, itemId, amount);

    if (!result.success) {
      const embed = errorEmbed(
        t(interaction, 'give_transfer_failed'),
        result.error,
        t(interaction, 'give_check_inventory')
      );
      
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const item = ITEMS[itemId];
    const itemEmoji = item?.emoji || '📦';
    const itemName = item?.name || itemId;

    let amountDisplay = '';
    if (itemId === 'saloon_token') {
      amountDisplay = formatCurrency(amount, 'tokens');
    } else if (itemId === 'silver') {
      amountDisplay = formatCurrency(amount, 'silver');
    } else {
      amountDisplay = `${itemEmoji} **${amount.toLocaleString()} ${itemName}**`;
    }

    const embed = successEmbed(
      t(interaction, 'give_transfer_success'),
      t(interaction, 'give_you_gave', { amount: amountDisplay, user: recipient.tag })
    )
      .addFields(
        { name: t(interaction, 'give_from'), value: interaction.user.tag, inline: true },
        { name: t(interaction, 'give_to'), value: recipient.tag, inline: true },
        { name: t(interaction, 'give_item'), value: `${itemEmoji} ${itemName}`, inline: true },
        { name: t(interaction, 'give_quantity'), value: amount.toLocaleString(), inline: true }
      )
      .setFooter({ text: t(interaction, 'give_generosity') });

    await interaction.editReply({ embeds: [embed] });
  },
};
