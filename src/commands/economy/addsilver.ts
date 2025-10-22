import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getSilverCoinEmoji } from '../../utils/customEmojis';
const { addItem } = require('../../utils/inventoryManager');

const OWNER_ID = process.env.OWNER_ID;

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
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    const result = addItem(targetUser.id, 'silver', amount);

    if (!result.success) {
      await interaction.reply({
        content: `❌ Failed to add coins: ${result.error}`,
        flags: [MessageFlags.Ephemeral]
      });
      return;
    }

    const silverEmoji = getSilverCoinEmoji();
    
    const embed = new EmbedBuilder()
      .setColor('#C0C0C0')
      .setTitle('✅ Silver Coins Added!')
      .setDescription(`Successfully added **${amount.toLocaleString()} ${silverEmoji}** to ${targetUser.tag}!`)
      .addFields(
        { name: '👤 User', value: `${targetUser}`, inline: true },
        { name: '💰 Amount', value: `${amount.toLocaleString()} ${silverEmoji}`, inline: true }
      )
      .setFooter({ text: 'Manual addition by bot owner' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
