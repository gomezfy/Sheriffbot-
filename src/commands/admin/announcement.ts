import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcement')
    .setDescription('Send an announcement to a specific channel (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to send the announcement to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('The title of the announcement')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('The announcement message')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('The color of the embed (hex code, e.g., #FF0000)')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel', true);
    const title = interaction.options.getString('title', true);
    const message = interaction.options.getString('message', true);
    const colorHex = interaction.options.getString('color') || '#FFD700';

    let color: number;
    try {
      color = parseInt(colorHex.replace('#', ''), 16);
    } catch (error) {
      color = 0xFFD700;
    }

    const announcementEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📢 ${title}`)
      .setDescription(message)
      .setFooter({ text: `Announced by ${interaction.user.tag}` })
      .setTimestamp();

    try {
      if (!channel || !('send' in channel)) {
        await interaction.reply({
          content: '❌ The channel must be a text channel!',
          ephemeral: true
        });
        return;
      }

      await channel.send({ embeds: [announcementEmbed] });

      const confirmEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Announcement Sent!')
        .setDescription(`Your announcement has been sent to ${channel}`)
        .setTimestamp();

      await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    } catch (error) {
      await interaction.reply({
        content: '❌ Failed to send announcement. Make sure I have permissions to send messages in that channel!',
        ephemeral: true
      });
    }
  },
};
