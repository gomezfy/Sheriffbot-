import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
const { upgradeBackpack } = require('../../utils/inventoryManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addbackpack')
    .setDescription('[OWNER ONLY] Manually upgrade a user\'s backpack to 500kg')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to upgrade')
        .setRequired(true)
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

    const result = upgradeBackpack(targetUser.id);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to upgrade backpack: ${result.error}`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Backpack Upgraded!')
      .setDescription(`**${targetUser.tag}** now has a **500kg backpack**!`)
      .addFields(
        { name: '👤 User', value: `${targetUser}`, inline: true },
        { name: '🎒 New Capacity', value: '500kg', inline: true }
      )
      .setFooter({ text: 'Manual upgrade by bot owner' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
