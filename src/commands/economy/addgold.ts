import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getSaloonTokenEmoji } from '../../utils/customEmojis';
import { isOwner, adminRateLimiter, isValidCurrencyAmount, MAX_CURRENCY_AMOUNT } from '../../utils/security';
const { addItem } = require('../../utils/inventoryManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addgold')
    .setDescription('[OWNER ONLY] Add Saloon Tokens to a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give Saloon Tokens to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of Saloon Tokens to add')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(MAX_CURRENCY_AMOUNT)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Security: Validate owner
    if (!await isOwner(interaction)) {
      return;
    }
    
    // Security: Rate limit admin commands
    if (!adminRateLimiter.canExecute(interaction.user.id)) {
      const remaining = adminRateLimiter.getRemainingCooldown(interaction.user.id);
      await interaction.reply({
        content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    
    // Security: Validate amount
    if (!isValidCurrencyAmount(amount)) {
      await interaction.reply({
        content: `❌ Invalid amount! Must be between 1 and ${MAX_CURRENCY_AMOUNT.toLocaleString()}.`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const result = addItem(targetUser.id, 'saloon_token', amount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to add tokens: ${result.error}`,
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const tokenEmoji = getSaloonTokenEmoji();
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✅ Saloon Tokens Added!')
      .setDescription(`Successfully added **${amount.toLocaleString()} ${tokenEmoji}** to ${targetUser.tag}!`)
      .addFields(
        { name: '👤 User', value: `${targetUser}`, inline: true },
        { name: '💰 Amount', value: `${amount.toLocaleString()} ${tokenEmoji}`, inline: true }
      )
      .setFooter({ text: 'Manual addition by bot owner' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
