import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ChatInputCommandInteraction ,MessageFlags} from 'discord.js';
import { setLogConfig, removeLogConfig, getLogConfig } from '../../utils/dataManager';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('🛡️ Configure log system for the server (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set up the log channel')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel where logs will be sent')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View current log configuration'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Disable the log system')),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: '❌ This command can only be used in a server!', flags: MessageFlags.Ephemeral });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const channel = interaction.options.getChannel('channel', true);

      const config = {
        channelId: channel.id,
        enabled: true,
        types: ['command', 'error', 'welcome', 'leave', 'economy', 'bounty', 'mining', 'gambling', 'admin']
      };

      setLogConfig(interaction.guild.id, config);

      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Log System Configured!')
        .setDescription('The bot will now send detailed logs to the configured channel.')
        .addFields(
          { name: '📢 Log Channel', value: `<#${channel.id}>`, inline: false },
          { 
            name: '📋 Log Types Enabled', 
            value: '`command` `error` `welcome` `leave`\n`economy` `bounty` `mining` `gambling` `admin`', 
            inline: false 
          }
        )
        .setFooter({ text: 'Logs help you monitor bot activity in your server' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'view') {
      const config = getLogConfig(interaction.guild.id);

      if (!config) {
        await interaction.reply({
          content: '❌ Log system is not configured yet! Use `/setlogs set` to set it up.',
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(config.enabled ? '#57F287' : '#808080')
        .setTitle('🛡️ Log System Configuration')
        .addFields(
          { name: '📊 Status', value: config.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: '📢 Channel', value: `<#${config.channelId}>`, inline: true },
          { 
            name: '📋 Tracked Events', 
            value: 
              '✅ **Commands** - All slash commands executed\n' +
              '✅ **Errors** - Command errors and failures\n' +
              '✅ **Welcome** - New member joins\n' +
              '✅ **Leave** - Members leaving server\n' +
              '✅ **Economy** - Currency transactions\n' +
              '✅ **Bounty** - Bounty placements and claims\n' +
              '✅ **Mining** - Gold mining activities\n' +
              '✅ **Gambling** - Dice, poker games\n' +
              '✅ **Admin** - Administrative actions',
            inline: false 
          }
        )
        .setFooter({ text: 'Use /setlogs disable to turn off logging' });

      if (config.updatedAt) {
        embed.setTimestamp(config.updatedAt);
      }

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    } else if (subcommand === 'disable') {
      const config = getLogConfig(interaction.guild.id);

      if (!config) {
        await interaction.reply({
          content: '❌ Log system is not configured!',
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      removeLogConfig(interaction.guild.id);

      const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('❌ Log System Disabled')
        .setDescription('Logs will no longer be sent to any channel.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};
