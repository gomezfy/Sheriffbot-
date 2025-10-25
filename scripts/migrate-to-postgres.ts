import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { storage } from '../server/storage';
import { getDataPath } from '../src/utils/database';

async function migrateData() {
  console.log('🚀 Starting data migration from JSON to PostgreSQL...\n');

  const dataDir = getDataPath('data');
  
  // Migrate economy/profiles data
  console.log('📊 Migrating user profiles and economy data...');
  const economyFile = path.join(dataDir, 'economy.json');
  if (fs.existsSync(economyFile)) {
    const economyData = JSON.parse(fs.readFileSync(economyFile, 'utf8'));
    let userCount = 0;
    
    for (const [userId, userData] of Object.entries(economyData as any)) {
      try {
        const user: any = userData;
        await storage.createUser({
          userId,
          username: user.username || 'Unknown',
          gold: user.gold || 0,
          silver: user.silver || 0,
          tokens: user.tokens || 0,
          level: user.level || 1,
          xp: user.xp || 0,
          backpackSlots: user.backpackSlots || 5,
          dailyStreak: user.dailyStreak || 0,
          lastDaily: user.lastDaily ? new Date(user.lastDaily) : undefined,
        });
        userCount++;
      } catch (error: any) {
        console.error(`Error migrating user ${userId}:`, error.message);
      }
    }
    console.log(`✅ Migrated ${userCount} users\n`);
  }

  // Migrate inventory data
  console.log('🎒 Migrating inventory data...');
  const inventoryFile = path.join(dataDir, 'inventory.json');
  if (fs.existsSync(inventoryFile)) {
    const inventoryData = JSON.parse(fs.readFileSync(inventoryFile, 'utf8'));
    let itemCount = 0;
    
    for (const [userId, userItems] of Object.entries(inventoryData as any)) {
      if (typeof userItems === 'object' && userItems !== null) {
        for (const [itemId, quantity] of Object.entries(userItems as any)) {
          try {
            await storage.addInventoryItem({
              id: `${userId}-${itemId}`,
              userId,
              itemId,
              quantity: Number(quantity) || 1,
            });
            itemCount++;
          } catch (error: any) {
            console.error(`Error migrating inventory for ${userId}:`, error.message);
          }
        }
      }
    }
    console.log(`✅ Migrated ${itemCount} inventory items\n`);
  }

  // Migrate mining sessions
  console.log('⛏️  Migrating mining sessions...');
  const miningFile = path.join(dataDir, 'mining.json');
  if (fs.existsSync(miningFile)) {
    const miningData = JSON.parse(fs.readFileSync(miningFile, 'utf8'));
    let sessionCount = 0;
    
    for (const [userId, sessionData] of Object.entries(miningData as any)) {
      if (sessionData && typeof sessionData === 'object') {
        try {
          const session: any = sessionData;
          await storage.createMiningSession({
            id: `${userId}-${Date.now()}`,
            userId,
            type: session.type || 'solo',
            startTime: session.startTime || Date.now(),
            endTime: session.endTime || Date.now(),
            goldAmount: session.goldAmount || 0,
            partnerId: session.partnerId || null,
            claimed: session.claimed || false,
            notified: session.notified || false,
          });
          sessionCount++;
        } catch (error: any) {
          console.error(`Error migrating mining session for ${userId}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${sessionCount} mining sessions\n`);
  }

  // Migrate bounties
  console.log('💰 Migrating bounties...');
  const bountiesFile = path.join(dataDir, 'bounties.json');
  if (fs.existsSync(bountiesFile)) {
    const bountiesData = JSON.parse(fs.readFileSync(bountiesFile, 'utf8'));
    let bountyCount = 0;
    
    for (const [userId, bountyData] of Object.entries(bountiesData as any)) {
      if (bountyData && typeof bountyData === 'object') {
        try {
          const bounty: any = bountyData;
          await storage.createBounty({
            id: `bounty-${userId}`,
            userId,
            amount: bounty.amount || 0,
            reason: bounty.reason || null,
            placedBy: bounty.placedBy || null,
          });
          bountyCount++;
        } catch (error: any) {
          console.error(`Error migrating bounty for ${userId}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${bountyCount} bounties\n`);
  }

  // Migrate wanted settings
  console.log('🎯 Migrating wanted settings...');
  const wantedFile = path.join(dataDir, 'wanted.json');
  if (fs.existsSync(wantedFile)) {
    const wantedData = JSON.parse(fs.readFileSync(wantedFile, 'utf8'));
    let settingsCount = 0;
    
    for (const [guildId, settings] of Object.entries(wantedData as any)) {
      if (settings && typeof settings === 'object') {
        try {
          const s: any = settings;
          if (s.channelId) {
            await storage.setWantedSettings(guildId, s.channelId);
            settingsCount++;
          }
        } catch (error: any) {
          console.error(`Error migrating wanted settings for ${guildId}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${settingsCount} wanted settings\n`);
  }

  // Migrate welcome settings
  console.log('👋 Migrating welcome settings...');
  const welcomeFile = path.join(dataDir, 'welcome.json');
  if (fs.existsSync(welcomeFile)) {
    const welcomeData = JSON.parse(fs.readFileSync(welcomeFile, 'utf8'));
    let settingsCount = 0;
    
    for (const [guildId, settings] of Object.entries(welcomeData as any)) {
      if (settings && typeof settings === 'object') {
        try {
          const s: any = settings;
          if (s.channelId) {
            await storage.setWelcomeSettings(guildId, s.channelId, s.message);
            settingsCount++;
          }
        } catch (error: any) {
          console.error(`Error migrating welcome settings for ${guildId}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${settingsCount} welcome settings\n`);
  }

  // Migrate backgrounds
  console.log('🖼️  Migrating backgrounds...');
  const backgroundsFile = path.join(dataDir, 'backgrounds.json');
  if (fs.existsSync(backgroundsFile)) {
    const backgroundsData = JSON.parse(fs.readFileSync(backgroundsFile, 'utf8'));
    let bgCount = 0;
    
    for (const [userId, bgPath] of Object.entries(backgroundsData as any)) {
      if (bgPath && typeof bgPath === 'string') {
        try {
          await storage.setBackground(userId, bgPath);
          bgCount++;
        } catch (error: any) {
          console.error(`Error migrating background for ${userId}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${bgCount} backgrounds\n`);
  }

  // Migrate punishments
  console.log('⚖️  Migrating punishments...');
  const punishmentFile = path.join(dataDir, 'punishment.json');
  if (fs.existsSync(punishmentFile)) {
    const punishmentData = JSON.parse(fs.readFileSync(punishmentFile, 'utf8'));
    let punishmentCount = 0;
    
    for (const [userId, punishment] of Object.entries(punishmentData as any)) {
      if (punishment && typeof punishment === 'object') {
        try {
          const p: any = punishment;
          await storage.createPunishment({
            id: `punishment-${userId}-${Date.now()}`,
            userId,
            type: p.type || 'unknown',
            reason: p.reason || null,
            duration: p.duration || null,
            startTime: p.startTime || Date.now(),
            endTime: p.endTime || null,
            active: p.active !== false,
          });
          punishmentCount++;
        } catch (error: any) {
          console.error(`Error migrating punishment for ${userId}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${punishmentCount} punishments\n`);
  }

  console.log('🎉 Data migration completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- All JSON data has been transferred to PostgreSQL');
  console.log('- You can now update your code to use the new storage system');
  console.log('- The original JSON files are preserved as backups');
}

migrateData()
  .then(() => {
    console.log('\n✅ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
