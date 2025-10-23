/**
 * Security utilities for Sheriff Bot
 * Provides centralized security checks and validation
 */

import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';

// Maximum safe integer for economy operations (1 billion)
export const MAX_CURRENCY_AMOUNT = 1_000_000_000;

// Maximum safe bet amount for gambling (10 million)
export const MAX_BET_AMOUNT = 10_000_000;

// Maximum bounty amount (100 million)
export const MAX_BOUNTY_AMOUNT = 100_000_000;

/**
 * Validates that OWNER_ID environment variable is set
 * @returns OWNER_ID if valid, null if not set
 */
export function validateOwnerId(): string | null {
  const ownerId = process.env.OWNER_ID;
  
  if (!ownerId || ownerId.trim() === '') {
    console.error('🚨 CRITICAL SECURITY: OWNER_ID environment variable not set!');
    return null;
  }
  
  return ownerId;
}

/**
 * Checks if user is the bot owner
 * @param interaction Discord interaction
 * @returns true if user is owner, false otherwise
 */
export async function isOwner(interaction: ChatInputCommandInteraction): Promise<boolean> {
  const ownerId = validateOwnerId();
  
  if (!ownerId) {
    await interaction.reply({
      content: '❌ Bot misconfiguration: Owner ID not set. Contact administrator.',
      flags: MessageFlags.Ephemeral
    });
    return false;
  }
  
  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: '❌ This command is only available to the bot owner!',
      flags: MessageFlags.Ephemeral
    });
    return false;
  }
  
  return true;
}

/**
 * Validates currency amount is within safe limits
 * @param amount Amount to validate
 * @param maxAmount Maximum allowed amount (default: MAX_CURRENCY_AMOUNT)
 * @returns true if valid, false otherwise
 */
export function isValidCurrencyAmount(amount: number, maxAmount: number = MAX_CURRENCY_AMOUNT): boolean {
  return (
    Number.isInteger(amount) &&
    amount > 0 &&
    amount <= maxAmount &&
    Number.isSafeInteger(amount)
  );
}

/**
 * Validates bet amount is within safe limits
 * @param amount Bet amount to validate
 * @returns true if valid, false otherwise
 */
export function isValidBetAmount(amount: number): boolean {
  return isValidCurrencyAmount(amount, MAX_BET_AMOUNT);
}

/**
 * Validates bounty amount is within safe limits
 * @param amount Bounty amount to validate
 * @returns true if valid, false otherwise
 */
export function isValidBountyAmount(amount: number): boolean {
  return isValidCurrencyAmount(amount, MAX_BOUNTY_AMOUNT);
}

/**
 * Sanitizes user input to prevent injection attacks
 * @param input User input string
 * @param maxLength Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (!input) return '';
  
  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Validates redemption code format
 * @param code Redemption code to validate
 * @returns true if valid format, false otherwise
 */
export function isValidRedemptionCode(code: string): boolean {
  // Must start with SHERIFF- and contain only alphanumeric, dash, underscore
  // Maximum length: 100 characters
  const codeRegex = /^SHERIFF-[A-Z0-9_-]{1,90}$/;
  return codeRegex.test(code) && code.length <= 100;
}

/**
 * Validates filename to prevent path traversal
 * @param filename Filename to validate
 * @returns true if valid, false otherwise
 */
export function isValidDataFilename(filename: string): boolean {
  const allowedFiles = [
    'daily.json',
    'economy.json',
    'economy.backup.json',
    'profiles.json',
    'xp.json',
    'inventory.json',
    'wanted.json',
    'welcome.json',
    'logs.json',
    'bounties.json',
    'backgrounds.json',
    'punishment.json',
    'mining.json',
    'work.json',
    'redemption-codes.json'
  ];
  
  return allowedFiles.includes(filename);
}

/**
 * Rate limiter for admin commands
 */
class AdminRateLimiter {
  private cooldowns: Map<string, number> = new Map();
  private readonly cooldownMs: number = 1000; // 1 second between admin commands
  
  /**
   * Checks if user can execute admin command
   * @param userId User ID to check
   * @returns true if allowed, false if on cooldown
   */
  canExecute(userId: string): boolean {
    const now = Date.now();
    const lastUse = this.cooldowns.get(userId);
    
    if (lastUse && now - lastUse < this.cooldownMs) {
      return false;
    }
    
    this.cooldowns.set(userId, now);
    
    // Cleanup old entries (older than 5 minutes)
    if (this.cooldowns.size > 100) {
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      for (const [id, timestamp] of this.cooldowns.entries()) {
        if (timestamp < fiveMinutesAgo) {
          this.cooldowns.delete(id);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Gets remaining cooldown time in milliseconds
   * @param userId User ID to check
   * @returns Remaining cooldown time in ms, or 0 if no cooldown
   */
  getRemainingCooldown(userId: string): number {
    const now = Date.now();
    const lastUse = this.cooldowns.get(userId);
    
    if (!lastUse) return 0;
    
    const remaining = this.cooldownMs - (now - lastUse);
    return remaining > 0 ? remaining : 0;
  }
}

export const adminRateLimiter = new AdminRateLimiter();

/**
 * Validates and sanitizes announcement message
 * @param message Message to validate
 * @returns Sanitized message or null if invalid
 */
export function validateAnnouncementMessage(message: string): string | null {
  if (!message || message.trim().length === 0) {
    return null;
  }
  
  // Maximum 4000 characters (Discord embed description limit)
  if (message.length > 4000) {
    return null;
  }
  
  // Replace escaped newlines
  let sanitized = message.replace(/\\n/g, '\n');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Checks if amount would cause integer overflow
 * @param current Current amount
 * @param addition Amount to add
 * @returns true if safe, false if would overflow
 */
export function isSafeAddition(current: number, addition: number): boolean {
  const result = current + addition;
  return Number.isSafeInteger(result) && result <= MAX_CURRENCY_AMOUNT;
}

/**
 * Checks if multiplication would cause integer overflow
 * @param value Value to multiply
 * @param multiplier Multiplier
 * @returns true if safe, false if would overflow
 */
export function isSafeMultiplication(value: number, multiplier: number): boolean {
  const result = value * multiplier;
  return Number.isSafeInteger(result) && result <= MAX_CURRENCY_AMOUNT;
}

/**
 * Sanitizes error message for logging (removes sensitive info)
 * @param error Error object or message
 * @returns Sanitized error message
 */
export function sanitizeErrorForLogging(error: any): string {
  if (!error) return 'Unknown error';
  
  let message = error.message || String(error);
  
  // Remove file paths
  message = message.replace(/\/[^\s]+\/(src|node_modules)\/[^\s]+/g, '[PATH_REDACTED]');
  
  // Remove potential tokens or secrets (anything that looks like a long hex string)
  message = message.replace(/[a-f0-9]{32,}/gi, '[TOKEN_REDACTED]');
  
  // Remove environment variable values
  message = message.replace(/process\.env\.[A-Z_]+\s*=\s*['"][^'"]+['"]/g, 'process.env.[REDACTED]');
  
  return message;
}

/**
 * Transaction lock manager to prevent race conditions
 */
class TransactionLockManager {
  private locks: Map<string, Promise<void>> = new Map();
  
  /**
   * Acquires a lock for user IDs
   * @param userIds Array of user IDs to lock
   * @returns Release function to call when done
   */
  async acquire(userIds: string[]): Promise<() => void> {
    // Sort user IDs to prevent deadlocks
    const sortedIds = [...userIds].sort();
    const lockKey = sortedIds.join(':');
    
    // Wait for existing lock
    while (this.locks.has(lockKey)) {
      await this.locks.get(lockKey);
      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Create new lock
    let releaseLock: () => void;
    const lockPromise = new Promise<void>(resolve => {
      releaseLock = resolve;
    });
    
    this.locks.set(lockKey, lockPromise);
    
    // Return release function
    return () => {
      this.locks.delete(lockKey);
      releaseLock!();
    };
  }
}

export const transactionLockManager = new TransactionLockManager();
