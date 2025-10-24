import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getActiveSessions, getUnclaimedSessions, getMiningStats, formatTime } from '../../utils/miningTracker';
import { getGoldBarEmoji } from '../../utils/customEmojis';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mining-sessions')
    .setDescription('📊 View all active mining sessions'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const activeSessions = getActiveSessions();
    const unclaimedSessions = getUnclaimedSessions();
    const stats = getMiningStats();
    const goldEmoji = getGoldBarEmoji();
    const now = Date.now();

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('⛏️ MINING SESSIONS TRACKER')
      .setDescription('Current mining operations across the server')
      .addFields(
        {
          name: '📊 Overview',
          value: `\`\`\`yaml
Active Sessions: ${stats.totalActive}
Solo Mining: ${stats.soloMining}
Cooperative: ${stats.coopMining}
Ready to Claim: ${stats.unclaimed}
Pending Gold: ${stats.totalGoldPending} ${goldEmoji}
\`\`\``,
          inline: false
        }
      );

    // Show active mining sessions
    if (activeSessions.length > 0) {
      const activeList = activeSessions
        .slice(0, 10) // Limit to 10 for embed size
        .map(({ userId, session }) => {
          const timeLeft = session.endTime - now;
          const progress = Math.floor(((now - session.startTime) / (session.endTime - session.startTime)) * 10);
          const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);
          return `<@${userId}>\n${progressBar} \`${formatTime(timeLeft)}\` • ${session.type === 'solo' ? '⛏️ Solo' : '👥 Coop'} • ${session.goldAmount} ${goldEmoji}`;
        })
        .join('\n\n');

      embed.addFields({
        name: '⏳ Active Mining',
        value: activeList + (activeSessions.length > 10 ? `\n\n_+${activeSessions.length - 10} more..._` : ''),
        inline: false
      });
    }

    // Show unclaimed sessions
    if (unclaimedSessions.length > 0) {
      const unclaimedList = unclaimedSessions
        .slice(0, 5)
        .map(({ userId, session }) => {
          return `<@${userId}> • ${session.type === 'solo' ? '⛏️' : '👥'} • ${session.goldAmount} ${goldEmoji}`;
        })
        .join('\n');

      embed.addFields({
        name: '✅ Ready to Claim',
        value: unclaimedList + (unclaimedSessions.length > 5 ? `\n_+${unclaimedSessions.length - 5} more..._` : ''),
        inline: false
      });
    }

    if (activeSessions.length === 0 && unclaimedSessions.length === 0) {
      embed.addFields({
        name: '💤 No Active Sessions',
        value: 'No one is currently mining. Use `/mine` to start!',
        inline: false
      });
    }

    embed.setFooter({ text: '⛏️ Use /mine to start your own mining operation!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
