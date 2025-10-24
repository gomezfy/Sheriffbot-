import { readData, writeData } from './database';

export interface Territory {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  benefits: string[];
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: number;
}

export interface TerritoryOwnership {
  [userId: string]: {
    territories: string[]; // Array of territory IDs
    purchaseHistory: {
      territoryId: string;
      purchaseDate: number;
      pricePaid: number;
    }[];
  };
}

// Define all available territories
export const TERRITORIES: Territory[] = [
  {
    id: 'saloon_business',
    name: 'Saloon Business',
    emoji: '🍺',
    description: 'Own a bustling saloon in the heart of town! Serve drinks, host poker games, and watch the coins roll in.',
    price: 360000,
    benefits: [
      '💰 Generate 5,000 Silver Coins daily',
      '🎰 Unlock exclusive gambling events',
      '👥 Host private poker tournaments',
      '🍻 50% discount on casino games'
    ],
    rarity: 'rare',
    color: 0xFF8C00, // Dark orange
    image: 'saloon.png'
  },
  {
    id: 'gold_mine_shares',
    name: 'Gold Mine Shares',
    emoji: '⛏️',
    description: 'Invest in the richest gold mine in the West! Your shares will bring you steady income from precious metals.',
    price: 699000,
    benefits: [
      '💎 Generate 12,000 Silver Coins daily',
      '🥇 Receive 2 Gold Bars weekly',
      '⚡ 25% faster mining operations',
      '📊 Priority access to new mining spots'
    ],
    rarity: 'epic',
    color: 0xFFD700, // Gold
    image: 'mine.png'
  },
  {
    id: 'ranch',
    name: 'Ranch',
    emoji: '🐴',
    description: 'Build your own ranch with cattle, horses, and wide open plains. A true cowboy\'s dream come true!',
    price: 810000,
    benefits: [
      '🌾 Generate 15,000 Silver Coins daily',
      '🐄 Breed and sell premium livestock',
      '🏇 Unlock horse racing events',
      '🛡️ Immunity from bounty hunters'
    ],
    rarity: 'legendary',
    color: 0x8B4513, // Saddle brown
    image: 'ranch.png'
  }
];

/**
 * Get territory data by ID
 */
export function getTerritory(territoryId: string): Territory | undefined {
  return TERRITORIES.find(t => t.id === territoryId);
}

/**
 * Get all territories owned by a user
 */
export function getUserTerritories(userId: string): string[] {
  const data: TerritoryOwnership = readData('territories.json');
  return data[userId]?.territories || [];
}

/**
 * Check if user owns a specific territory
 */
export function ownsTerritory(userId: string, territoryId: string): boolean {
  const territories = getUserTerritories(userId);
  return territories.includes(territoryId);
}

/**
 * Purchase a territory for a user
 */
export function purchaseTerritory(userId: string, territoryId: string, pricePaid: number): boolean {
  const data: TerritoryOwnership = readData('territories.json');
  
  // Initialize user data if doesn't exist
  if (!data[userId]) {
    data[userId] = {
      territories: [],
      purchaseHistory: []
    };
  }
  
  // Check if already owns it
  if (data[userId].territories.includes(territoryId)) {
    return false;
  }
  
  // Add territory
  data[userId].territories.push(territoryId);
  data[userId].purchaseHistory.push({
    territoryId,
    purchaseDate: Date.now(),
    pricePaid
  });
  
  writeData('territories.json', data);
  return true;
}

/**
 * Get user's purchase history
 */
export function getPurchaseHistory(userId: string) {
  const data: TerritoryOwnership = readData('territories.json');
  return data[userId]?.purchaseHistory || [];
}

/**
 * Get total territories owned by user
 */
export function getTerritoryCount(userId: string): number {
  return getUserTerritories(userId).length;
}

/**
 * Get all users who own territories (for stats)
 */
export function getAllTerritoryOwners(): { userId: string; count: number }[] {
  const data: TerritoryOwnership = readData('territories.json');
  return Object.entries(data).map(([userId, userData]) => ({
    userId,
    count: userData.territories.length
  }));
}
