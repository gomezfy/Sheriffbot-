const path = require('path');
const fs = require('fs');

// Emoji to filename mapping
const EMOJI_MAP = {
  // Essential emojis (PNG)
  '😊': 'smile.png',
  '😎': 'sunglasses.png',
  '🤠': 'cowboy.png',
  '⭐': 'star.png',
  '💰': 'moneybag.png',
  '🎯': 'target.png',
  '🏆': 'trophy.png',
  '⚡': 'lightning.png',
  '✨': 'sparkles.png',
  '🔥': 'fire.png',
  '💎': 'gem.png',
  '🎲': 'dice.png',
  '🎰': 'slot.png',
  '🌵': 'cactus.png',
  '🏜️': 'desert.png',
  '🔫': 'gun.png',
  '🐴': 'horse.png',
  '🌟': 'glowing-star.png',
  '💪': 'muscle.png',
  '🎉': 'party.png',
  
  // Extra emojis (PNG)
  '❤️': 'heart.png',
  '👑': 'crown.png',
  '🚀': 'rocket.png',
  '🎮': 'gamepad.png',
  '🍺': 'beer.png',
  '🌙': 'moon.png',
  '☀️': 'sun.png',
  '🌈': 'rainbow.png',
  '💀': 'skull.png',
  '🎪': 'circus.png',
  
  // Animated emojis (GIF) - Meme Pack
  '🐱': 'vibing-cat.gif',       // Vibing cat
  '😂': 'lmao.gif',             // LMAO (laughing)
  '👋': 'wave.gif',             // Wave
  '🇫': 'f.gif',                 // F (pay respects)
  '🚫': 'ban.gif',              // Ban hammer
  '🕹️': 'mario-dance.gif',      // Mario dancing
  '🥇': 'number-one.gif',        // Number one
  '📈': 'boost.gif',            // Boost/stonks
  '⏰': 'alarm.gif',            // Alarm
  '🔤': 'wordle.gif',           // Wordle
  '👨‍💼': 'owner-crown.gif',      // Owner crown
  
  // RDR2/Western Pack (GIF)
  '🥁': 'cowboy-bongo.gif',     // Cowboy bongo cat
  '😑': 'blink.gif',            // Blink/stare
  '🕺': 'cowboy-bop.gif',       // Cowboy dancing
  '🦆': 'yeehaw-goose.gif',     // Yeehaw goose
  
  // RDR2/Western Pack (PNG)
  '🤗': 'meowdy.png',           // Meowdy (cat tip hat)
  '🎩': 'cat-cowboy-hat.png',   // Cat with cowboy hat
  '🐈': 'cat-cowboy.png',       // Cat cowboy full
  '👍': 'aye-cowboy.png',       // Aye cowboy thumbs up
  '😢': 'sad-cowboy.png',       // Sad cowboy
  '😬': 'yikes-cowboy.png',     // Yikes cowboy
  '😳': 'wtf-stare.png',        // WTF stare
  '👀': 'stare.png',            // Intense stare
  '😔': 'ashamed.png',          // Ashamed/pepe sad
  '🔫': 'revolver.png',         // Revolver (replaces gun.png)
  '🎸': 'cowboy-rdia.png',      // Cowboy RDIA
  '⚔️': 'big-iron.png',         // Big iron on hip
};

const EMOJI_DIR = path.join(__dirname, '..', '..', 'assets', 'emojis');

function getEmojiPath(emoji) {
  const filename = EMOJI_MAP[emoji];
  if (!filename) return null;
  
  const filepath = path.join(EMOJI_DIR, filename);
  
  // Check if file exists
  if (fs.existsSync(filepath)) {
    return filepath;
  }
  
  return null;
}

function hasEmojis(text) {
  if (!text) return false;
  
  for (const emoji of Object.keys(EMOJI_MAP)) {
    if (text.includes(emoji)) {
      return true;
    }
  }
  
  return false;
}

function parseTextWithEmojis(text) {
  if (!text) return [];
  
  const parts = [];
  let currentText = '';
  
  // Convert string to array of characters (handles multi-byte emoji correctly)
  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    // Check if this is an emoji we support
    if (EMOJI_MAP[char]) {
      // Save accumulated text
      if (currentText) {
        parts.push({ type: 'text', value: currentText });
        currentText = '';
      }
      
      // Add emoji
      parts.push({ type: 'emoji', value: char, path: getEmojiPath(char) });
    } else {
      currentText += char;
    }
  }
  
  // Add remaining text
  if (currentText) {
    parts.push({ type: 'text', value: currentText });
  }
  
  return parts;
}

module.exports = {
  EMOJI_MAP,
  getEmojiPath,
  hasEmojis,
  parseTextWithEmojis
};
