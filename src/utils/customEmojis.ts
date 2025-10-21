import path from 'path';

/**
 * Custom Emojis System
 * Centralized management for all custom emojis used in the bot
 */

const EMOJI_DIR = path.join(__dirname, '..', '..', 'assets', 'emojis', 'cowboy');

export interface CustomEmoji {
  name: string;
  filename: string;
  path: string;
  description: string;
  animated: boolean;
}

/**
 * All available custom emojis organized by category
 */
export const CUSTOM_EMOJIS = {
  // Reactions & Expressions
  REACTIONS: {
    STARE: {
      name: 'stare',
      filename: '5107-stare.png',
      path: path.join(EMOJI_DIR, '5107-stare.png'),
      description: 'Cowboy staring intensely',
      animated: false
    },
    BLINK: {
      name: 'blink',
      filename: '2716-blink.gif',
      path: path.join(EMOJI_DIR, '2716-blink.gif'),
      description: 'Cowboy blinking',
      animated: true
    },
    WTF_STARE: {
      name: 'wtf_stare',
      filename: '23281-wtf-stare.png',
      path: path.join(EMOJI_DIR, '23281-wtf-stare.png'),
      description: 'Confused cowboy stare',
      animated: false
    },
    YIKES: {
      name: 'yikes',
      filename: '5321-yikescowboy.png',
      path: path.join(EMOJI_DIR, '5321-yikescowboy.png'),
      description: 'Yikes cowboy reaction',
      animated: false
    },
    ASHAMED: {
      name: 'ashamed',
      filename: '1696-pepeashamed.png',
      path: path.join(EMOJI_DIR, '1696-pepeashamed.png'),
      description: 'Ashamed cowboy pepe',
      animated: false
    },
    COWBOYSWEAR: {
      name: 'cowboyswear',
      filename: '4684-cowboyswear.png',
      path: path.join(EMOJI_DIR, '4684-cowboyswear.png'),
      description: 'Cowboy swearing',
      animated: false
    }
  },

  // Happy & Positive
  POSITIVE: {
    AYE: {
      name: 'aye',
      filename: '82140-ayecowboy.png',
      path: path.join(EMOJI_DIR, '82140-ayecowboy.png'),
      description: 'Aye cowboy thumbs up',
      animated: false
    },
    WINK: {
      name: 'wink',
      filename: '56069-cowboywink.png',
      path: path.join(EMOJI_DIR, '56069-cowboywink.png'),
      description: 'Cowboy winking',
      animated: false
    },
    COOL: {
      name: 'cool',
      filename: '32820-cowcool.png',
      path: path.join(EMOJI_DIR, '32820-cowcool.png'),
      description: 'Cool cowboy with sunglasses',
      animated: false
    },
    HEART_EYES: {
      name: 'heart_eyes',
      filename: '46213-cowhearteyes.png',
      path: path.join(EMOJI_DIR, '46213-cowhearteyes.png'),
      description: 'Cowboy with heart eyes',
      animated: false
    },
    HOT: {
      name: 'hot',
      filename: '81253-hot-cowboy.png',
      path: path.join(EMOJI_DIR, '81253-hot-cowboy.png'),
      description: 'Hot/fire cowboy',
      animated: false
    },
    UWU: {
      name: 'uwu',
      filename: '34507-cow-uwu.png',
      path: path.join(EMOJI_DIR, '34507-cow-uwu.png'),
      description: 'Cowboy uwu',
      animated: false
    },
    OWO: {
      name: 'owo',
      filename: '93937-owocowboy.png',
      path: path.join(EMOJI_DIR, '93937-owocowboy.png'),
      description: 'Cowboy owo',
      animated: false
    }
  },

  // Sad & Negative
  NEGATIVE: {
    SAD: {
      name: 'sad',
      filename: '3728-sad-cowboy.png',
      path: path.join(EMOJI_DIR, '3728-sad-cowboy.png'),
      description: 'Sad cowboy',
      animated: false
    },
    SAD_ALT: {
      name: 'sad_alt',
      filename: '5760-ce-sadcowboy.png',
      path: path.join(EMOJI_DIR, '5760-ce-sadcowboy.png'),
      description: 'Sad cowboy alternative',
      animated: false
    }
  },

  // Greetings
  GREETINGS: {
    MEOWDY: {
      name: 'meowdy',
      filename: '8622-meowdy.png',
      path: path.join(EMOJI_DIR, '8622-meowdy.png'),
      description: 'Meowdy greeting',
      animated: false
    },
    MEOWHAW: {
      name: 'meowhaw',
      filename: '4930-meowhaw.png',
      path: path.join(EMOJI_DIR, '4930-meowhaw.png'),
      description: 'Meow haw greeting',
      animated: false
    },
    HAT_TIP: {
      name: 'hat_tip',
      filename: '37739-cowboyhattip.gif',
      path: path.join(EMOJI_DIR, '37739-cowboyhattip.gif'),
      description: 'Cowboy tipping hat',
      animated: true
    },
    YEEHAW: {
      name: 'yeehaw',
      filename: '20418-yeehaw.gif',
      path: path.join(EMOJI_DIR, '20418-yeehaw.gif'),
      description: 'Yeehaw celebration',
      animated: true
    }
  },

  // Animated Actions
  ACTIONS: {
    BOP: {
      name: 'bop',
      filename: '4003_cowboybop.gif',
      path: path.join(EMOJI_DIR, '4003_cowboybop.gif'),
      description: 'Cowboy bopping',
      animated: true
    },
    BONGO: {
      name: 'bongo',
      filename: '9356-cowboybongocat.gif',
      path: path.join(EMOJI_DIR, '9356-cowboybongocat.gif'),
      description: 'Cowboy bongo cat',
      animated: true
    },
    ROLL: {
      name: 'roll',
      filename: '2769-cowrollultrafast.gif',
      path: path.join(EMOJI_DIR, '2769-cowrollultrafast.gif'),
      description: 'Cowboy rolling ultra fast',
      animated: true
    },
    SKATEBOARD: {
      name: 'skateboard',
      filename: '11333-cowskateboardflip.gif',
      path: path.join(EMOJI_DIR, '11333-cowskateboardflip.gif'),
      description: 'Cowboy skateboard flip',
      animated: true
    },
    GOOSE: {
      name: 'goose',
      filename: '1960-peepo-haw-on-a-goose.gif',
      path: path.join(EMOJI_DIR, '1960-peepo-haw-on-a-goose.gif'),
      description: 'Peepo haw riding a goose',
      animated: true
    },
    PEPECOWBOY: {
      name: 'pepecowboy',
      filename: '6424-pepecowboy.gif',
      path: path.join(EMOJI_DIR, '6424-pepecowboy.gif'),
      description: 'Pepe cowboy animated',
      animated: true
    }
  },

  // Special Characters
  CHARACTERS: {
    CAT_COWBOY: {
      name: 'cat_cowboy',
      filename: '2774-cat-cowboy.png',
      path: path.join(EMOJI_DIR, '2774-cat-cowboy.png'),
      description: 'Cat with cowboy hat',
      animated: false
    },
    KIISU: {
      name: 'kiisu',
      filename: '3807-kiisu-cowboy.png',
      path: path.join(EMOJI_DIR, '3807-kiisu-cowboy.png'),
      description: 'Kiisu cowboy',
      animated: false
    },
    BADDIE: {
      name: 'baddie',
      filename: '97914-cowbaddie.png',
      path: path.join(EMOJI_DIR, '97914-cowbaddie.png'),
      description: 'Cowboy baddie',
      animated: false
    },
    EGG: {
      name: 'egg',
      filename: '1705-cowboy-egg.png',
      path: path.join(EMOJI_DIR, '1705-cowboy-egg.png'),
      description: 'Cowboy egg',
      animated: false
    },
    UPSIDE_DOWN: {
      name: 'upside_down',
      filename: '66697-upsidedowncowboy.png',
      path: path.join(EMOJI_DIR, '66697-upsidedowncowboy.png'),
      description: 'Upside down cowboy',
      animated: false
    }
  },

  // Activities
  ACTIVITIES: {
    POPCORN: {
      name: 'popcorn',
      filename: '61132-cowpopcorn.png',
      path: path.join(EMOJI_DIR, '61132-cowpopcorn.png'),
      description: 'Cowboy eating popcorn',
      animated: false
    }
  },

  // Western Items
  ITEMS: {
    GUN: {
      name: 'gun',
      filename: '58699-gun.png',
      path: path.join(EMOJI_DIR, '58699-gun.png'),
      description: 'Western gun',
      animated: false
    },
    BIG_IRON: {
      name: 'big_iron',
      filename: '3092-big-iron-on-his-hip.png',
      path: path.join(EMOJI_DIR, '3092-big-iron-on-his-hip.png'),
      description: 'Big iron on his hip',
      animated: false
    },
    KNIFE: {
      name: 'knife',
      filename: '28978-cowknife.png',
      path: path.join(EMOJI_DIR, '28978-cowknife.png'),
      description: 'Cowboy knife',
      animated: false
    },
    MILK_CARTON: {
      name: 'milk_carton',
      filename: '83757-milkcarton.png',
      path: path.join(EMOJI_DIR, '83757-milkcarton.png'),
      description: 'Milk carton',
      animated: false
    }
  },

  // Symbols & Misc
  SYMBOLS: {
    HEART: {
      name: 'heart',
      filename: '54624-cowheart.png',
      path: path.join(EMOJI_DIR, '54624-cowheart.png'),
      description: 'Cowboy heart',
      animated: false
    },
    TARNATION: {
      name: 'tarnation',
      filename: '2811-what-in-tarnation.png',
      path: path.join(EMOJI_DIR, '2811-what-in-tarnation.png'),
      description: 'What in tarnation',
      animated: false
    },
    RDIA: {
      name: 'rdia',
      filename: '2760_cowboyrdia.png',
      path: path.join(EMOJI_DIR, '2760_cowboyrdia.png'),
      description: 'Cowboy RDIA',
      animated: false
    }
  }
};

/**
 * Get emoji path by category and name
 */
export function getCustomEmojiPath(category: keyof typeof CUSTOM_EMOJIS, emojiName: string): string | null {
  const categoryEmojis = CUSTOM_EMOJIS[category] as Record<string, CustomEmoji>;
  const emoji = Object.values(categoryEmojis).find(e => e.name === emojiName);
  return emoji ? emoji.path : null;
}

/**
 * Get all emojis in a category
 */
export function getEmojisByCategory(category: keyof typeof CUSTOM_EMOJIS): CustomEmoji[] {
  const categoryEmojis = CUSTOM_EMOJIS[category] as Record<string, CustomEmoji>;
  return Object.values(categoryEmojis);
}

/**
 * Get all available emojis
 */
export function getAllEmojis(): CustomEmoji[] {
  const allEmojis: CustomEmoji[] = [];
  
  for (const category of Object.keys(CUSTOM_EMOJIS) as Array<keyof typeof CUSTOM_EMOJIS>) {
    const categoryEmojis = CUSTOM_EMOJIS[category] as Record<string, CustomEmoji>;
    allEmojis.push(...Object.values(categoryEmojis));
  }
  
  return allEmojis;
}

/**
 * Find emoji by name across all categories
 */
export function findEmojiByName(name: string): CustomEmoji | null {
  const allEmojis = getAllEmojis();
  return allEmojis.find(e => e.name === name) || null;
}

/**
 * Get random emoji from a category
 */
export function getRandomEmoji(category?: keyof typeof CUSTOM_EMOJIS): CustomEmoji {
  if (category) {
    const emojis = getEmojisByCategory(category);
    return emojis[Math.floor(Math.random() * emojis.length)];
  }
  
  const allEmojis = getAllEmojis();
  return allEmojis[Math.floor(Math.random() * allEmojis.length)];
}

/**
 * Emoji text mappings for fallback
 */
export const EMOJI_TEXT = {
  SALOON_TOKEN: '🎫',
  SILVER_COIN: '🪙',
  GOLD_BAR: '🥇',
  COWBOY: '🤠',
  GUN: '🔫',
  HEART: '❤️',
  STAR: '⭐',
};

export function getEmojiText(emojiType: keyof typeof EMOJI_TEXT): string {
  return EMOJI_TEXT[emojiType] || '';
}
