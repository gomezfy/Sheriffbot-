const fs = require('fs');
const path = require('path');
const { EMOJI_TEXT } = require('./customEmojis');

const inventoryFile = path.join(__dirname, '..', 'data', 'inventory.json');

// Item definitions with weight
const ITEMS = {
  saloon_token: {
    name: 'Saloon Token',
    emoji: EMOJI_TEXT.SALOON_TOKEN,
    customEmoji: 'SALOON_TOKEN', // Reference to custom image
    weight: 0.00001, // kg
    stackable: true,
    description: 'Main saloon currency'
  },
  silver: {
    name: 'Silver Coin',
    emoji: EMOJI_TEXT.SILVER_COIN,
    weight: 0.0001, // kg
    stackable: true,
    description: 'Valuable silver coin'
  },
  gold: {
    name: 'Gold Bar',
    emoji: EMOJI_TEXT.GOLD_BAR,
    weight: 1, // kg
    stackable: true,
    description: 'Precious gold bar obtained through mining'
  }
};

const MAX_WEIGHT = 100; // kg

// Ensure file exists
if (!fs.existsSync(inventoryFile)) {
  fs.writeFileSync(inventoryFile, JSON.stringify({}, null, 2));
}

function getInventory(userId) {
  const data = fs.readFileSync(inventoryFile, 'utf8');
  const inventories = JSON.parse(data);
  
  if (!inventories[userId]) {
    inventories[userId] = {
      items: {},
      weight: 0,
      maxWeight: MAX_WEIGHT
    };
    // Save the new inventory
    fs.writeFileSync(inventoryFile, JSON.stringify(inventories, null, 2));
  }
  
  // Ensure maxWeight exists (for old inventories) - but don't override if it exists!
  if (!inventories[userId].maxWeight) {
    inventories[userId].maxWeight = MAX_WEIGHT;
    fs.writeFileSync(inventoryFile, JSON.stringify(inventories, null, 2));
  }
  
  return inventories[userId];
}

function saveInventory(userId, inventory) {
  const data = fs.readFileSync(inventoryFile, 'utf8');
  const inventories = JSON.parse(data);
  
  // CRITICAL: Preserve maxWeight if it already exists (prevent downgrade bugs)
  if (inventories[userId] && inventories[userId].maxWeight > MAX_WEIGHT) {
    inventory.maxWeight = inventories[userId].maxWeight;
  }
  
  inventories[userId] = inventory;
  
  fs.writeFileSync(inventoryFile, JSON.stringify(inventories, null, 2));
}

function calculateWeight(inventory) {
  let totalWeight = 0;
  
  for (const [itemId, quantity] of Object.entries(inventory.items)) {
    if (ITEMS[itemId]) {
      totalWeight += ITEMS[itemId].weight * quantity;
    }
  }
  
  return Math.round(totalWeight * 1000) / 1000; // Round to 3 decimal places
}

function addItem(userId, itemId, quantity = 1) {
  const inventory = getInventory(userId);
  
  // Check if item exists
  if (!ITEMS[itemId]) {
    return { success: false, error: 'Item not found!' };
  }
  
  // Calculate weight to be added
  const additionalWeight = ITEMS[itemId].weight * quantity;
  const currentWeight = calculateWeight(inventory);
  const newWeight = currentWeight + additionalWeight;
  const userMaxWeight = inventory.maxWeight; // Always use inventory.maxWeight (getInventory ensures it exists)
  
  // Check weight limit
  if (newWeight > userMaxWeight) {
    return { 
      success: false, 
      error: '🚫 You\'re carrying too much weight!',
      currentWeight: currentWeight,
      maxWeight: userMaxWeight,
      additionalWeight: additionalWeight
    };
  }
  
  // Add item
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

function removeItem(userId, itemId, quantity = 1) {
  const inventory = getInventory(userId);
  
  // Check if item exists in inventory
  if (!inventory.items[itemId] || inventory.items[itemId] < quantity) {
    return { success: false, error: 'You don\'t have enough items!' };
  }
  
  // Remove item
  inventory.items[itemId] -= quantity;
  
  // If quantity is 0, remove from inventory
  if (inventory.items[itemId] <= 0) {
    delete inventory.items[itemId];
  }
  
  // Recalculate weight
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

function getItem(userId, itemId) {
  const inventory = getInventory(userId);
  return inventory.items[itemId] || 0;
}

function transferItem(fromUserId, toUserId, itemId, quantity) {
  // Remove from source inventory
  const removeResult = removeItem(fromUserId, itemId, quantity);
  
  if (!removeResult.success) {
    return removeResult;
  }
  
  // Add to destination inventory
  const addResult = addItem(toUserId, itemId, quantity);
  
  if (!addResult.success) {
    // If it fails, return to original inventory
    addItem(fromUserId, itemId, quantity);
    return addResult;
  }
  
  return { success: true, item: ITEMS[itemId], quantity: quantity };
}

module.exports = {
  ITEMS,
  MAX_WEIGHT,
  getInventory,
  calculateWeight,
  addItem,
  removeItem,
  getItem,
  transferItem
};
