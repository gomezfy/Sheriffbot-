/**
 * AutoMod All Servers Command (Owner Only)
 * Creates AutoMod rules in ALL servers at once to quickly earn the badge
 */

import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  EmbedBuilder,
  Colors
} from 'discord.js';
import { AutoModManager } from '../../utils/autoModManager.js';
import { isOwner } from '../../utils/security.js';

export default {
  data: new SlashCommandBuilder()
    .setName('automodall')
    .setDescription('🛡️ Setup AutoMod in ALL servers (Owner only)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Create AutoMod rules in all servers at once')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Remove AutoMod rules from all servers')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Owner-only check
    if (!await isOwner(interaction)) {
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      await handleSetupAll(interaction);
    } else if (subcommand === 'clear') {
      await handleClearAll(interaction);
    }
  }
};

async function handleSetupAll(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guilds = Array.from(interaction.client.guilds.cache.values());
  let successCount = 0;
  let failCount = 0;
  let totalRulesCreated = 0;
  const results: string[] = [];

  const progressEmbed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle('🛡️ Setting up AutoMod...')
    .setDescription(`Processing ${guilds.length} servers...`)
    .setTimestamp();

  await interaction.editReply({ embeds: [progressEmbed] });

  for (const guild of guilds) {
    try {
      const rules = await AutoModManager.setupDefaultRules(guild);
      successCount++;
      totalRulesCreated += rules.length;
      results.push(`✅ **${guild.name}**: ${rules.length} rules created`);
    } catch (error: any) {
      failCount++;
      const errorMsg = error.message?.includes('permission') 
        ? 'Missing permissions' 
        : 'Failed';
      results.push(`❌ **${guild.name}**: ${errorMsg}`);
    }
  }

  // Get final status
  const finalInfo = await AutoModManager.getDetailedRulesInfo(guilds);
  const badgeStatus = finalInfo.totalRules >= 100 
    ? '🎉 **BADGE EARNED!** Wait 12-24h for it to appear on the bot profile' 
    : `Need ${100 - finalInfo.totalRules} more rules for the badge`;

  const resultEmbed = new EmbedBuilder()
    .setColor(finalInfo.totalRules >= 100 ? Colors.Gold : Colors.Green)
    .setTitle('🛡️ AutoMod Setup Complete!')
    .setDescription(badgeStatus)
    .addFields(
      { name: '📊 Summary', value: `✅ Success: ${successCount}\n❌ Failed: ${failCount}\n📈 Total Rules: ${finalInfo.totalRules}`, inline: false },
      { name: '📝 Details', value: results.slice(0, 10).join('\n') + (results.length > 10 ? `\n*...and ${results.length - 10} more*` : ''), inline: false }
    )
    .setFooter({ text: `Created ${totalRulesCreated} new rules across ${successCount} servers` })
    .setTimestamp();

  await interaction.editReply({ embeds: [resultEmbed] });
}

async function handleClearAll(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guilds = Array.from(interaction.client.guilds.cache.values());
  let totalDeleted = 0;
  let processedCount = 0;

  const progressEmbed = new EmbedBuilder()
    .setColor(Colors.Orange)
    .setTitle('🗑️ Clearing AutoMod rules...')
    .setDescription(`Processing ${guilds.length} servers...`)
    .setTimestamp();

  await interaction.editReply({ embeds: [progressEmbed] });

  for (const guild of guilds) {
    try {
      const deleted = await AutoModManager.clearGuildRules(guild);
      totalDeleted += deleted;
      processedCount++;
    } catch (error) {
      console.error(`Failed to clear rules in ${guild.name}:`, error);
    }
  }

  const resultEmbed = new EmbedBuilder()
    .setColor(Colors.Orange)
    .setTitle('🗑️ AutoMod Rules Cleared!')
    .setDescription(`Removed ${totalDeleted} rules from ${processedCount} servers`)
    .setFooter({ text: 'Use /automodall setup to create new rules' })
    .setTimestamp();

  await interaction.editReply({ embeds: [resultEmbed] });
}
