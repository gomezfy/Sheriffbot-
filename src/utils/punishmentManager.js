const fs = require('fs');
const path = require('path');

const punishmentFile = path.join(__dirname, '..', 'data', 'punishment.json');

// Ensure file exists
if (!fs.existsSync(punishmentFile)) {
  fs.writeFileSync(punishmentFile, JSON.stringify({}, null, 2));
}

function getPunishments() {
  const data = fs.readFileSync(punishmentFile, 'utf8');
  return JSON.parse(data);
}

function savePunishments(data) {
  fs.writeFileSync(punishmentFile, JSON.stringify(data, null, 2));
}

/**
 * Apply punishment (jail) to a user for 30 minutes
 * @param {string} userId - User ID to punish
 * @param {string} reason - Reason for punishment
 * @returns {object} - Punishment details
 */
function applyPunishment(userId, reason = 'Captured by Sheriff') {
  const punishments = getPunishments();
  const now = Date.now();
  const duration = 30 * 60 * 1000; // 30 minutes in milliseconds
  const expiresAt = now + duration;
  
  punishments[userId] = {
    reason,
    appliedAt: now,
    expiresAt,
    duration
  };
  
  savePunishments(punishments);
  
  return punishments[userId];
}

/**
 * Check if user is currently punished
 * @param {string} userId - User ID to check
 * @returns {object|null} - Punishment details if active, null otherwise
 */
function isPunished(userId) {
  const punishments = getPunishments();
  const punishment = punishments[userId];
  
  if (!punishment) {
    return null;
  }
  
  const now = Date.now();
  
  // Check if punishment expired
  if (now >= punishment.expiresAt) {
    // Remove expired punishment
    delete punishments[userId];
    savePunishments(punishments);
    return null;
  }
  
  return punishment;
}

/**
 * Get remaining time for punishment
 * @param {string} userId - User ID
 * @returns {number|null} - Milliseconds remaining, or null if not punished
 */
function getRemainingTime(userId) {
  const punishment = isPunished(userId);
  if (!punishment) {
    return null;
  }
  
  return punishment.expiresAt - Date.now();
}

/**
 * Remove punishment early (pardon)
 * @param {string} userId - User ID to pardon
 * @returns {boolean} - True if pardoned, false if not punished
 */
function removePunishment(userId) {
  const punishments = getPunishments();
  
  if (!punishments[userId]) {
    return false;
  }
  
  delete punishments[userId];
  savePunishments(punishments);
  return true;
}

/**
 * Format remaining time as human-readable string
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted time (e.g., "15m 30s")
 */
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

module.exports = {
  applyPunishment,
  isPunished,
  getRemainingTime,
  removePunishment,
  formatTime
};
