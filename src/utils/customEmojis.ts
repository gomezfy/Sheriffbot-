import path from 'path';

export const CUSTOM_EMOJIS = {
  SALOON_TOKEN: path.join(__dirname, '..', '..', 'assets', 'saloon-token.png'),
};

export const EMOJI_TEXT = {
  SALOON_TOKEN: '🎫',
  SILVER_COIN: '🪙',
  GOLD_BAR: '🥇',
};

export function getCustomEmojiPath(emojiType: keyof typeof CUSTOM_EMOJIS): string | null {
  return CUSTOM_EMOJIS[emojiType] || null;
}

export function getEmojiText(emojiType: keyof typeof EMOJI_TEXT): string {
  return EMOJI_TEXT[emojiType] || '';
}
