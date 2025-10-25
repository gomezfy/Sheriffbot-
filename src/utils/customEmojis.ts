import path from 'path';
import { getDataPath } from './database';
import { getCustomEmoji } from './emojiUploader';

export const CUSTOM_EMOJIS = {
  SALOON_TOKEN: getDataPath('assets', 'saloon-token.png'),
  SILVER_COIN: getDataPath('assets', 'silver-coin.png'),
  GOLD_BAR: getDataPath('assets', 'gold-bar.png'),
  // Novos custom emojis
  ALARM: getDataPath('assets', 'custom-emojis', 'alarm.png'),
  BACKPACK: getDataPath('assets', 'custom-emojis', 'backpack.png'),
  BALANCE: getDataPath('assets', 'custom-emojis', 'balance.png'),
  BANK: getDataPath('assets', 'custom-emojis', 'bank.png'),
  BRIEFCASE: getDataPath('assets', 'custom-emojis', 'briefcase.png'),
  BRONZE_MEDAL: getDataPath('assets', 'custom-emojis', 'bronze_medal.png'),
  CANCEL: getDataPath('assets', 'custom-emojis', 'cancel.png'),
  CHECK: getDataPath('assets', 'custom-emojis', 'check.png'),
  CLOCK: getDataPath('assets', 'custom-emojis', 'clock.png'),
  COWBOY_HORSE: getDataPath('assets', 'custom-emojis', 'cowboy_horse.png'),
  COWBOYS: getDataPath('assets', 'custom-emojis', 'cowboys.png'),
  CRATE: getDataPath('assets', 'custom-emojis', 'crate.png'),
  CROSS: getDataPath('assets', 'custom-emojis', 'cross.png'),
  CURRENCY: getDataPath('assets', 'custom-emojis', 'currency.png'),
  DART: getDataPath('assets', 'custom-emojis', 'dart.png'),
  DIAMOND: getDataPath('assets', 'custom-emojis', 'diamond.png'),
  DUST: getDataPath('assets', 'custom-emojis', 'dust.png'),
  GOLD_MEDAL: getDataPath('assets', 'custom-emojis', 'gold_medal.png'),
  INFO: getDataPath('assets', 'custom-emojis', 'info.png'),
  LIGHTNING: getDataPath('assets', 'custom-emojis', 'lightning.png'),
  MONEYBAG: getDataPath('assets', 'custom-emojis', 'moneybag.png'),
  MUTE: getDataPath('assets', 'custom-emojis', 'mute.png'),
  REVOLVER: getDataPath('assets', 'custom-emojis', 'revolver.png'),
  RUNNING_COWBOY: getDataPath('assets', 'custom-emojis', 'running_cowboy.png'),
  SCROLL: getDataPath('assets', 'custom-emojis', 'scroll.png'),
  SILVER_MEDAL: getDataPath('assets', 'custom-emojis', 'silver_medal.png'),
  SPARKLES: getDataPath('assets', 'custom-emojis', 'sparkles.png'),
  STAR: getDataPath('assets', 'custom-emojis', 'star.png'),
  STATS: getDataPath('assets', 'custom-emojis', 'stats.png'),
  TIMER: getDataPath('assets', 'custom-emojis', 'timer.png'),
  WARNING: getDataPath('assets', 'custom-emojis', 'warning.png'),
};

// Fallback text emojis (usados se não houver emoji customizado)
export const EMOJI_TEXT = {
  SALOON_TOKEN: '🎫',
  SILVER_COIN: '🪙',
  GOLD_BAR: '🥇',
  ALARM: '🚨',
  BACKPACK: '🎒',
  BALANCE: '⚖️',
  BANK: '🏦',
  BRIEFCASE: '💼',
  BRONZE_MEDAL: '🥉',
  CANCEL: '❌',
  CHECK: '✅',
  CLOCK: '🕐',
  COWBOY_HORSE: '🏇',
  COWBOYS: '👥',
  CRATE: '📦',
  CROSS: '❌',
  CURRENCY: '💱',
  DART: '🎯',
  DIAMOND: '💎',
  DUST: '💨',
  GOLD_MEDAL: '🥇',
  INFO: 'ℹ️',
  LIGHTNING: '⚡',
  MONEYBAG: '💰',
  MUTE: '🔇',
  REVOLVER: '🔫',
  RUNNING_COWBOY: '🏃',
  SCROLL: '📜',
  SILVER_MEDAL: '🥈',
  SPARKLES: '✨',
  STAR: '⭐',
  STATS: '📊',
  TIMER: '⏱️',
  WARNING: '⚠️',
};

/**
 * Obtém um emoji customizado do Discord ou retorna o fallback text
 * @param emojiName Nome do emoji (ex: 'gold_bar', 'silver_coin')
 * @param fallback Emoji de texto para usar se não houver customizado
 */
export function getEmoji(emojiName: string, fallback?: string): string {
  // Tenta obter o emoji customizado do mapeamento
  const textFallback = fallback || EMOJI_TEXT[emojiName as keyof typeof EMOJI_TEXT] || '❓';
  return getCustomEmoji(emojiName, textFallback);
}

export function getCustomEmojiPath(emojiType: keyof typeof CUSTOM_EMOJIS): string | null {
  return CUSTOM_EMOJIS[emojiType] || null;
}

export function getEmojiText(emojiType: keyof typeof EMOJI_TEXT): string {
  return EMOJI_TEXT[emojiType] || '';
}

/**
 * Obtém o emoji de moeda de prata (customizado ou fallback)
 */
export function getSilverCoinEmoji(): string {
  return getEmoji('silver_coin', '🪙');
}

/**
 * Obtém o emoji de barra de ouro (customizado ou fallback)
 */
export function getGoldBarEmoji(): string {
  return getEmoji('gold_bar', '🥇');
}

/**
 * Obtém o emoji de token do saloon (customizado ou fallback)
 */
export function getSaloonTokenEmoji(): string {
  return getEmoji('saloon_token', '🎫');
}

// Funções auxiliares para os novos custom emojis
export function getAlarmEmoji(): string { return getEmoji('alarm', '🚨'); }
// Status indicators (mantidos como texto pois são cores de status universal do Discord)
export function getGreenCircle(): string { return '🟢'; }
export function getRedCircle(): string { return '🔴'; }
export function getYellowCircle(): string { return '🟡'; }
// Emojis comuns (mantidos como texto para compatibilidade universal)
export function getGiftEmoji(): string { return '🎁'; }
export function getClipboardEmoji(): string { return '📋'; }
export function getPartyEmoji(): string { return '🎉'; }
export function getBuildingEmoji(): string { return '🏛️'; }
export function getCowboyEmoji(): string { return '🤠'; }
export function getSlotMachineEmoji(): string { return '🎰'; }
export function getPickaxeEmoji(): string { return '⛏️'; }
export function getTrophyEmoji(): string { return '🏆'; }
export function getBackpackEmoji(): string { return getEmoji('backpack', '🎒'); }
export function getBalanceEmoji(): string { return getEmoji('balance', '⚖️'); }
export function getBankEmoji(): string { return getEmoji('bank', '🏦'); }
export function getBriefcaseEmoji(): string { return getEmoji('briefcase', '💼'); }
export function getBronzeMedalEmoji(): string { return getEmoji('bronze_medal', '🥉'); }
export function getCancelEmoji(): string { return getEmoji('cancel', '❌'); }
export function getCheckEmoji(): string { return getEmoji('check', '✅'); }
export function getClockEmoji(): string { return getEmoji('clock', '🕐'); }
export function getCowboyHorseEmoji(): string { return getEmoji('cowboy_horse', '🏇'); }
export function getCowboysEmoji(): string { return getEmoji('cowboys', '👥'); }
export function getCrateEmoji(): string { return getEmoji('crate', '📦'); }
export function getCrossEmoji(): string { return getEmoji('cross', '❌'); }
export function getCurrencyEmoji(): string { return getEmoji('currency', '💱'); }
export function getDartEmoji(): string { return getEmoji('dart', '🎯'); }
export function getDiamondEmoji(): string { return getEmoji('diamond', '💎'); }
export function getDustEmoji(): string { return getEmoji('dust', '💨'); }
export function getGoldMedalEmoji(): string { return getEmoji('gold_medal', '🥇'); }
export function getInfoEmoji(): string { return getEmoji('info', 'ℹ️'); }
export function getLightningEmoji(): string { return getEmoji('lightning', '⚡'); }
export function getMoneybagEmoji(): string { return getEmoji('moneybag', '💰'); }
export function getMuteEmoji(): string { return getEmoji('mute', '🔇'); }
export function getRevolverEmoji(): string { return getEmoji('revolver', '🔫'); }
export function getRunningCowboyEmoji(): string { return getEmoji('running_cowboy', '🏃'); }
export function getScrollEmoji(): string { return getEmoji('scroll', '📜'); }
export function getSilverMedalEmoji(): string { return getEmoji('silver_medal', '🥈'); }
export function getSparklesEmoji(): string { return getEmoji('sparkles', '✨'); }
export function getStarEmoji(): string { return getEmoji('star', '⭐'); }
export function getStatsEmoji(): string { return getEmoji('stats', '📊'); }
export function getTimerEmoji(): string { return getEmoji('timer', '⏱️'); }
export function getWarningEmoji(): string { return getEmoji('warning', '⚠️'); }
