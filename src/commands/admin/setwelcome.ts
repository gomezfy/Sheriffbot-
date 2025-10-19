import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ChatInputCommandInteraction } from 'discord.js';
import { setWelcomeConfig, removeWelcomeConfig, getWelcomeConfig } from '../../utils/dataManager';
import { buildWelcomeEmbed } from '../../utils/welcomeEmbedBuilder';

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('🤠 Configure welcome messages for new members')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set up the welcome system')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel where welcome messages will be sent')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('message')
            .setDescription('Welcome message (use placeholders: {user}, {username}, {user.tag}, {server}, etc)')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('image')
            .setDescription('URL of image or GIF for the welcome banner (optional)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Test the welcome message with yourself'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View current welcome configuration'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable the welcome system')),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: '❌ This command can only be used in a server!', ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const channel = interaction.options.getChannel('channel', true);
      const message = interaction.options.getString('message', true);
      const image = interaction.options.getString('image');

      if (image && !isValidUrl(image)) {
        await interaction.reply({
          content: '❌ Invalid image URL! Please provide a valid URL starting with http:// or https://',
          ephemeral: true
        });
        return;
      }

      const config = {
        channelId: channel.id,
        message: message,
        image: image,
        enabled: true
      };

      setWelcomeConfig(interaction.guild.id, config);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('✅ Welcome System Configured!')
        .setDescription('New members will receive a warm welcome!')
        .addFields(
          { name: '📢 Channel', value: `<#${channel.id}>`, inline: true },
          { name: '💬 Message', value: message, inline: false }
        )
        .setTimestamp();

      if (image) {
        embed.addFields({ name: '🖼️ Banner', value: '[Image/GIF Set](' + image + ')', inline: true });
        embed.setImage(image);
      }

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'test') {
      const config = getWelcomeConfig(interaction.guild.id);

      if (!config || !config.enabled) {
        await interaction.reply({
          content: '❌ Welcome system is not configured! Use `/setwelcome set` first.',
          ephemeral: true
        });
        return;
      }

      const channel = interaction.guild.channels.cache.get(config.channelId);
      if (!channel || !('send' in channel)) {
        await interaction.reply({
          content: '❌ Welcome channel not found! Please reconfigure with `/setwelcome set`',
          ephemeral: true
        });
        return;
      }

      try {
        if (!interaction.member || !interaction.guild) {
          await interaction.reply({
            content: '❌ Could not retrieve member information!',
            ephemeral: true
          });
          return;
        }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const messagePayload = buildWelcomeEmbed(config, member);
        
        await channel.send(messagePayload);
        await interaction.reply({
          content: `✅ Test message sent to <#${channel.id}>!`,
          ephemeral: true
        });
      } catch (error) {
        console.error('Error sending test welcome:', error);
        await interaction.reply({
          content: '❌ Failed to send test message. Check bot permissions in that channel!\n\nIf using JSON, verify it\'s valid.',
          ephemeral: true
        });
      }

    } else if (subcommand === 'view') {
      const config = getWelcomeConfig(interaction.guild.id);

      if (!config) {
        await interaction.reply({
          content: '❌ Welcome system is not configured yet! Use `/setwelcome set` to set it up.',
          ephemeral: true
        });
        return;
      }

      const placeholdersInfo = 
        '**User Placeholders:**\n' +
        '`{user}` or `{@user}` - Mention user\n' +
        '`{username}` or `{user.name}` - Username\n' +
        '`{user.tag}` - Full tag\n' +
        '`{user.id}` - User ID\n' +
        '`{user.avatar}` - Avatar URL\n\n' +
        '**Server Placeholders:**\n' +
        '`{server}` or `{guild.name}` - Server name\n' +
        '`{guild.size}` - Member count\n' +
        '`{guild.icon}` - Server icon URL';

      const embed = new EmbedBuilder()
        .setColor(config.enabled ? '#FFD700' : '#808080')
        .setTitle('🤠 Welcome System Configuration')
        .addFields(
          { name: '📊 Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '📢 Channel', value: `<#${config.channelId}>`, inline: true },
          { name: '💬 Message', value: config.message, inline: false },
          { name: '📝 Available Placeholders', value: placeholdersInfo, inline: false }
        );

      if (config.updatedAt) {
        embed.setTimestamp(config.updatedAt);
      }

      if (config.image) {
        embed.addFields({ name: '🖼️ Banner', value: '[View Image](' + config.image + ')', inline: true });
        embed.setThumbnail(config.image);
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else if (subcommand === 'disable') {
      const config = getWelcomeConfig(interaction.guild.id);

      if (!config) {
        await interaction.reply({
          content: '❌ Welcome system is not configured!',
          ephemeral: true
        });
        return;
      }

      removeWelcomeConfig(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setColor('#FF4444')
        .setTitle('❌ Welcome System Disabled')
        .setDescription('Welcome messages will no longer be sent to new members.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};
