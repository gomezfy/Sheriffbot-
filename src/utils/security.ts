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
    // Log unauthorized access attempt
    securityLogger.log(SecurityEventType.OWNER_COMMAND_DENIED, interaction.user.id, {
      command: interaction.commandName,
      username: interaction.user.tag
    });
    
    await interaction.reply({
      content: '❌ This command is only available to the bot owner!',
      flags: MessageFlags.Ephemeral
    });
    return false;
  }
  
  // Log successful owner command usage
  securityLogger.log(SecurityEventType.ADMIN_COMMAND_USED, interaction.user.id, {
    command: interaction.commandName,
    type: 'owner'
  });
  
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
 * Validates and sanitizes bio text
 * @param bio Bio text to validate
 * @returns Sanitized bio or null if invalid
 */
export function validateBio(bio: string): string | null {
  if (!bio || bio.trim().length === 0) {
    return null;
  }
  
  // Maximum 500 characters for bio
  if (bio.length > 500) {
    return null;
  }
  
  // Sanitize
  let sanitized = sanitizeInput(bio, 500);
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Validates JSON string safely
 * @param jsonString JSON string to validate
 * @param maxLength Maximum allowed length
 * @returns Parsed object or null if invalid
 */
export function validateJSON(jsonString: string, maxLength: number = 10000): any | null {
  if (!jsonString || jsonString.length > maxLength) {
    return null;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch {
    return null;
  }
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
    'redemption-codes.json',
    'territories.json'
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
 * General command rate limiter
 */
class CommandRateLimiter {
  private cooldowns: Map<string, Map<string, number>> = new Map();
  
  /**
   * Checks if user can execute command
   * @param commandName Command name
   * @param userId User ID
   * @param cooldownMs Cooldown in milliseconds
   * @returns true if allowed, false if on cooldown
   */
  canExecute(commandName: string, userId: string, cooldownMs: number): boolean {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }
    
    const commandCooldowns = this.cooldowns.get(commandName)!;
    const now = Date.now();
    const lastUse = commandCooldowns.get(userId);
    
    if (lastUse && now - lastUse < cooldownMs) {
      return false;
    }
    
    commandCooldowns.set(userId, now);
    
    // Cleanup old entries
    if (commandCooldowns.size > 1000) {
      const fiveMinutesAgo = now - 5 * 60 * 1000;
      for (const [id, timestamp] of commandCooldowns.entries()) {
        if (timestamp < fiveMinutesAgo) {
          commandCooldowns.delete(id);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Gets remaining cooldown time
   * @param commandName Command name
   * @param userId User ID
   * @param cooldownMs Cooldown in milliseconds
   * @returns Remaining cooldown in ms, or 0 if no cooldown
   */
  getRemainingCooldown(commandName: string, userId: string, cooldownMs: number): number {
    const commandCooldowns = this.cooldowns.get(commandName);
    if (!commandCooldowns) return 0;
    
    const lastUse = commandCooldowns.get(userId);
    if (!lastUse) return 0;
    
    const now = Date.now();
    const remaining = cooldownMs - (now - lastUse);
    return remaining > 0 ? remaining : 0;
  }
}

export const commandRateLimiter = new CommandRateLimiter();

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

/**
 * Security event types
 */
export enum SecurityEventType {
  OWNER_COMMAND_DENIED = 'OWNER_COMMAND_DENIED',
  ADMIN_COMMAND_USED = 'ADMIN_COMMAND_USED',
  LARGE_TRANSFER = 'LARGE_TRANSFER',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
}

/**
 * Security event logger
 */
class SecurityLogger {
  private events: Array<{
    timestamp: number;
    type: SecurityEventType;
    userId: string;
    details: any;
  }> = [];
  
  private readonly maxEvents = 1000;
  
  /**
   * Logs a security event
   * @param type Event type
   * @param userId User ID
   * @param details Additional details
   */
  log(type: SecurityEventType, userId: string, details: any = {}): void {
    const event = {
      timestamp: Date.now(),
      type,
      userId,
      details
    };
    
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    // Console log for monitoring
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY] ${timestamp} | ${type} | User: ${userId} | ${JSON.stringify(details)}`);
  }
  
  /**
   * Gets recent security events
   * @param limit Maximum number of events to return
   * @returns Array of recent events
   */
  getRecentEvents(limit: number = 100): Array<any> {
    return this.events.slice(-limit);
  }
  
  /**
   * Gets events for specific user
   * @param userId User ID
   * @param limit Maximum number of events
   * @returns Array of user events
   */
  getUserEvents(userId: string, limit: number = 50): Array<any> {
    return this.events
      .filter(e => e.userId === userId)
      .slice(-limit);
  }
  
  /**
   * Checks for suspicious activity patterns
   * @param userId User ID
   * @returns true if suspicious activity detected
   */
  detectSuspiciousActivity(userId: string): boolean {
    const recentEvents = this.getUserEvents(userId, 20);
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    // Count events in last minute
    const recentCount = recentEvents.filter(e => e.timestamp > oneMinuteAgo).length;
    
    // More than 10 security events in 1 minute is suspicious
    if (recentCount > 10) {
      this.log(SecurityEventType.SUSPICIOUS_ACTIVITY, userId, {
        eventCount: recentCount,
        timeWindow: '1 minute'
      });
      return true;
    }
    
    return false;
  }
}

export const securityLogger = new SecurityLogger();

/**
 * Validates required environment variables at startup
 * @throws Error if validation fails
 */
export function validateEnvironment(): void {
  const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
  const missing: string[] = [];
  const invalid: string[] = [];
  
  // Check required variables
  for (const key of required) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate token format (Discord tokens are typically 70+ characters)
  const token = process.env.DISCORD_TOKEN!;
  if (token.length < 50) {
    invalid.push('DISCORD_TOKEN (too short, appears invalid)');
  }
  
  // Validate client ID format (should be numeric snowflake)
  const clientId = process.env.DISCORD_CLIENT_ID!;
  if (!/^\d{17,20}$/.test(clientId)) {
    invalid.push('DISCORD_CLIENT_ID (should be 17-20 digit number)');
  }
  
  // Validate optional but important variables
  const ownerId = process.env.OWNER_ID;
  if (ownerId && !/^\d{17,20}$/.test(ownerId)) {
    console.warn('⚠️  OWNER_ID format appears invalid (should be 17-20 digit number)');
  }
  
  if (invalid.length > 0) {
    console.error('❌ Invalid environment variables:');
    invalid.forEach(msg => console.error(`   - ${msg}`));
    throw new Error(`Invalid environment variables detected`);
  }
  
  console.log('✅ Environment variables validated successfully');
}

/**
 * Gets safe environment info for logging (without exposing secrets)
 */
export function getSafeEnvironmentInfo(): any {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    hasToken: !!process.env.DISCORD_TOKEN,
    hasClientId: !!process.env.DISCORD_CLIENT_ID,
    hasOwnerId: !!process.env.OWNER_ID,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
    hasHotmart: !!process.env.HOTMART_CLIENT_ID,
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}
