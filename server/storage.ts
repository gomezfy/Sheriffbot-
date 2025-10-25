import { db } from './db';
import { 
  users, inventory, miningSessions, bounties, wantedSettings, 
  welcomeSettings, logSettings, backgrounds, punishments, 
  territories, territoryIncome, redemptionCodes, workData,
  type User, type InsertUser, type Inventory, type InsertInventory,
  type MiningSession, type InsertMiningSession, type Bounty, type InsertBounty
} from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export class DatabaseStorage {
  // User operations
  async getUser(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          ...insertUser,
          updatedAt: new Date(),
        }
      })
      .returning();
    return user;
  }

  async updateUser(userId: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.userId, userId))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Inventory operations
  async getInventory(userId: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.userId, userId));
  }

  async addInventoryItem(item: InsertInventory, mode: 'add' | 'set' = 'add'): Promise<Inventory> {
    const existing = await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.userId, item.userId),
        eq(inventory.itemId, item.itemId)
      ));

    if (existing.length > 0) {
      const newQuantity = mode === 'add' 
        ? sql`${inventory.quantity} + ${item.quantity || 1}`
        : item.quantity || 1;
      
      const [updated] = await db
        .update(inventory)
        .set({ quantity: newQuantity })
        .where(eq(inventory.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async removeInventoryItem(userId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.userId, userId),
        eq(inventory.itemId, itemId)
      ));

    if (!existing) return false;

    if (existing.quantity <= quantity) {
      await db.delete(inventory).where(eq(inventory.id, existing.id));
    } else {
      await db
        .update(inventory)
        .set({ quantity: sql`${inventory.quantity} - ${quantity}` })
        .where(eq(inventory.id, existing.id));
    }

    return true;
  }

  // Mining operations
  async getMiningSession(userId: string): Promise<MiningSession | undefined> {
    const [session] = await db
      .select()
      .from(miningSessions)
      .where(and(
        eq(miningSessions.userId, userId),
        eq(miningSessions.claimed, false)
      ))
      .orderBy(sql`${miningSessions.createdAt} DESC`)
      .limit(1);
    return session || undefined;
  }

  async createMiningSession(session: InsertMiningSession): Promise<MiningSession> {
    const [newSession] = await db.insert(miningSessions).values(session).returning();
    return newSession;
  }

  async updateMiningSession(id: string, updates: Partial<InsertMiningSession>): Promise<void> {
    await db.update(miningSessions).set(updates).where(eq(miningSessions.id, id));
  }

  async getAllUnclaimedMiningSessions(): Promise<MiningSession[]> {
    return await db
      .select()
      .from(miningSessions)
      .where(eq(miningSessions.claimed, false));
  }

  // Bounty operations
  async getBounty(userId: string): Promise<Bounty | undefined> {
    const [bounty] = await db.select().from(bounties).where(eq(bounties.userId, userId));
    return bounty || undefined;
  }

  async createBounty(bounty: InsertBounty): Promise<Bounty> {
    const [newBounty] = await db.insert(bounties).values(bounty).returning();
    return newBounty;
  }

  async removeBounty(userId: string): Promise<boolean> {
    const result = await db.delete(bounties).where(eq(bounties.userId, userId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllBounties(): Promise<Bounty[]> {
    return await db.select().from(bounties);
  }

  // Settings operations
  async getWantedSettings(guildId: string) {
    const [settings] = await db.select().from(wantedSettings).where(eq(wantedSettings.guildId, guildId));
    return settings || undefined;
  }

  async setWantedSettings(guildId: string, channelId: string) {
    const [settings] = await db
      .insert(wantedSettings)
      .values({ guildId, channelId })
      .onConflictDoUpdate({
        target: wantedSettings.guildId,
        set: { channelId }
      })
      .returning();
    return settings;
  }

  async getWelcomeSettings(guildId: string) {
    const [settings] = await db.select().from(welcomeSettings).where(eq(welcomeSettings.guildId, guildId));
    return settings || undefined;
  }

  async setWelcomeSettings(guildId: string, channelId: string, message?: string) {
    const [settings] = await db
      .insert(welcomeSettings)
      .values({ guildId, channelId, message })
      .onConflictDoUpdate({
        target: welcomeSettings.guildId,
        set: { channelId, message }
      })
      .returning();
    return settings;
  }

  async getLogSettings(guildId: string) {
    const [settings] = await db.select().from(logSettings).where(eq(logSettings.guildId, guildId));
    return settings || undefined;
  }

  async setLogSettings(guildId: string, channelId: string) {
    const [settings] = await db
      .insert(logSettings)
      .values({ guildId, channelId })
      .onConflictDoUpdate({
        target: logSettings.guildId,
        set: { channelId }
      })
      .returning();
    return settings;
  }

  // Background operations
  async getBackground(userId: string) {
    const [bg] = await db.select().from(backgrounds).where(eq(backgrounds.userId, userId));
    return bg || undefined;
  }

  async setBackground(userId: string, backgroundPath: string) {
    const [bg] = await db
      .insert(backgrounds)
      .values({ userId, backgroundPath })
      .onConflictDoUpdate({
        target: backgrounds.userId,
        set: { backgroundPath, updatedAt: new Date() }
      })
      .returning();
    return bg;
  }

  // Punishment operations
  async getPunishment(userId: string) {
    const [punishment] = await db
      .select()
      .from(punishments)
      .where(and(
        eq(punishments.userId, userId),
        eq(punishments.active, true)
      ))
      .orderBy(sql`${punishments.createdAt} DESC`)
      .limit(1);
    return punishment || undefined;
  }

  async createPunishment(punishment: any) {
    const [newPunishment] = await db.insert(punishments).values(punishment).returning();
    return newPunishment;
  }

  async deactivatePunishment(id: string) {
    await db.update(punishments).set({ active: false }).where(eq(punishments.id, id));
  }

  // Territory operations
  async getTerritory(id: string) {
    const [territory] = await db.select().from(territories).where(eq(territories.id, id));
    return territory || undefined;
  }

  async getAllTerritories() {
    return await db.select().from(territories);
  }

  async updateTerritory(id: string, updates: any) {
    const [territory] = await db.update(territories).set(updates).where(eq(territories.id, id)).returning();
    return territory;
  }

  async getTerritoryIncome(userId: string, territoryId: string) {
    const [income] = await db
      .select()
      .from(territoryIncome)
      .where(and(
        eq(territoryIncome.userId, userId),
        eq(territoryIncome.territoryId, territoryId)
      ));
    return income || undefined;
  }

  async updateTerritoryIncome(userId: string, territoryId: string, updates: any) {
    const existing = await this.getTerritoryIncome(userId, territoryId);
    
    if (existing) {
      const [updated] = await db
        .update(territoryIncome)
        .set(updates)
        .where(eq(territoryIncome.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newIncome] = await db
        .insert(territoryIncome)
        .values({ id: `${userId}-${territoryId}`, userId, territoryId, ...updates })
        .returning();
      return newIncome;
    }
  }

  // Work data operations
  async getWorkData(userId: string) {
    const [work] = await db.select().from(workData).where(eq(workData.userId, userId));
    return work || undefined;
  }

  async updateWorkData(userId: string, updates: any) {
    const existing = await this.getWorkData(userId);
    
    if (existing) {
      const [updated] = await db.update(workData).set(updates).where(eq(workData.userId, userId)).returning();
      return updated;
    } else {
      const [newWork] = await db.insert(workData).values({ userId, ...updates }).returning();
      return newWork;
    }
  }

  // Redemption codes
  async getRedemptionCode(code: string) {
    const [redemption] = await db.select().from(redemptionCodes).where(eq(redemptionCodes.code, code));
    return redemption || undefined;
  }

  async createRedemptionCode(code: any) {
    const [newCode] = await db.insert(redemptionCodes).values(code).returning();
    return newCode;
  }

  async updateRedemptionCode(code: string, updates: any) {
    const [updated] = await db.update(redemptionCodes).set(updates).where(eq(redemptionCodes.code, code)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
