const { Events, EmbedBuilder } = require('discord.js');
const { getWelcomeConfig } = require('../utils/dataManager');
const { buildWelcomeEmbed } = require('../utils/welcomeEmbedBuilder');
const { loadGuildConfig } = require('../utils/configManager');
const Logger = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      // Try dashboard config first, fallback to old config
      const dashboardConfig = loadGuildConfig(member.guild.id);
      const oldConfig = getWelcomeConfig(member.guild.id);
      
      // Determine which config to use
      let config = null;
      let useDashboard = false;
      
      if (dashboardConfig.welcomeEnabled && dashboardConfig.welcomeChannel) {
        config = {
          enabled: dashboardConfig.welcomeEnabled,
          channelId: dashboardConfig.welcomeChannel,
          message: dashboardConfig.welcomeMessage || 'Welcome {user} to {server}! 🤠'
        };
        useDashboard = true;
      } else {
        config = oldConfig;
      }

      if (!config || !config.enabled) {
        return;
      }

      const channel = member.guild.channels.cache.get(config.channelId);
      if (!channel) {
        console.error(`Welcome channel ${config.channelId} not found in guild ${member.guild.name}`);
        return;
      }

      let messagePayload;
      
      // If using dashboard config, create a simple message
      if (useDashboard) {
        const message = config.message
          .replace(/{user}/g, `<@${member.user.id}>`)
          .replace(/{server}/g, member.guild.name);
        
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🤠 Welcome to the Wild West!')
          .setDescription(message)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Member #${member.guild.memberCount}` })
          .setTimestamp();
        
        messagePayload = { embeds: [embed] };
      } else {
        messagePayload = buildWelcomeEmbed(config, member);
      }

      await channel.send(messagePayload);
      console.log(`✅ Welcome message sent for ${member.user.tag} in ${member.guild.name}`);
      
      // Log welcome message
      Logger.log(member.client, member.guild.id, 'welcome', {
        member: member.user,
        channelId: config.channelId,
        memberCount: member.guild.memberCount
      });

    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  },
};
