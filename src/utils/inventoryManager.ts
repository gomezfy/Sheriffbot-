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
