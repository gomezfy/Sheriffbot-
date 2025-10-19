const { Events } = require('discord.js');
const Logger = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    try {
      const roles = member.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => role.name)
        .slice(0, 10);

      Logger.log(member.client, member.guild.id, 'leave', {
        member: member.user,
        memberCount: member.guild.memberCount,
        joinedAt: member.joinedTimestamp,
        roles: roles.length > 0 ? roles : null
      });

      console.log(`👋 Member left: ${member.user.tag} from ${member.guild.name}`);

    } catch (error) {
      console.error('Error logging member leave:', error);
    }
  },
};
