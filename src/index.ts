import 'dotenv/config';
import { Client, Partials, Collection, Events, MessageFlags } from 'discord.js';
import fs from 'fs';
import path from 'path';
import Logger from './utils/logger';
import { sanitizeErrorForLogging, validateEnvironment, getSafeEnvironmentInfo } from './utils/security';
import { 
  PRODUCTION_CACHE_CONFIG,
  LOW_MEMORY_CACHE_CONFIG,
  PRODUCTION_SWEEPERS, 
  PRODUCTION_INTENTS,
  performanceMonitor,
  measureCommandTime,
  setupGracefulShutdown,
  setupMemoryOptimization,
  setupPerformanceMonitoring,
  healthCheck
} from './utils/performance';
import { startAutomaticTerritoryIncome } from './utils/territoryIncome';
import { startMiningNotifications } from './utils/miningTracker';

// Validate environment variables before starting
console.log('🔐 Validating environment variables...');
try {
  validateEnvironment();
  console.log('📊 Environment info:', getSafeEnvironmentInfo());
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

const { initializeDatabase } = require('./utils/database');
const { isPunished, getRemainingTime, formatTime } = require('./utils/punishmentManager');
console.log('🔄 Inicializando sistema de dados...');
initializeDatabase();

interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

// Detect low memory environment
const isLowMemory = process.env.LOW_MEMORY === 'true' || 
                    (process.env.MEMORY_LIMIT && parseInt(process.env.MEMORY_LIMIT) < 100);

console.log(`🎯 Memory mode: ${isLowMemory ? 'LOW MEMORY' : 'PRODUCTION'}`);

// Production-optimized client configuration
const client = new Client({
  // Optimized intents - only what's needed
  intents: PRODUCTION_INTENTS,
  
  // Minimal partials for better performance
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
  ],
  
  // Advanced cache configuration - auto-detect based on memory
  makeCache: isLowMemory ? LOW_MEMORY_CACHE_CONFIG : PRODUCTION_CACHE_CONFIG,
  
  // Aggressive sweepers for memory management
  sweepers: PRODUCTION_SWEEPERS,
  
  // Connection settings for stability
  rest: {
    timeout: 15000,
    retries: 3,
  },
  
  // Presence configuration
  presence: {
    status: 'online',
    activities: [{
      name: '🤠 Sheriff Rex | /help',
      type: 0 // Playing
    }]
  },
  
  // Fail if cache is full (prevents memory leaks)
  failIfNotExists: false,
  
  // Allow mentions
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true
  }
}) as ExtendedClient;

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandsPath).filter(item => {
  const itemPath = path.join(commandsPath, item);
  return fs.statSync(itemPath).isDirectory();
});

let commandCount = 0;
for (const category of commandCategories) {
  const categoryPath = path.join(commandsPath, category);
  const commandFiles = fs.readdirSync(categoryPath).filter(file => 
    (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
  );
  
  for (const file of commandFiles) {
    const filePath = path.join(categoryPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commandCount++;
    }
  }
}
console.log(`[COMMANDS] Loaded ${commandCount} commands`);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => 
  (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts')
);

let eventCount = 0;
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args: any[]) => event.execute(...args));
  } else {
    client.on(event.name, (...args: any[]) => event.execute(...args));
  }
  eventCount++;
}
console.log(`[EVENTS] Loaded ${eventCount} events`);

const commandCooldowns = new Map<string, Map<string, number>>();
const GLOBAL_COOLDOWN = 1000;

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Command ${interaction.commandName} not found.`);
    return;
  }
  
  // Prevent double execution
  if ((interaction as any)._handled) {
    console.log(`Interaction already handled for ${interaction.commandName}`);
    return;
  }
  (interaction as any)._handled = true;

  // Performance monitoring - start timer
  const commandStartTime = Date.now();
  const cooldownKey = `${interaction.user.id}:${interaction.commandName}`;
  const now = Date.now();
  
  if (!commandCooldowns.has(interaction.commandName)) {
    commandCooldowns.set(interaction.commandName, new Map());
  }
  
  const timestamps = commandCooldowns.get(interaction.commandName)!;
  const cooldownAmount = (command.cooldown || 0) * 1000 || GLOBAL_COOLDOWN;
  
  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;
    
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return interaction.reply({
        content: `⏰ Please wait ${timeLeft.toFixed(1)}s before using \`/${interaction.commandName}\` again.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
  
  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  const allowedWhenPunished = ['help', 'ping', 'inventory', 'profile', 'avatar', 'bounties'];
  if (!allowedWhenPunished.includes(interaction.commandName)) {
    const punishment = isPunished(interaction.user.id);
    
    if (punishment) {
      const remaining = getRemainingTime(interaction.user.id);
      return interaction.reply({
        content: `🔒 **You're in jail!**\n\n${punishment.reason}\n\n⏰ Time remaining: **${formatTime(remaining)}**\n\nYou cannot use this command while serving your sentence!\n\n✅ Allowed: /help, /ping, /inventory, /profile, /bounties`,
        flags: MessageFlags.Ephemeral
      });
    }
  }

  try {
    await command.execute(interaction);
    
    // Performance monitoring - measure command time
    measureCommandTime(interaction.commandName, commandStartTime);
    
    if (interaction.guild) {
      const options = interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join(', ');
      Logger.log(client, interaction.guild.id, 'command', {
        user: interaction.user,
        command: interaction.commandName,
        channelId: interaction.channel?.id || 'DM',
        options: options || 'None'
      });
    }
    
  } catch (error: any) {
    console.error(`Error executing ${interaction.commandName}:`);
    console.error(error);
    
    // Security: Sanitize error before logging to prevent information leakage
    if (interaction.guild) {
      Logger.log(client, interaction.guild.id, 'error', {
        command: interaction.commandName,
        user: interaction.user,
        error: sanitizeErrorForLogging(error)
      });
    }
    
    // Try to respond to the user about the error
    try {
      const errorContent = 'There was an error executing this command!';
      
      if (interaction.replied) {
        // Already replied, can't do anything
        console.log(`Cannot send error message - interaction already replied`);
      } else if (interaction.deferred) {
        // Deferred, use editReply
        await interaction.editReply({ content: errorContent });
      } else {
        // Not replied or deferred, use reply
        await interaction.reply({ content: errorContent, flags: MessageFlags.Ephemeral });
      }
    } catch (replyError: any) {
      console.error('Failed to send error message to user:', replyError.message);
    }
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

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
          text: 'Sheriff Bot - Western Discord Bot'
        }
      }]
    });
  }
});

process.on('unhandledRejection', (error: Error) => {
  console.error('❌ [UNHANDLED ERROR]:', error);
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ [UNCAUGHT EXCEPTION]:', error);
});

client.on('error', (error: Error) => {
  console.error('❌ [CLIENT ERROR]:', error);
});

client.on('warn', (info: string) => {
  console.warn('⚠️  [WARNING]:', info);
});

client.on('shardError', (error: Error) => {
  console.error('❌ [SHARD ERROR]:', error);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ ERROR: Discord token not found!');
  console.error('📝 Configure the DISCORD_TOKEN environment variable');
  process.exit(1);
}

console.log('🔐 Token found, attempting login...');

// Setup production optimizations
console.log('⚡ Setting up production optimizations...');
setupGracefulShutdown(client);
setupMemoryOptimization();
setupPerformanceMonitoring(client);

// Health check endpoint (if running with web server)
if (process.env.ENABLE_HEALTH_CHECK === 'true') {
  const express = require('express');
  const app = express();
  
  app.get('/health', (req: any, res: any) => {
    const status = healthCheck.getStatus();
    const metrics = performanceMonitor.getMetrics();
    
    res.json({
      status: status.healthy ? 'healthy' : 'unhealthy',
      uptime: performanceMonitor.getUptime(),
      memory: performanceMonitor.getMemoryUsage(),
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      metrics: metrics,
      errors: status.errors
    });
  });
  
  const healthPort = process.env.HEALTH_PORT || 3001;
  app.listen(healthPort, () => {
    console.log(`🏥 Health check endpoint: http://localhost:${healthPort}/health`);
  });
}

client.login(token)
  .then(() => {
    console.log('✅ Login successful!');
    console.log('🤠 Sheriff Bot is ready!\n');
    console.log('⚡ Production optimizations active');
    console.log(`📊 Monitoring ${client.guilds.cache.size} guilds`);
    
    // Start automatic territory income system
    startAutomaticTerritoryIncome(client);
    
    // Start automatic mining notification system
    startMiningNotifications(client);
    
    healthCheck.markHealthy();
  })
  .catch((error: Error) => {
    console.error('❌ LOGIN ERROR:');
    console.error('Details:', error.message);
    healthCheck.markUnhealthy(`Login failed: ${error.message}`);
    
    if (error.message.includes('token')) {
      console.error('');
      console.error('💡 SOLUTION:');
      console.error('1. Verify the token is correct');
      console.error('2. Generate a new token at: https://discord.com/developers/applications');
      console.error('3. Configure DISCORD_TOKEN environment variable');
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
