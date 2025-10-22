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
    id: 'default',
    name: 'Desert Sunset',
    filename: 'default.jpg',
    price: 0,
    description: 'Classic western desert sunset (Default)',
    rarity: 'common',
    free: true
  },
  {
    id: 'saloon',
    name: 'Wild West Saloon',
    filename: 'saloon.jpg',
    price: 50,
    description: 'Inside a rustic western saloon',
    rarity: 'rare',
    free: false
  },
  {
    id: 'canyon',
    name: 'Red Canyon',
    filename: 'canyon.jpg',
    price: 100,
    description: 'Majestic red rock canyon landscape',
    rarity: 'epic',
    free: false
  },
  {
    id: 'town',
    name: 'Ghost Town',
    filename: 'town.jpg',
    price: 150,
    description: 'Abandoned western ghost town',
    rarity: 'legendary',
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
  const ownedIds = profile.ownedBackgrounds || ['default'];
  
  return BACKGROUNDS.filter(bg => ownedIds.includes(bg.id));
}

/**
 * Purchase a background
 */
export function purchaseBackground(userId: string, backgroundId: string): { success: boolean; message: string } {
  const background = getBackgroundById(backgroundId);
  
  if (!background) {
    return { success: false, message: 'Background not found!' };
  }
  
  if (background.free || background.id === 'default') {
    return { success: false, message: 'This background is already free!' };
  }
  
  if (userOwnsBackground(userId, backgroundId)) {
    return { success: false, message: 'You already own this background!' };
  }
  
  const userTokens = getUserGold(userId);
  
  if (userTokens < background.price) {
    return { 
      success: false, 
      message: `You need ${background.price.toLocaleString()} 🎫 Saloon Tokens but only have ${userTokens.toLocaleString()}!` 
    };
  }
  
  // Deduct tokens
  removeUserGold(userId, background.price);
  
  // Add background to owned list
  const profile = getUserProfile(userId);
  if (!profile.ownedBackgrounds) {
    profile.ownedBackgrounds = ['default'];
  }
  profile.ownedBackgrounds.push(backgroundId);
  
  setUserProfile(userId, profile);
  
  return { 
    success: true, 
    message: `Successfully purchased **${background.name}** for ${background.price.toLocaleString()} 🪙!` 
  };
}

/**
 * Set user's active background
 */
export function setUserBackground(userId: string, backgroundId: string): { success: boolean; message: string } {
  if (!userOwnsBackground(userId, backgroundId)) {
    return { success: false, message: 'You don\'t own this background!' };
  }
  
  const background = getBackgroundById(backgroundId);
  if (!background) {
    return { success: false, message: 'Background not found!' };
  }
  
  const profile = getUserProfile(userId);
  profile.background = background.filename;
  setUserProfile(userId, profile);
  
  return { 
    success: true, 
    message: `Successfully changed background to **${background.name}**!` 
  };
}

/**
 * Get current user background
 */
export function getUserCurrentBackground(userId: string): Background | null {
  const profile = getUserProfile(userId);
  const currentFilename = profile.background || 'default.jpg';
  
  return BACKGROUNDS.find(bg => bg.filename === currentFilename) || BACKGROUNDS[0];
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
    case 'mythic': return 0xFF1493;
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
    case 'mythic': return '💎';
    default: return '⚪';
  }
}

/**
 * Check if background file exists
 */
export function backgroundFileExists(filename: string): boolean {
  const bgPath = path.join(__dirname, '..', '..', 'assets', 'profile-backgrounds', filename);
  return fs.existsSync(bgPath);
}
