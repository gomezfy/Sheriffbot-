const path = require('path');

// Custom emoji paths for special items
const CUSTOM_EMOJIS = {
  SALOON_TOKEN: path.join(__dirname, '..', '..', 'assets', 'saloon-token.png'),
};

// Emoji display strings (for text-only contexts)
const EMOJI_TEXT = {
  SALOON_TOKEN: '🎫', // Fallback for Discord embeds and text
  SILVER_COIN: '🪙',
  GOLD_BAR: '🥇',
};

function getCustomEmojiPath(emojiType) {
  return CUSTOM_EMOJIS[emojiType] || null;
}

function getEmojiText(emojiType) {
  return EMOJI_TEXT[emojiType] || '';
}

module.exports = {
  CUSTOM_EMOJIS,
  EMOJI_TEXT,
  getCustomEmojiPath,
  getEmojiText
};
