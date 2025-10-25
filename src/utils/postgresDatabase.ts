// PostgreSQL-based database utilities
// This file provides the same interface as database.ts but uses PostgreSQL instead of JSON files
import { storage } from '../../server/storage';

export async function getUserData(userId: string): Promise<any> {
  const user = await storage.getUser(userId);
  if (!user) {
    // Create default user if not exists
    return await storage.createUser({
      userId,
      username: 'Unknown',
      gold: 0,
      silver: 0,
      tokens: 0,
      level: 1,
      xp: 0,
      backpackSlots: 5,
      dailyStreak: 0,
    });
  }
  return user;
}

export async function updateUserData(userId: string, updates: any): Promise<void> {
  await storage.updateUser(userId, updates);
}

export async function getAllUsers(): Promise<any[]> {
  return await storage.getAllUsers();
}

export async function getUserInventory(userId: string): Promise<Record<string, number>> {
  const items = await storage.getInventory(userId);
  const inventory: Record<string, number> = {};
  items.forEach(item => {
    inventory[item.itemId] = item.quantity;
  });
  return inventory;
}

export async function addInventoryItem(userId: string, itemId: string, quantity: number = 1): Promise<void> {
  await storage.addInventoryItem({
    id: `${userId}-${itemId}-${Date.now()}`,
    userId,
    itemId,
    quantity,
  });
}

export async function removeInventoryItem(userId: string, itemId: string, quantity: number = 1): Promise<boolean> {
  return await storage.removeInventoryItem(userId, itemId, quantity);
}

export async function getMiningSession(userId: string): Promise<any> {
  return await storage.getMiningSession(userId);
}

export async function createMiningSession(session: any): Promise<any> {
  return await storage.createMiningSession({
    id: `${session.userId}-${Date.now()}`,
    ...session,
  });
}

export async function updateMiningSession(id: string, updates: any): Promise<void> {
  await storage.updateMiningSession(id, updates);
}

export async function getAllUnclaimedMiningSessions(): Promise<any[]> {
  return await storage.getAllUnclaimedMiningSessions();
}

export async function getBounty(userId: string): Promise<any> {
  return await storage.getBounty(userId);
}

export async function createBounty(userId: string, amount: number, reason?: string, placedBy?: string): Promise<any> {
  return await storage.createBounty({
    id: `bounty-${userId}-${Date.now()}`,
    userId,
    amount,
    reason: reason || null,
    placedBy: placedBy || null,
  });
}

export async function removeBounty(userId: string): Promise<boolean> {
  return await storage.removeBounty(userId);
}

export async function getAllBounties(): Promise<any[]> {
  return await storage.getAllBounties();
}

// Export storage for direct access if needed
export { storage };
