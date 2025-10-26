import { readData, writeData } from './database';
import { Client, EmbedBuilder } from 'discord.js';
import { 
  getGoldBarEmoji,
  getCheckEmoji,
  getMoneybagEmoji,
  getGemEmoji
} from './customEmojis';

interface MiningSession {
  type: 'solo' | 'coop';
  startTime: number;
  endTime: number;
  claimed: boolean;
  goldAmount: number;
  partnerId: string | null;
  notified?: boolean; // Track if user was notified via DM
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

/**
 * Check for completed mining sessions and send DM notifications
 */
export async function notifyCompletedMining(client: Client): Promise<number> {
  try {
    const data: MiningData = readData('mining.json');
    const now = Date.now();
    let notified = 0;
    let dataModified = false;

    for (const [userId, session] of Object.entries(data)) {
      // Only notify if: mining complete, not claimed, and not already notified
      if (!session.claimed && session.endTime <= now && !session.notified) {
        try {
          const user = await client.users.fetch(userId);
          const goldEmoji = getGoldBarEmoji();

          const checkEmoji = getCheckEmoji();
          const moneybagEmoji = getMoneybagEmoji();
          const gemEmoji = getGemEmoji();

          const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`${checkEmoji} MINERAÇÃO COMPLETA!`)
            .setDescription(`Sua operação de mineração foi concluída!\n\n${moneybagEmoji} **Recompensa:** ${session.goldAmount} ${goldEmoji} Gold Bar${session.goldAmount > 1 ? 's' : ''}!`)
            .addFields(
              {
                name: '⛏️ Tipo de Mineração',
                value: session.type === 'solo' ? '⛏️ Solo Mining' : '👥 Cooperative Mining',
                inline: true
              },
              {
                name: `${gemEmoji} Ouro Disponível`,
                value: `${session.goldAmount} ${goldEmoji}`,
                inline: true
              }
            )
            .setFooter({ text: 'Use /mine para coletar seu ouro!' })
            .setTimestamp();

          await user.send({ embeds: [embed] });

          // Mark as notified
          session.notified = true;
          dataModified = true;
          notified++;

          console.log(`⛏️ Sent mining completion DM to ${user.tag}`);
        } catch (error) {
          console.error(`❌ Failed to send mining DM to user ${userId}:`, error);
          // Mark as notified anyway to avoid spam attempts
          session.notified = true;
          dataModified = true;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Save updated data if any session was modified (success or failure)
    if (dataModified) {
      writeData('mining.json', data);
    }

    return notified;
  } catch (error) {
    console.error('❌ Error in notifyCompletedMining:', error);
    return 0;
  }
}

/**
 * Start automatic mining notification system
 * Checks every 2 minutes for completed mining sessions
 */
export function startMiningNotifications(client: Client): NodeJS.Timeout {
  console.log('⛏️ Starting automatic mining notification system');

  // Run immediately on startup
  notifyCompletedMining(client).catch(error => {
    console.error('❌ Error in initial mining notification check:', error);
  });

  // Then check every 2 minutes
  const interval = setInterval(async () => {
    try {
      const notified = await notifyCompletedMining(client);
      if (notified > 0) {
        console.log(`⛏️ Notified ${notified} users about completed mining`);
      }
    } catch (error) {
      console.error('❌ Error in mining notification interval:', error);
    }
  }, 2 * 60 * 1000); // Check every 2 minutes

  return interval;
}
