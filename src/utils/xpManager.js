const fs = require('fs');
const path = require('path');

const xpFile = path.join(__dirname, '..', 'data', 'xp.json');

if (!fs.existsSync(xpFile)) {
  fs.writeFileSync(xpFile, JSON.stringify({}, null, 2));
}

function getUserXP(userId) {
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

function addXP(userId, amount) {
  const data = fs.readFileSync(xpFile, 'utf8');
  const xpData = JSON.parse(data);
  
  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 1 };
  }
  
  xpData[userId].xp += amount;
  
  // Calculate level based on XP
  const newLevel = calculateLevel(xpData[userId].xp);
  const leveledUp = newLevel > xpData[userId].level;
  xpData[userId].level = newLevel;
  
  fs.writeFileSync(xpFile, JSON.stringify(xpData, null, 2));
  
  return { leveledUp, newLevel, currentXP: xpData[userId].xp };
}

function calculateLevel(xp) {
  // Formula: Level = floor(sqrt(XP / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getXPForLevel(level) {
  // XP needed to reach this level
  return Math.pow(level - 1, 2) * 100;
}

function getXPForNextLevel(currentLevel) {
  return getXPForLevel(currentLevel + 1);
}

module.exports = {
  getUserXP,
  addXP,
  calculateLevel,
  getXPForLevel,
  getXPForNextLevel
};
