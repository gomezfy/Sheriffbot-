import fs from 'fs';
import path from 'path';
import { EMOJI_TEXT } from './customEmojis';

const inventoryFile = path.join(__dirname, '..', 'data', 'inventory.json');

interface Item {
  name: string;
  emoji: string;
  customEmoji?: string;
  weight: number;
  stackable: boolean;
  description: string;
}

export const ITEMS: Record<string, Item> = {
  saloon_token: {
    name: 'Saloon Token',
    emoji: EMOJI_TEXT.SALOON_TOKEN,
    customEmoji: 'SALOON_TOKEN',
    weight: 0.00001,
    stackable: true,
    description: 'Main saloon currency'
  },
  silver: {
    name: 'Silver Coin',
    emoji: EMOJI_TEXT.SILVER_COIN,
    weight: 0.0001,
    stackable: true,
    description: 'Valuable silver coin'
  },
  gold: {
    name: 'Gold Bar',
    emoji: EMOJI_TEXT.GOLD_BAR,
    weight: 1,
    stackable: true,
    description: 'Precious gold bar obtained through mining'
  }
};

export const MAX_WEIGHT = 100;

if (!fs.existsSync(inventoryFile)) {
  fs.writeFileSync(inventoryFile, JSON.stringify({}, null, 2));
}

interface Inventory {
  items: Record<string, number>;
  weight: number;
  maxWeight: number;
}

export function getInventory(userId: string): Inventory {
  const data = fs.readFileSync(inventoryFile, 'utf8');
  const inventories = JSON.parse(data);
  
  if (!inventories[userId]) {
    inventories[userId] = {
      items: {},
      weight: 0,
      maxWeight: MAX_WEIGHT
    };
    fs.writeFileSync(inventoryFile, JSON.stringify(inventories, null, 2));
  }
  
  if (!inventories[userId].maxWeight) {
    inventories[userId].maxWeight = MAX_WEIGHT;
    fs.writeFileSync(inventoryFile, JSON.stringify(inventories, null, 2));
  }
  
  return inventories[userId];
}

export function saveInventory(userId: string, inventory: Inventory): void {
  const data = fs.readFileSync(inventoryFile, 'utf8');
  const inventories = JSON.parse(data);
  
  if (inventories[userId] && inventories[userId].maxWeight > MAX_WEIGHT) {
    inventory.maxWeight = inventories[userId].maxWeight;
  }
  
  inventories[userId] = inventory;
  
  fs.writeFileSync(inventoryFile, JSON.stringify(inventories, null, 2));
}

export function calculateWeight(inventory: Inventory): number {
  let totalWeight = 0;
  
  for (const [itemId, quantity] of Object.entries(inventory.items)) {
    if (ITEMS[itemId]) {
      totalWeight += ITEMS[itemId].weight * quantity;
    }
  }
  
  return Math.round(totalWeight * 1000) / 1000;
}

export function addItem(userId: string, itemId: string, quantity: number = 1): any {
  const inventory = getInventory(userId);
  
  if (!ITEMS[itemId]) {
    return { success: false, error: 'Item not found!' };
  }
  
  const additionalWeight = ITEMS[itemId].weight * quantity;
  const currentWeight = calculateWeight(inventory);
  const newWeight = currentWeight + additionalWeight;
  const userMaxWeight = inventory.maxWeight;
  
  if (newWeight > userMaxWeight) {
    return { 
      success: false, 
      error: '🚫 You\'re carrying too much weight!',
      currentWeight: currentWeight,
      maxWeight: userMaxWeight,
      additionalWeight: additionalWeight
    };
  }
  
  if (!inventory.items[itemId]) {
    inventory.items[itemId] = 0;
  }
  
  inventory.items[itemId] += quantity;
  inventory.weight = newWeight;
  
  saveInventory(userId, inventory);
  
  return { 
    success: true, 
    item: ITEMS[itemId],
    quantity: quantity,
    newWeight: newWeight,
    totalQuantity: inventory.items[itemId]
  };
}

export function removeItem(userId: string, itemId: string, quantity: number = 1): any {
  const inventory = getInventory(userId);
  
  if (!inventory.items[itemId] || inventory.items[itemId] < quantity) {
    return { success: false, error: 'You don\'t have enough items!' };
  }
  
  inventory.items[itemId] -= quantity;
  
  if (inventory.items[itemId] <= 0) {
    delete inventory.items[itemId];
  }
  
  inventory.weight = calculateWeight(inventory);
  
  saveInventory(userId, inventory);
  
  return { 
    success: true, 
    item: ITEMS[itemId],
    quantity: quantity,
    newWeight: inventory.weight,
    remainingQuantity: inventory.items[itemId] || 0
  };
}

export function getItem(userId: string, itemId: string): number {
  const inventory = getInventory(userId);
  return inventory.items[itemId] || 0;
}

export function transferItem(fromUserId: string, toUserId: string, itemId: string, quantity: number): any {
  const removeResult = removeItem(fromUserId, itemId, quantity);
  
  if (!removeResult.success) {
    return removeResult;
  }
  
  const addResult = addItem(toUserId, itemId, quantity);
  
  if (!addResult.success) {
    addItem(fromUserId, itemId, quantity);
    return addResult;
  }
  
  return { success: true, item: ITEMS[itemId], quantity: quantity };
}

// Upgrade tiers with costs
export const UPGRADE_TIERS = [
  { level: 1, capacity: 100, cost: 0, currency: null },
  { level: 2, capacity: 200, cost: 5000, currency: 'silver' },
  { level: 3, capacity: 300, cost: 10000, currency: 'silver' },
  { level: 4, capacity: 400, cost: 20000, currency: 'silver' },
  { level: 5, capacity: 500, cost: 50000, currency: 'silver' }
];

export function getBackpackLevel(userId: string): number {
  const inventory = getInventory(userId);
  const currentCapacity = inventory.maxWeight;
  
  for (let i = UPGRADE_TIERS.length - 1; i >= 0; i--) {
    if (currentCapacity >= UPGRADE_TIERS[i].capacity) {
      return UPGRADE_TIERS[i].level;
    }
  }
  
  return 1;
}

export function getNextUpgrade(userId: string): any {
  const inventory = getInventory(userId);
  const currentCapacity = inventory.maxWeight;
  
  // Website upgrade tiers with prices
  const websiteUpgrades = [
    { capacity: 200, price: '2.99' },
    { capacity: 300, price: '4.99' },
    { capacity: 400, price: '6.99' },
    { capacity: 500, price: '9.99' }
  ];
  
  // Find next upgrade
  for (const upgrade of websiteUpgrades) {
    if (currentCapacity < upgrade.capacity) {
      return { capacity: upgrade.capacity, price: upgrade.price };
    }
  }
  
  // Already at max
  return null;
}

export function upgradeBackpack(userId: string, newCapacity?: number): any {
  const inventory = getInventory(userId);
  const currentLevel = getBackpackLevel(userId);
  
  // DIRECT UPGRADE (for redemption codes / admin)
  if (newCapacity !== undefined) {
    // Check if new capacity is valid
    if (newCapacity <= inventory.maxWeight) {
      return { success: false, error: 'New capacity must be greater than current!' };
    }
    
    // Check if new capacity is valid tier (200, 300, 400, or 500)
    const validCapacities = [200, 300, 400, 500];
    if (!validCapacities.includes(newCapacity)) {
      return { success: false, error: 'Invalid capacity tier!' };
    }
    
    const oldCapacity = inventory.maxWeight;
    inventory.maxWeight = newCapacity;
    saveInventory(userId, inventory);
    
    return { 
      success: true, 
      oldCapacity: oldCapacity,
      newCapacity: newCapacity,
      level: getBackpackLevel(userId)
    };
  }
  
  // LEGACY UPGRADE PATH (for in-game currency purchases)
  // Auto-upgrade to next tier using silver coins
  if (currentLevel >= UPGRADE_TIERS.length) {
    return { success: false, error: 'Already at maximum capacity!' };
  }
  
  const nextTier = UPGRADE_TIERS[currentLevel];
  
  // Check if currency is required
  if (nextTier.currency && nextTier.cost > 0) {
    // Check if user has enough currency
    const userCurrency = getItem(userId, nextTier.currency);
    
    if (userCurrency < nextTier.cost) {
      return { 
        success: false, 
        error: `Not enough ${nextTier.currency}!`,
        required: nextTier.cost,
        current: userCurrency,
        missing: nextTier.cost - userCurrency
      };
    }
    
    // Deduct cost
    const removeResult = removeItem(userId, nextTier.currency, nextTier.cost);
    
    if (!removeResult.success) {
      return removeResult;
    }
  }
  
  // Apply upgrade
  const oldCapacity = inventory.maxWeight;
  inventory.maxWeight = nextTier.capacity;
  saveInventory(userId, inventory);
  
  return { 
    success: true, 
    oldCapacity: oldCapacity,
    newCapacity: nextTier.capacity,
    level: nextTier.level,
    cost: nextTier.cost,
    currency: nextTier.currency
  };
}
