const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot online as ${client.user.tag}`);
    console.log(`📊 Servers: ${client.guilds.cache.size}`);
    console.log(`👥 Users: ${client.users.cache.size}`);
    
    client.user.setPresence({
      activities: [{ 
        name: 'Keeping peace in the Wild West', 
        type: ActivityType.Watching 
      }],
      status: 'online',
    });
    
    console.log('🚀 Bot ready for use!');
  },
};
