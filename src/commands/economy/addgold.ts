import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
const { addItem } = require('../../utils/inventoryManager');

const OWNER_ID = process.env.OWNER_ID;

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
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: '❌ This command is only available to the bot owner!',
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    const result = addItem(targetUser.id, 'saloon_token', amount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to add tokens: ${result.error}`,
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✅ Saloon Tokens Added!')
      .setDescription(`Successfully added **${amount.toLocaleString()} 🎫** to ${targetUser.tag}!`)
      .addFields(
        { name: '👤 User', value: `${targetUser}`, inline: true },
        { name: '💰 Amount', value: `${amount.toLocaleString()} 🎫`, inline: true }
      )
      .setFooter({ text: 'Manual addition by bot owner' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
