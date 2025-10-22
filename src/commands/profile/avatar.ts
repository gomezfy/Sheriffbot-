import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a user\'s avatar')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to view avatar')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setColor(0x5865F2)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setFooter({ text: `Requested by ${interaction.user.username}` });
    
    await interaction.reply({ embeds: [embed] });
  },
};
