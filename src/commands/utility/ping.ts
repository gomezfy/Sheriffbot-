import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { t } from '../../utils/i18n';

export = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ 
      content: '🏓 Calculating...'
    });
    
    const sent = await interaction.fetchReply();
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    await interaction.editReply(
      `${t(interaction, 'ping_pong')}\n📡 ${t(interaction, 'ping_latency')}: ${latency}ms\n💓 API: ${apiLatency}ms`
    );
  },
};
