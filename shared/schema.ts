import { pgTable, text, integer, boolean, timestamp, jsonb, bigint, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userId: text('user_id').primaryKey(),
  username: text('username').notNull(),
  gold: integer('gold').default(0).notNull(),
  silver: integer('silver').default(0).notNull(),
  tokens: integer('tokens').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  background: text('background'),
  backpackSlots: integer('backpack_slots').default(5).notNull(),
  dailyStreak: integer('daily_streak').default(0).notNull(),
  lastDaily: timestamp('last_daily'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  itemId: text('item_id').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const miningSessions = pgTable('mining_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  startTime: bigint('start_time', { mode: 'number' }).notNull(),
  endTime: bigint('end_time', { mode: 'number' }).notNull(),
  goldAmount: integer('gold_amount').notNull(),
  partnerId: text('partner_id'),
  claimed: boolean('claimed').default(false).notNull(),
  notified: boolean('notified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bounties = pgTable('bounties', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(),
  reason: text('reason'),
  placedBy: text('placed_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wantedSettings = pgTable('wanted_settings', {
  guildId: text('guild_id').primaryKey(),
  channelId: text('channel_id').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const welcomeSettings = pgTable('welcome_settings', {
  guildId: text('guild_id').primaryKey(),
  channelId: text('channel_id').notNull(),
  message: text('message'),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const logSettings = pgTable('log_settings', {
  guildId: text('guild_id').primaryKey(),
  channelId: text('channel_id').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const backgrounds = pgTable('backgrounds', {
  userId: text('user_id').primaryKey(),
  backgroundPath: text('background_path').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const punishments = pgTable('punishments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  reason: text('reason'),
  duration: bigint('duration', { mode: 'number' }),
  startTime: bigint('start_time', { mode: 'number' }).notNull(),
  endTime: bigint('end_time', { mode: 'number' }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const territories = pgTable('territories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: text('owner_id'),
  capturedAt: timestamp('captured_at'),
  income: integer('income').default(0).notNull(),
  description: text('description'),
});

export const territoryIncome = pgTable('territory_income', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  territoryId: text('territory_id').notNull(),
  lastClaim: timestamp('last_claim').defaultNow().notNull(),
  totalEarned: integer('total_earned').default(0).notNull(),
});

export const redemptionCodes = pgTable('redemption_codes', {
  code: text('code').primaryKey(),
  rewards: jsonb('rewards').notNull(),
  usageLimit: integer('usage_limit'),
  usedBy: jsonb('used_by').default([]).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by'),
});

export const workData = pgTable('work_data', {
  userId: text('user_id').primaryKey(),
  lastWork: timestamp('last_work'),
  totalEarned: integer('total_earned').default(0).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;
export type MiningSession = typeof miningSessions.$inferSelect;
export type InsertMiningSession = typeof miningSessions.$inferInsert;
export type Bounty = typeof bounties.$inferSelect;
export type InsertBounty = typeof bounties.$inferInsert;
export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = typeof territories.$inferInsert;
