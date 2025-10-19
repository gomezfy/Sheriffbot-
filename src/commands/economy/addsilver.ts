import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { addItem } = require('../../utils/inventoryManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addsilver')
    .setDescription('[OWNER ONLY] Add Silver Coins to a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to give Silver Coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of Silver Coins to add')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: '❌ This command is only available to the bot owner!',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    const result = addItem(targetUser.id, 'silver', amount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to add coins: ${result.error}`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#C0C0C0')
      .setTitle('✅ Silver Coins Added!')
      .setDescription(`Successfully added **${amount.toLocaleString()} 🪙** to ${targetUser.tag}!`)
      .addFields(
        { name: '👤 User', value: `${targetUser}`, inline: true },
        { name: '💰 Amount', value: `${amount.toLocaleString()} 🪙`, inline: true }
      )
      .setFooter({ text: 'Manual addition by bot owner' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
