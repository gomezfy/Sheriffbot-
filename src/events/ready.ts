import { Events, Client, ActivityType } from 'discord.js';

export = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client): void {
    console.log(`✅ Bot online as ${client.user?.tag}`);
    console.log(`📊 Servers: ${client.guilds.cache.size}`);
    console.log(`👥 Users: ${client.users.cache.size}`);
    
    client.user?.setPresence({
      activities: [{ 
        name: 'Keeping peace in the Wild West', 
        type: ActivityType.Watching 
      }],
      status: 'online',
    });
    
    console.log('🚀 Bot ready for use!');
  },
};
