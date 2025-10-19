import { Events, EmbedBuilder, GuildMember } from 'discord.js';
import { getWelcomeConfig } from '../utils/dataManager';
import { buildWelcomeEmbed } from '../utils/welcomeEmbedBuilder';
import { loadGuildConfig } from '../utils/configManager';
import Logger from '../utils/logger';

export = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember): Promise<void> {
    try {
      const dashboardConfig = loadGuildConfig(member.guild.id);
      const oldConfig = getWelcomeConfig(member.guild.id);
      
      let config: any = null;
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

      let messagePayload: any;
      
      if (useDashboard) {
        const message = config.message
          .replace(/{user}/g, `<@${member.user.id}>`)
          .replace(/{server}/g, member.guild.name);
        
        const embed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🤠 Welcome to the Wild West!')
          .setDescription(message)
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: `Member #${member.guild.memberCount}` })
          .setTimestamp();
        
        messagePayload = { embeds: [embed] };
      } else {
        messagePayload = buildWelcomeEmbed(config, member);
      }

      if (channel.isTextBased()) {
        await channel.send(messagePayload);
      }
      console.log(`✅ Welcome message sent for ${member.user.tag} in ${member.guild.name}`);
      
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
