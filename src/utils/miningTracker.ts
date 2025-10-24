import { readData } from './database';

interface MiningSession {
  type: 'solo' | 'coop';
  startTime: number;
  endTime: number;
  claimed: boolean;
  goldAmount: number;
  partnerId: string | null;
}

interface MiningData {
  [userId: string]: MiningSession;
}

/**
 * Get all active mining sessions (not claimed and not expired)
 */
export function getActiveSessions(): { userId: string; session: MiningSession }[] {
  const data: MiningData = readData('mining.json');
  const now = Date.now();
  const activeSessions: { userId: string; session: MiningSession }[] = [];

  for (const [userId, session] of Object.entries(data)) {
    // Only include sessions that are not claimed and not expired
    if (!session.claimed && session.endTime > now) {
      activeSessions.push({ userId, session });
    }
  }

  return activeSessions;
}

/**
 * Get all completed but unclaimed mining sessions
 */
export function getUnclaimedSessions(): { userId: string; session: MiningSession }[] {
  const data: MiningData = readData('mining.json');
  const now = Date.now();
  const unclaimedSessions: { userId: string; session: MiningSession }[] = [];

  for (const [userId, session] of Object.entries(data)) {
    // Sessions that are complete but not claimed
    if (!session.claimed && session.endTime <= now) {
      unclaimedSessions.push({ userId, session });
    }
  }

  return unclaimedSessions;
}

/**
 * Get mining statistics
 */
export function getMiningStats(): {
  totalActive: number;
  soloMining: number;
  coopMining: number;
  unclaimed: number;
  totalGoldPending: number;
} {
  const activeSessions = getActiveSessions();
  const unclaimedSessions = getUnclaimedSessions();

  const soloMining = activeSessions.filter(s => s.session.type === 'solo').length;
  const coopMining = activeSessions.filter(s => s.session.type === 'coop').length;
  const totalGoldPending = [...activeSessions, ...unclaimedSessions]
    .reduce((sum, s) => sum + s.session.goldAmount, 0);

  return {
    totalActive: activeSessions.length,
    soloMining,
    coopMining,
    unclaimed: unclaimedSessions.length,
    totalGoldPending
  };
}

/**
 * Format time remaining
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Clean up old claimed sessions (older than 24 hours)
 */
export function cleanupOldSessions(): number {
  const { writeData } = require('./database');
  const data: MiningData = readData('mining.json');
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  let cleaned = 0;

  for (const [userId, session] of Object.entries(data)) {
    // Remove sessions that are claimed and older than 24 hours
    if (session.claimed && session.endTime < oneDayAgo) {
      delete data[userId];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    writeData('mining.json', data);
  }

  return cleaned;
}
