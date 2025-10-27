/**
 * AutoMod Setup Command
 * Creates AutoMod rules in the server to help earn the AutoMod badge
 */

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  EmbedBuilder,
  Colors
} from 'discord.js';
import { AutoModManager } from '../../utils/autoModManager.js';

export default {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('🛡️ Manage AutoMod rules (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Create default AutoMod rules in this server')
        .addChannelOption(option =>
          option
            .setName('log-channel')
            .setDescription('Channel for AutoMod alerts (optional)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check AutoMod badge progress')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Remove all AutoMod rules from this server')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      await handleSetup(interaction);
    } else if (subcommand === 'status') {
      await handleStatus(interaction);
    } else if (subcommand === 'clear') {
      await handleClear(interaction);
    }
  }
};

async function handleSetup(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const guild = interaction.guild!;
    const logChannel = interaction.options.getChannel('log-channel');

    // Create default rules
    const rules = await AutoModManager.setupDefaultRules(
      guild, 
      logChannel?.id
    );

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setTitle('🛡️ AutoMod Rules Created!')
      .setDescription(`Successfully created ${rules.length} AutoMod rules in **${guild.name}**`)
      .addFields(
        rules.map(rule => ({
          name: rule.name,
          value: `✅ Active`,
          inline: true
        }))
      )
      .setFooter({ text: 'These rules help protect your server and earn the AutoMod badge!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('❌ Setup Failed')
      .setDescription(error.message || 'Failed to create AutoMod rules')
      .setFooter({ text: 'Make sure the bot has "Manage Server" permission' });

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

async function handleStatus(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const guilds = Array.from(interaction.client.guilds.cache.values());
    const info = await AutoModManager.getDetailedRulesInfo(guilds);

    const progressBar = createProgressBar(info.badgeProgress);
    const badgeStatus = info.totalRules >= 100 
      ? '✅ **Badge Earned!** (may take 12-24h to appear)' 
      : `📊 **Progress:** ${info.totalRules}/100 rules`;

    const embed = new EmbedBuilder()
      .setColor(info.totalRules >= 100 ? Colors.Gold : Colors.Blue)
      .setTitle('🛡️ AutoMod Badge Progress')
      .setDescription(badgeStatus)
      .addFields(
        { name: '📈 Total Rules', value: `${info.totalRules}`, inline: true },
        { name: '🏛️ Servers with Rules', value: `${info.guildsWithRules}/${guilds.length}`, inline: true },
        { name: '🎯 Badge Progress', value: `${info.badgeProgress.toFixed(1)}%`, inline: true },
        { name: '\u200B', value: progressBar, inline: false }
      )
      .setFooter({ text: 'Use /automod setup to create rules in more servers' })
      .setTimestamp();

    // Add top servers info
    if (info.rulesPerGuild.size > 0) {
      const topServers = Array.from(info.rulesPerGuild.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `• **${name}**: ${count} rules`)
        .join('\n');

      embed.addFields({ 
        name: '🏆 Top Servers', 
        value: topServers || 'No servers with rules yet',
        inline: false 
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('❌ Status Check Failed')
      .setDescription(error.message || 'Failed to fetch AutoMod status');

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

async function handleClear(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const guild = interaction.guild!;
    const deletedCount = await AutoModManager.clearGuildRules(guild);

    const embed = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setTitle('🗑️ AutoMod Rules Cleared')
      .setDescription(`Removed ${deletedCount} AutoMod rules from **${guild.name}**`)
      .setFooter({ text: 'Use /automod setup to create new rules' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error: any) {
    const errorEmbed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle('❌ Clear Failed')
      .setDescription(error.message || 'Failed to clear AutoMod rules');

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

function createProgressBar(percentage: number): string {
  const filledBars = Math.floor(percentage / 5);
  const emptyBars = 20 - filledBars;
  const filled = '█'.repeat(filledBars);
  const empty = '░'.repeat(emptyBars);
  return `[${filled}${empty}] ${percentage.toFixed(1)}%`;
}
