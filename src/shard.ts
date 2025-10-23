/**
 * Sharding Manager for scaling to 10,000+ users
 * Automatically spawns multiple shards based on guild count
 */

import 'dotenv/config';
import { ShardingManager } from 'discord.js';
import path from 'path';

// Import validation from security utils (compiled version)
const { validateEnvironment, getSafeEnvironmentInfo } = require('./utils/security');

// Validate environment before starting
console.log('🔐 Validating environment variables...');
try {
  validateEnvironment();
  console.log('📊 Environment info:', getSafeEnvironmentInfo());
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

const token = process.env.DISCORD_TOKEN!;

// Calculate optimal shard count
// Discord recommends 1 shard per 1000 guilds
// For 10k+ users, we'll use auto sharding
const manager = new ShardingManager(path.join(__dirname, 'index.js'), {
  token: token,
  totalShards: 'auto', // Auto-calculate based on guild count
  respawn: true, // Auto-respawn crashed shards
  shardArgs: process.argv.slice(2),
  execArgv: [
    '--max-old-space-size=512', // 512MB per shard
    '--expose-gc' // Enable manual garbage collection
  ]
});

// Shard lifecycle events
manager.on('shardCreate', shard => {
  console.log(`🚀 Launched shard ${shard.id}`);
  
  shard.on('ready', () => {
    console.log(`✅ Shard ${shard.id} is ready`);
  });
  
  shard.on('disconnect', () => {
    console.warn(`⚠️  Shard ${shard.id} disconnected`);
  });
  
  shard.on('reconnecting', () => {
    console.log(`🔄 Shard ${shard.id} reconnecting...`);
  });
  
  shard.on('death', () => {
    console.error(`❌ Shard ${shard.id} died`);
  });
  
  shard.on('error', error => {
    console.error(`❌ Shard ${shard.id} error:`, error);
  });
});

// Spawn all shards
console.log('🚀 Starting Sheriff Bot with sharding...');
console.log('⚡ Calculating optimal shard count...');

manager.spawn({ timeout: 60000 })
  .then(shards => {
    console.log(`✅ Successfully spawned ${shards.size} shard(s)`);
    console.log('🤠 Sheriff Bot is running in production mode!');
  })
  .catch(error => {
    console.error('❌ Failed to spawn shards:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down all shards...');
  await manager.broadcastEval('process.exit(0)' as any);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down all shards...');
  await manager.broadcastEval('process.exit(0)' as any);
});

// Broadcast commands to all shards
export async function broadcastEval(script: string): Promise<any[]> {
  return manager.broadcastEval(script as any);
}

// Get total stats across all shards
export async function getTotalStats(): Promise<{
  guilds: number;
  users: number;
  channels: number;
  memory: number;
}> {
  const results = await manager.broadcastEval(`({
    guilds: this.guilds.cache.size,
    users: this.users.cache.size,
    channels: this.channels.cache.size,
    memory: process.memoryUsage().heapUsed
  })` as any);
  
  return results.reduce((acc: any, curr: any) => ({
    guilds: acc.guilds + curr.guilds,
    users: acc.users + curr.users,
    channels: acc.channels + curr.channels,
    memory: acc.memory + curr.memory
  }), { guilds: 0, users: 0, channels: 0, memory: 0 });
}
