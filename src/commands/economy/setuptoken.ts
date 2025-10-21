import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
const { addItem, getInventory } = require('../../utils/inventoryManager');

const OWNER_ID = '339772388566892546';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setuptoken')
    .setDescription('[OWNER ONLY] Give a new user starter tokens (100 Saloon Tokens)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The new user to give starter tokens to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.user.id !== OWNER_ID) {
      await interaction.reply({
        content: '❌ This command is only available to the bot owner!',
        flags: MessageFlags.Ephemeral
      });
    }

    const targetUser = interaction.options.getUser('user', true);
    const starterAmount = 100;

    const inventory = getInventory(targetUser.id);
    const currentTokens = inventory.items['saloon_token'] || 0;

    if (currentTokens >= starterAmount) {
      await interaction.reply({
        content: `⚠️ ${targetUser.tag} already has ${currentTokens.toLocaleString()} 🎫 Saloon Tokens. They don't need starter tokens!`,
        flags: MessageFlags.Ephemeral
      });
    }

    const result = addItem(targetUser.id, 'saloon_token', starterAmount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to add tokens: ${result.error}`,
        flags: MessageFlags.Ephemeral
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✅ Starter Tokens Given!')
      .setDescription(`Successfully gave **${starterAmount.toLocaleString()} 🎫** starter tokens to ${targetUser.tag}!`)
      .addFields(
        { name: '👤 User', value: `${targetUser}`, inline: true },
        { name: '🎫 Amount', value: `${starterAmount.toLocaleString()} Saloon Tokens`, inline: true }
      )
      .setFooter({ text: 'Welcome gift for new users!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
