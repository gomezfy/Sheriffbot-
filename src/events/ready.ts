import { Events, Client, ActivityType } from 'discord.js';

export = {
  name: Events.ClientReady,
  once: true,
  execute(client: Client): void {
    console.log(`✅ Bot online as ${client.user?.tag}`);
    console.log(`📊 Servers: ${client.guilds.cache.size}`);
    console.log(`👥 Users: ${client.users.cache.size}`);
    
    const statusActivities = [
      { name: 'Keeping peace in the Wild West 🤠', type: ActivityType.Watching },
      { name: 'Hunting outlaws in the desert 🏜️', type: ActivityType.Playing },
      { name: 'Patrolling the saloon 🍺', type: ActivityType.Watching },
      { name: 'Counting bounties 💰', type: ActivityType.Playing },
      { name: 'Sheriff duties | /help', type: ActivityType.Playing },
      { name: `${client.guilds.cache.size} Wild West towns`, type: ActivityType.Watching },
      { name: 'Gold miners ⛏️', type: ActivityType.Watching },
      { name: 'Poker at the saloon 🃏', type: ActivityType.Playing },
      { name: 'Wanted posters 📜', type: ActivityType.Watching },
      { name: 'Duels at high noon ⚔️', type: ActivityType.Competing }
    ];
    
    let currentIndex = 0;
    
    const updateStatus = () => {
      const activity = statusActivities[currentIndex];
      client.user?.setPresence({
        activities: [activity],
        status: 'online',
      });
      currentIndex = (currentIndex + 1) % statusActivities.length;
    };
    
    updateStatus();
    setInterval(updateStatus, 60000);
    
    console.log('🚀 Bot ready for use!');
    console.log('🔄 Status rotation active - changes every 60 seconds');
  },
};
