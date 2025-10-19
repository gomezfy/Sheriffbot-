const fs = require('fs');
const path = require('path');
const { getItem, addItem, removeItem } = require('./inventoryManager');

const dataDir = path.join(__dirname, '..', 'data');
const economyFile = path.join(dataDir, 'economy.json');
const bountiesFile = path.join(dataDir, 'bounties.json');
const welcomeFile = path.join(dataDir, 'welcome.json');
const logsFile = path.join(dataDir, 'logs.json');
const wantedFile = path.join(dataDir, 'wanted.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize economy file if it doesn't exist
if (!fs.existsSync(economyFile)) {
  fs.writeFileSync(economyFile, JSON.stringify({}, null, 2));
}

// Initialize bounties file if it doesn't exist
if (!fs.existsSync(bountiesFile)) {
  fs.writeFileSync(bountiesFile, JSON.stringify([], null, 2));
}

// Initialize welcome file if it doesn't exist
if (!fs.existsSync(welcomeFile)) {
  fs.writeFileSync(welcomeFile, JSON.stringify({}, null, 2));
}

// Initialize logs file if it doesn't exist
if (!fs.existsSync(logsFile)) {
  fs.writeFileSync(logsFile, JSON.stringify({}, null, 2));
}

// Initialize wanted file if it doesn't exist
if (!fs.existsSync(wantedFile)) {
  fs.writeFileSync(wantedFile, JSON.stringify({}, null, 2));
}

// Economy functions - NOW USING INVENTORY SYSTEM
function getUserGold(userId) {
  // Get Saloon Tokens from inventory
  return getItem(userId, 'saloon_token');
}

function setUserGold(userId, amount) {
  const current = getUserGold(userId);
  const diff = amount - current;
  
  if (diff > 0) {
    // Need to add tokens
    return addItem(userId, 'saloon_token', diff);
  } else if (diff < 0) {
    // Need to remove tokens
    return removeItem(userId, 'saloon_token', Math.abs(diff));
  }
  
  return { success: true, totalQuantity: current };
}

function addUserGold(userId, amount) {
  return addItem(userId, 'saloon_token', amount);
}

function removeUserGold(userId, amount) {
  return removeItem(userId, 'saloon_token', amount);
}

// Silver functions
function getUserSilver(userId) {
  return getItem(userId, 'silver');
}

function setUserSilver(userId, amount) {
  const current = getUserSilver(userId);
  const diff = amount - current;
  
  if (diff > 0) {
    return addItem(userId, 'silver', diff);
  } else if (diff < 0) {
    return removeItem(userId, 'silver', Math.abs(diff));
  }
  
  return { success: true, totalQuantity: current };
}

function addUserSilver(userId, amount) {
  return addItem(userId, 'silver', amount);
}

function removeUserSilver(userId, amount) {
  return removeItem(userId, 'silver', amount);
}

// Bounty functions
function getBounties() {
  const data = fs.readFileSync(bountiesFile, 'utf8');
  return JSON.parse(data);
}

function saveBounties(data) {
  fs.writeFileSync(bountiesFile, JSON.stringify(data, null, 2));
}

function addBounty(targetId, targetTag, posterId, posterTag, amount) {
  const bounties = getBounties();
  
  // Check if bounty already exists for this target
  const existingIndex = bounties.findIndex(b => b.targetId === targetId);
  
  if (existingIndex !== -1) {
    // Update existing bounty - add contributor
    const existingBounty = bounties[existingIndex];
    
    // Check if this poster already contributed
    const contributorIndex = existingBounty.contributors.findIndex(c => c.id === posterId);
    
    if (contributorIndex !== -1) {
      // Poster already contributed, increase their contribution
      existingBounty.contributors[contributorIndex].amount += amount;
    } else {
      // New contributor
      existingBounty.contributors.push({
        id: posterId,
        tag: posterTag,
        amount: amount
      });
    }
    
    // Update total amount
    existingBounty.totalAmount += amount;
    existingBounty.updatedAt = Date.now();
    
    bounties[existingIndex] = existingBounty;
  } else {
    // Create new bounty
    bounties.push({
      targetId,
      targetTag,
      totalAmount: amount,
      contributors: [{
        id: posterId,
        tag: posterTag,
        amount: amount
      }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  
  saveBounties(bounties);
  return bounties;
}

function getBountyByTarget(targetId) {
  const bounties = getBounties();
  return bounties.find(b => b.targetId === targetId);
}

function removeBounty(targetId) {
  const bounties = getBounties();
  const filtered = bounties.filter(b => b.targetId !== targetId);
  saveBounties(filtered);
  return filtered;
}

function getAllBounties() {
  return getBounties();
}

function removeContribution(targetId, contributorId, amount) {
  const bounties = getBounties();
  const bountyIndex = bounties.findIndex(b => b.targetId === targetId);
  
  if (bountyIndex === -1) {
    return false; // Bounty doesn't exist
  }
  
  const bounty = bounties[bountyIndex];
  const contributorIndex = bounty.contributors.findIndex(c => c.id === contributorId);
  
  if (contributorIndex === -1) {
    return false; // Contributor not found
  }
  
  // Remove the specified amount from contributor
  bounty.contributors[contributorIndex].amount -= amount;
  bounty.totalAmount -= amount;
  
  // If contributor's amount is now 0 or less, remove them completely
  if (bounty.contributors[contributorIndex].amount <= 0) {
    bounty.contributors.splice(contributorIndex, 1);
  }
  
  // If no contributors left, remove the entire bounty
  if (bounty.contributors.length === 0) {
    bounties.splice(bountyIndex, 1);
  } else {
    bounty.updatedAt = Date.now();
    bounties[bountyIndex] = bounty;
  }
  
  saveBounties(bounties);
  return true;
}

// Welcome functions
function getWelcomeConfig(guildId) {
  const data = fs.readFileSync(welcomeFile, 'utf8');
  const welcomeData = JSON.parse(data);
  return welcomeData[guildId] || null;
}

function setWelcomeConfig(guildId, config) {
  const data = fs.readFileSync(welcomeFile, 'utf8');
  const welcomeData = JSON.parse(data);
  
  welcomeData[guildId] = {
    channelId: config.channelId,
    message: config.message,
    image: config.image || null,
    enabled: config.enabled !== false,
    updatedAt: Date.now()
  };
  
  fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
  return welcomeData[guildId];
}

function removeWelcomeConfig(guildId) {
  const data = fs.readFileSync(welcomeFile, 'utf8');
  const welcomeData = JSON.parse(data);
  
  delete welcomeData[guildId];
  
  fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
  return true;
}

// Logs functions
function getLogConfig(guildId) {
  const data = fs.readFileSync(logsFile, 'utf8');
  const logsData = JSON.parse(data);
  return logsData[guildId] || null;
}

function setLogConfig(guildId, config) {
  const data = fs.readFileSync(logsFile, 'utf8');
  const logsData = JSON.parse(data);
  
  logsData[guildId] = {
    channelId: config.channelId,
    enabled: config.enabled !== false,
    types: config.types || ['command', 'error', 'welcome', 'leave', 'economy', 'bounty', 'mining', 'gambling', 'admin'],
    updatedAt: Date.now()
  };
  
  fs.writeFileSync(logsFile, JSON.stringify(logsData, null, 2));
  return logsData[guildId];
}

function removeLogConfig(guildId) {
  const data = fs.readFileSync(logsFile, 'utf8');
  const logsData = JSON.parse(data);
  
  delete logsData[guildId];
  
  fs.writeFileSync(logsFile, JSON.stringify(logsData, null, 2));
  return true;
}

// Wanted functions
function getWantedConfig(guildId) {
  const data = fs.readFileSync(wantedFile, 'utf8');
  const wantedData = JSON.parse(data);
  return wantedData[guildId] || null;
}

function setWantedConfig(guildId, config) {
  const data = fs.readFileSync(wantedFile, 'utf8');
  const wantedData = JSON.parse(data);
  
  wantedData[guildId] = {
    channelId: config.channelId,
    enabled: config.enabled !== false,
    updatedAt: Date.now()
  };
  
  fs.writeFileSync(wantedFile, JSON.stringify(wantedData, null, 2));
  return true;
}

function removeWantedConfig(guildId) {
  const data = fs.readFileSync(wantedFile, 'utf8');
  const wantedData = JSON.parse(data);
  
  delete wantedData[guildId];
  
  fs.writeFileSync(wantedFile, JSON.stringify(wantedData, null, 2));
  return true;
}

module.exports = {
  getUserGold,
  setUserGold,
  addUserGold,
  removeUserGold,
  getUserSilver,
  setUserSilver,
  addUserSilver,
  removeUserSilver,
  addBounty,
  getBountyByTarget,
  removeBounty,
  removeContribution,
  getAllBounties,
  getWelcomeConfig,
  setWelcomeConfig,
  removeWelcomeConfig,
  getLogConfig,
  setLogConfig,
  removeLogConfig,
  getWantedConfig,
  setWantedConfig,
  removeWantedConfig
};
