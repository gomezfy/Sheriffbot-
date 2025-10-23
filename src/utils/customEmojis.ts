import path from 'path';
import { getCustomEmoji } from './emojiUploader';

const projectRoot = path.join(__dirname, '..', '..', '..');
export const CUSTOM_EMOJIS = {
  SALOON_TOKEN: path.join(projectRoot, 'assets', 'saloon-token.png'),
};

// Fallback text emojis (usados se não houver emoji customizado)
export const EMOJI_TEXT = {
  SALOON_TOKEN: '🎫',
  SILVER_COIN: '🪙',
  GOLD_BAR: '🥇',
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
