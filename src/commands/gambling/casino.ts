import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, MessageFlags, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import axios from 'axios';

const SERVER_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : 'http://localhost:5000';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('casino')
    .setDescription('Play the casino slot machine in an interactive web interface!')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]), // Guild Install, User Install

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;

    try {
      // Create a casino session
      const response = await axios.post(`${SERVER_URL}/api/casino/create-session`, {
        userId
      });

      if (!response.data.success) {
        await interaction.reply({
          content: '❌ Failed to create casino session. Please try again later.',
          flags: [MessageFlags.Ephemeral]
        });
        return;
      }

      const sessionId = response.data.sessionId;
      const gameUrl = `${SERVER_URL}/casino/game.html?userId=${userId}&session=${sessionId}`;

      // Create button with link to game
      const playButton = new ButtonBuilder()
        .setLabel('🎰 Play Casino')
        .setStyle(ButtonStyle.Link)
        .setURL(gameUrl);

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(playButton);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎰 SHERIFF REX CASINO 🎰')
        .setDescription(
          '**Welcome to the Saloon Casino, partner!** 🤠\n\n' +
          '🎮 Click the button below to open the interactive slot machine!\n\n' +
          '**Features:**\n' +
          '🎲 Smooth animations and effects\n' +
          '💰 Real-time balance updates\n' +
          '📊 Live statistics tracking\n' +
          '🏆 Instant results\n' +
          '💎 Up to x50 jackpot multiplier!\n\n' +
          '⏰ Session expires in 30 minutes\n' +
          '💵 Minimum bet: 10 Saloon Tokens'
        )
        .setThumbnail('https://em-content.zobj.net/source/twitter/376/slot-machine_1f3b0.png')
        .setFooter({ text: 'Good luck, cowboy! 🍀' })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: [MessageFlags.Ephemeral]
      });

    } catch (error) {
      console.error('Casino command error:', error);
      await interaction.reply({
        content: '❌ An error occurred. Make sure the web server is running!',
        flags: [MessageFlags.Ephemeral]
      });
    }
  },
};
