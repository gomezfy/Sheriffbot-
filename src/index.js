require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Logger = require('./utils/logger');
// ===== INICIALIZAR SISTEMA DE DADOS =====
// Isso evita erros de "ENOENT: no such file or directory"
const { initializeDatabase } = require('./utils/database');

console.log('🔄 Inicializando sistema de dados...');
try {
  initializeDatabase();
} catch (error) {
  console.error('❌ Erro ao inicializar dados:', error.message);
  console.error('⚠️  O bot continuará, mas pode ter problemas com comandos que usam dados');
}
// ========================================


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load commands from category folders
const commandsPath = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandsPath).filter(item => {
  const itemPath = path.join(commandsPath, item);
  return fs.statSync(itemPath).isDirectory();
});

for (const category of commandCategories) {
  const categoryPath = path.join(commandsPath, category);
  const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[COMMAND] Loaded: ${command.data.name} (${category})`);
    }
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`[EVENT] Loaded: ${event.name}`);
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Command ${interaction.commandName} not found.`);
    return;
  }

  // Check if user is punished (in jail) - EXCEPT for help, ping, inventory commands
  const allowedWhenPunished = ['help', 'ping', 'inventory', 'profile', 'avatar', 'bounties'];
  if (!allowedWhenPunished.includes(interaction.commandName)) {
    const { isPunished, getRemainingTime, formatTime } = require('./utils/punishmentManager');
    const punishment = isPunished(interaction.user.id);
    
    if (punishment) {
      const remaining = getRemainingTime(interaction.user.id);
      return interaction.reply({
        content: `🔒 **You're in jail!**\n\n${punishment.reason}\n\n⏰ Time remaining: **${formatTime(remaining)}**\n\nYou cannot use this command while serving your sentence!\n\n✅ Allowed: /help, /ping, /inventory, /profile, /bounties`,
        ephemeral: true
      });
    }
  }

  try {
    await command.execute(interaction);
    
    // Log command execution
    const options = interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join(', ');
    Logger.log(client, interaction.guild.id, 'command', {
      user: interaction.user,
      command: interaction.commandName,
      channelId: interaction.channel.id,
      options: options || 'None'
    });
    
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`);
    console.error(error);
    
    // Log error
    Logger.log(client, interaction.guild.id, 'error', {
      command: interaction.commandName,
      user: interaction.user,
      error: error.stack || error.message || String(error)
    });
    
    const errorMessage = { content: 'There was an error executing this command!', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commandName === 'ping') {
    const latency = Date.now() - message.createdTimestamp;
    await message.reply(`🏓 Pong! Latency: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }

  if (commandName === 'ajuda' || commandName === 'help') {
    await message.reply({
      embeds: [{
        title: '📋 Available Commands',
        description: 'Here are the commands you can use:',
        color: 0x5865F2,
        fields: [
          {
            name: '!ping',
            value: 'Check the bot\'s latency'
          },
          {
            name: '!ajuda',
            value: 'Shows this message'
          },
          {
            name: '/ping',
            value: 'Check latency (slash command)'
          },
          {
            name: '/avatar',
            value: 'Shows a user\'s avatar'
          },
          {
            name: '/servidor',
            value: 'Server information'
          }
        ],
        footer: {
          text: 'Sheriff Bot - Ready for Discloud'
        }
      }]
    });
  }
});

process.on('unhandledRejection', error => {
  console.error('❌ [UNHANDLED ERROR]:', error);
});

process.on('uncaughtException', error => {
  console.error('❌ [UNCAUGHT EXCEPTION]:', error);
});

client.on('error', error => {
  console.error('❌ [CLIENT ERROR]:', error);
});

client.on('warn', info => {
  console.warn('⚠️  [WARNING]:', info);
});

client.on('shardError', error => {
  console.error('❌ [SHARD ERROR]:', error);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ ERROR: Discord token not found!');
  console.error('📝 DISCLOUD: Configure the DISCORD_TOKEN variable via:');
  console.error('   .discloud config set DISCORD_TOKEN your_token_here');
  console.error('   or via the web panel at https://discloud.app');
  process.exit(1);
}

console.log('🔐 Token found, attempting login...');

client.login(token)
  .then(() => {
    console.log('✅ Login successful!');
    
    console.log('\n🌐 Starting website server...');
    require('../website/server');
    console.log('✅ Website started successfully!');
    console.log('📍 Bot + Website running together on Discloud!\n');
  })
  .catch(error => {
    console.error('❌ LOGIN ERROR:');
    console.error('Details:', error.message);
    
    if (error.message.includes('token')) {
      console.error('');
      console.error('💡 SOLUTION:');
      console.error('1. Verify the token is correct');
      console.error('2. Generate a new token at: https://discord.com/developers/applications');
      console.error('3. Configure on Discloud: .discloud config set DISCORD_TOKEN new_token');
    }
    
    if (error.message.includes('intents')) {
      console.error('');
      console.error('💡 SOLUTION:');
      console.error('1. Access: https://discord.com/developers/applications');
      console.error('2. Go to Bot > Privileged Gateway Intents');
      console.error('3. Enable all options (Presence, Server Members, Message Content)');
    }
    
    process.exit(1);
  });
