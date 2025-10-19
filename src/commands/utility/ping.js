const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../utils/i18n');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  async execute(interaction) {
    const reply = await interaction.reply({ 
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
