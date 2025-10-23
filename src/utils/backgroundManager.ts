import fs from 'fs';
import path from 'path';
import { getUserProfile, setUserProfile } from './profileManager';
import { getUserGold, removeUserGold } from './dataManager';

export interface Background {
  id: string;
  name: string;
  filename: string;
  price: number; // Price in Saloon Tokens
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  free: boolean;
}

/**
 * All available backgrounds
 */
export const BACKGROUNDS: Background[] = [
  {
    id: 'arabe_ingles',
    name: 'Árabe Inglês',
    filename: 'arabe-ingles.png',
    price: 300,
    description: 'Majestic Arabian horse in the desert',
    rarity: 'legendary',
    free: false
  },
  {
    id: 'horse_alone',
    name: 'Horse Alone',
    filename: 'horse-alone.png',
    price: 283,
    description: 'Saddled horse drinking from a western river',
    rarity: 'epic',
    free: false
  },
  {
    id: 'addicted_saloon',
    name: 'Addicted to the Saloon',
    filename: 'addicted-saloon.png',
    price: 800,
    description: 'Poker table with cards and chips in the saloon',
    rarity: 'mythic',
    free: false
  }
];

/**
 * Get background by ID
 */
export function getBackgroundById(id: string): Background | null {
  return BACKGROUNDS.find(bg => bg.id === id) || null;
}

/**
 * Get all backgrounds
 */
export function getAllBackgrounds(): Background[] {
  return BACKGROUNDS;
}

/**
 * Get backgrounds by rarity
 */
export function getBackgroundsByRarity(rarity: string): Background[] {
  return BACKGROUNDS.filter(bg => bg.rarity === rarity);
}

/**
 * Check if user owns a background
 */
export function userOwnsBackground(userId: string, backgroundId: string): boolean {
  const profile = getUserProfile(userId);
  
  // Default background is always owned
  if (backgroundId === 'default') return true;
  
  // Check if user has purchased this background
  return profile.ownedBackgrounds?.includes(backgroundId) || false;
}

/**
 * Get all backgrounds owned by user
 */
export function getUserBackgrounds(userId: string): Background[] {
  const profile = getUserProfile(userId);
  const owned = profile.ownedBackgrounds || [];
  return BACKGROUNDS.filter(bg => bg.free || owned.includes(bg.id));
}

/**
 * Purchase a background for a user
 */
export function purchaseBackground(userId: string, backgroundId: string): { success: boolean; message: string } {
  const background = getBackgroundById(backgroundId);
  
  if (!background) {
    return { success: false, message: '❌ Background not found!' };
  }
  
  // Check if already owned
  if (userOwnsBackground(userId, backgroundId)) {
    return { success: false, message: '❌ You already own this background!' };
  }
  
  // Check if free
  if (background.free) {
    const profile = getUserProfile(userId);
    if (!profile.ownedBackgrounds) {
      profile.ownedBackgrounds = [];
    }
    profile.ownedBackgrounds.push(backgroundId);
    setUserProfile(userId, profile);
    return { success: true, message: `✅ You claimed the **${background.name}** background!` };
  }
  
  // Check if user has enough tokens
  const userTokens = getUserGold(userId);
  if (userTokens < background.price) {
    return { 
      success: false, 
      message: `❌ Not enough Saloon Tokens! You need 🎫 ${background.price.toLocaleString()} but only have 🎫 ${userTokens.toLocaleString()}.` 
    };
  }
  
  // Deduct tokens
  removeUserGold(userId, background.price);
  
  // Add background to user's collection
  const profile = getUserProfile(userId);
  if (!profile.ownedBackgrounds) {
    profile.ownedBackgrounds = [];
  }
  profile.ownedBackgrounds.push(backgroundId);
  setUserProfile(userId, profile);
  
  return { 
    success: true, 
    message: `✅ Successfully purchased **${background.name}**!\n💰 Spent 🎫 ${background.price.toLocaleString()} Saloon Tokens.` 
  };
}

/**
 * Set active background for user
 */
export function setUserBackground(userId: string, backgroundId: string): { success: boolean; message: string } {
  const background = getBackgroundById(backgroundId);
  
  if (!background) {
    return { success: false, message: '❌ Background not found!' };
  }
  
  // Check if user owns this background
  if (!userOwnsBackground(userId, backgroundId)) {
    return { success: false, message: '❌ You don\'t own this background!' };
  }
  
  // Set as active background
  const profile = getUserProfile(userId);
  profile.background = background.filename;
  setUserProfile(userId, profile);
  
  return { 
    success: true, 
    message: `✅ Background changed to **${background.name}**!` 
  };
}

/**
 * Get user's current active background
 */
export function getUserCurrentBackground(userId: string): Background | null {
  const profile = getUserProfile(userId);
  if (!profile.background) return null;
  
  return BACKGROUNDS.find(bg => bg.filename === profile.background) || null;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): number {
  switch (rarity) {
    case 'common': return 0x95A5A6;
    case 'rare': return 0x3498DB;
    case 'epic': return 0x9B59B6;
    case 'legendary': return 0xF1C40F;
    case 'mythic': return 0xE74C3C;
    default: return 0x95A5A6;
  }
}

/**
 * Get rarity emoji
 */
export function getRarityEmoji(rarity: string): string {
  switch (rarity) {
    case 'common': return '⚪';
    case 'rare': return '🔵';
    case 'epic': return '🟣';
    case 'legendary': return '🟡';
    case 'mythic': return '🔴';
    default: return '⚪';
  }
}

/**
 * Check if background file exists
 */
export function backgroundFileExists(filename: string): boolean {
  const projectRoot = path.join(__dirname, '..', '..', '..');
  const bgPath = path.join(projectRoot, 'assets', 'profile-backgrounds', filename);
  return fs.existsSync(bgPath);
}
