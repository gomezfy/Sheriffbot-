# 🤠 Sheriff Rex Custom Emojis Guide

Complete reference for all 38 custom Western-themed emojis available in Sheriff Rex Bot.

## 📊 Categories Overview

- **Reactions & Expressions** (6 emojis)
- **Happy & Positive** (7 emojis)
- **Sad & Negative** (2 emojis)
- **Greetings** (4 emojis)
- **Animated Actions** (6 emojis)
- **Special Characters** (5 emojis)
- **Activities** (1 emoji)
- **Western Items** (4 emojis)
- **Symbols & Misc** (3 emojis)

---

## 😊 Reactions & Expressions

| Name | File | Type | Description |
|------|------|------|-------------|
| stare | 5107-stare.png | Static | Cowboy staring intensely |
| blink | 2716-blink.gif | Animated | Cowboy blinking |
| wtf_stare | 23281-wtf-stare.png | Static | Confused cowboy stare |
| yikes | 5321-yikescowboy.png | Static | Yikes cowboy reaction |
| ashamed | 1696-pepeashamed.png | Static | Ashamed cowboy pepe |
| cowboyswear | 4684-cowboyswear.png | Static | Cowboy swearing |

---

## ✨ Happy & Positive

| Name | File | Type | Description |
|------|------|------|-------------|
| aye | 82140-ayecowboy.png | Static | Aye cowboy thumbs up |
| wink | 56069-cowboywink.png | Static | Cowboy winking |
| cool | 32820-cowcool.png | Static | Cool cowboy with sunglasses |
| heart_eyes | 46213-cowhearteyes.png | Static | Cowboy with heart eyes |
| hot | 81253-hot-cowboy.png | Static | Hot/fire cowboy |
| uwu | 34507-cow-uwu.png | Static | Cowboy uwu |
| owo | 93937-owocowboy.png | Static | Cowboy owo |

---

## 😢 Sad & Negative

| Name | File | Type | Description |
|------|------|------|-------------|
| sad | 3728-sad-cowboy.png | Static | Sad cowboy |
| sad_alt | 5760-ce-sadcowboy.png | Static | Sad cowboy alternative |

---

## 👋 Greetings

| Name | File | Type | Description |
|------|------|------|-------------|
| meowdy | 8622-meowdy.png | Static | Meowdy greeting |
| meowhaw | 4930-meowhaw.png | Static | Meow haw greeting |
| hat_tip | 37739-cowboyhattip.gif | Animated | Cowboy tipping hat |
| yeehaw | 20418-yeehaw.gif | Animated | Yeehaw celebration |

---

## 🎬 Animated Actions

| Name | File | Type | Description |
|------|------|------|-------------|
| bop | 4003_cowboybop.gif | Animated | Cowboy bopping |
| bongo | 9356-cowboybongocat.gif | Animated | Cowboy bongo cat |
| roll | 2769-cowrollultrafast.gif | Animated | Cowboy rolling ultra fast |
| skateboard | 11333-cowskateboardflip.gif | Animated | Cowboy skateboard flip |
| goose | 1960-peepo-haw-on-a-goose.gif | Animated | Peepo haw riding a goose |
| pepecowboy | 6424-pepecowboy.gif | Animated | Pepe cowboy animated |

---

## 👤 Special Characters

| Name | File | Type | Description |
|------|------|------|-------------|
| cat_cowboy | 2774-cat-cowboy.png | Static | Cat with cowboy hat |
| kiisu | 3807-kiisu-cowboy.png | Static | Kiisu cowboy |
| baddie | 97914-cowbaddie.png | Static | Cowboy baddie |
| egg | 1705-cowboy-egg.png | Static | Cowboy egg |
| upside_down | 66697-upsidedowncowboy.png | Static | Upside down cowboy |

---

## 🎮 Activities

| Name | File | Type | Description |
|------|------|------|-------------|
| popcorn | 61132-cowpopcorn.png | Static | Cowboy eating popcorn |

---

## 🔫 Western Items

| Name | File | Type | Description |
|------|------|------|-------------|
| gun | 58699-gun.png | Static | Western gun |
| big_iron | 3092-big-iron-on-his-hip.png | Static | Big iron on his hip |
| knife | 28978-cowknife.png | Static | Cowboy knife |
| milk_carton | 83757-milkcarton.png | Static | Milk carton |

---

## 🌟 Symbols & Misc

| Name | File | Type | Description |
|------|------|------|-------------|
| heart | 54624-cowheart.png | Static | Cowboy heart |
| tarnation | 2811-what-in-tarnation.png | Static | What in tarnation |
| rdia | 2760_cowboyrdia.png | Static | Cowboy RDIA |

---

## 🎨 Usage

### In Code

```typescript
import { CUSTOM_EMOJIS, findEmojiByName, getRandomEmoji } from './utils/customEmojis';

// Get a specific emoji
const winkEmoji = CUSTOM_EMOJIS.POSITIVE.WINK;
console.log(winkEmoji.path); // Path to the emoji file

// Find by name
const sadEmoji = findEmojiByName('sad');

// Get random emoji
const randomEmoji = getRandomEmoji();
const randomGreeting = getRandomEmoji('GREETINGS');
```

### In Discord Commands

Use the `/emojis` command to browse all available emojis:
- `/emojis` - View all emojis organized by category
- `/emojis category:Reactions` - View only reaction emojis
- `/emojis category:Greetings` - View only greeting emojis

---

## 📦 Source

These emojis come from two packs:
1. **RDR2 Emoji Pack** (16 emojis) - Red Dead Redemption themed
2. **Cat Boy Cracker Barrel Pack** (24 emojis) - Western cat-themed

All emojis are stored in: `assets/emojis/cowboy/`

---

## 🔧 Adding New Emojis

1. Place emoji files in `assets/emojis/cowboy/`
2. Update `src/utils/customEmojis.ts`
3. Add to appropriate category
4. Include name, filename, path, description, and animated flag

---

**Sheriff Rex Bot** 🤠 • Making Discord Western since 2025
