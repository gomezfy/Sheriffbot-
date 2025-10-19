const { addBounty, getBountyByTarget, getWantedConfig, getLogConfig } = require('./dataManager');
const { generateWantedPoster } = require('./wantedPoster');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { loadGuildConfig } = require('./configManager');

/**
 * Automatically create a wanted bounty on a user who escaped from the Sheriff
 * @param {Client} client - Discord client
 * @param {string} guildId - Guild ID where the robbery happened
 * @param {User} escapee - User who escaped
 * @param {number} stolenAmount - Amount stolen during the robbery
 * @returns {Promise<object>} - Bounty details
 */
async function createAutoWanted(client, guildId, escapee, stolenAmount) {
  try {
    // Calculate intelligent bounty value based on stolen amount
    // Formula: 50-70% of stolen amount, minimum 500, maximum 5000
    const percentage = 0.5 + Math.random() * 0.2; // 50-70%
    let bountyAmount = Math.floor(stolenAmount * percentage);
    bountyAmount = Math.max(500, Math.min(5000, bountyAmount)); // Clamp between 500-5000
    
    // Sheriff is the poster (bot itself or "Sheriff")
    const sheriffId = client.user.id;
    const sheriffTag = '🚨 Sheriff';
    
    // Add bounty to system
    addBounty(escapee.id, escapee.tag, sheriffId, sheriffTag, bountyAmount);
    
    // Get updated bounty (in case there was already one)
    const bounty = getBountyByTarget(escapee.id);
    
    // Generate wanted poster
    const posterBuffer = await generateWantedPoster(escapee, bounty.totalAmount);
    const attachment = new AttachmentBuilder(posterBuffer, { name: 'wanted.png' });
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🚨 WANTED - BANK ROBBERY ESCAPEE!')
      .setDescription(`**${escapee.tag}** escaped from the Sheriff during a bank robbery!\n\nThe law is offering a reward for their capture!`)
      .addFields(
        { name: '🎯 Fugitive', value: escapee.tag, inline: true },
        { name: '💰 Bounty', value: `🪙 ${bounty.totalAmount.toLocaleString()} Silver Coins`, inline: true },
        { name: '⚖️ Crime', value: 'Bank Robbery', inline: true }
      )
      .setImage('attachment://wanted.png')
      .setFooter({ text: 'Use /claim to capture this fugitive!' })
      .setTimestamp();
    
    // Try to post in wanted/logs channel
    // Priority: 1. Dashboard wanted channel, 2. Legacy wanted channel, 3. Dashboard logs, 4. Legacy logs
    try {
      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        let channelId = null;
        
        // 1. Try dashboard wanted channel first
        const dashboardConfig = loadGuildConfig(guildId);
        if (dashboardConfig.wantedEnabled && dashboardConfig.wantedChannel) {
          channelId = dashboardConfig.wantedChannel;
        }
        
        // 2. Try legacy wanted channel
        if (!channelId) {
          const wantedConfig = getWantedConfig(guildId);
          if (wantedConfig && wantedConfig.enabled && wantedConfig.channelId) {
            channelId = wantedConfig.channelId;
          }
        }
        
        // 3. Fallback to dashboard logs config
        if (!channelId) {
          if (dashboardConfig.logsEnabled && dashboardConfig.logsChannel) {
            channelId = dashboardConfig.logsChannel;
          }
        }
        
        // 4. Fallback to legacy logs config
        if (!channelId) {
          const oldConfig = getLogConfig(guildId);
          if (oldConfig && oldConfig.enabled && oldConfig.channelId) {
            channelId = oldConfig.channelId;
          }
        }
        
        // Post to channel if found
        if (channelId) {
          const channel = guild.channels.cache.get(channelId);
          if (channel) {
            await channel.send({ embeds: [embed], files: [attachment] });
          }
        }
      }
    } catch (error) {
      console.error('Error posting wanted poster to channel:', error);
    }
    
    return {
      success: true,
      bounty: bounty,
      amount: bountyAmount,
      poster: attachment,
      embed: embed
    };
    
  } catch (error) {
    console.error('Error creating auto wanted:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createAutoWanted
};
