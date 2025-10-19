import fs from 'fs';
import path from 'path';

const xpFile = path.join(__dirname, '..', 'data', 'xp.json');

if (!fs.existsSync(xpFile)) {
  fs.writeFileSync(xpFile, JSON.stringify({}, null, 2));
}

interface UserXP {
  xp: number;
  level: number;
}

export function getUserXP(userId: string): UserXP {
  const data = fs.readFileSync(xpFile, 'utf8');
  const xpData = JSON.parse(data);
  
  if (!xpData[userId]) {
    xpData[userId] = {
      xp: 0,
      level: 1
    };
    fs.writeFileSync(xpFile, JSON.stringify(xpData, null, 2));
  }
  
  return xpData[userId];
}

export function addXP(userId: string, amount: number): { leveledUp: boolean; newLevel: number; currentXP: number } {
  const data = fs.readFileSync(xpFile, 'utf8');
  const xpData = JSON.parse(data);
  
  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 1 };
  }
  
  xpData[userId].xp += amount;
  
  const newLevel = calculateLevel(xpData[userId].xp);
  const leveledUp = newLevel > xpData[userId].level;
  xpData[userId].level = newLevel;
  
  fs.writeFileSync(xpFile, JSON.stringify(xpData, null, 2));
  
  return { leveledUp, newLevel, currentXP: xpData[userId].xp };
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function getXPForNextLevel(currentLevel: number): number {
  return getXPForLevel(currentLevel + 1);
}
