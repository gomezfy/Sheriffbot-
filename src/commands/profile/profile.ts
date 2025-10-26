import { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, User } from 'discord.js';
import { getInventory } from '../../utils/inventoryManager';
const { getUserXP, getXPForLevel, getXPForNextLevel } = require('../../utils/xpManager');
const { getUserProfile } = require('../../utils/profileManager');
const { parseTextWithEmojis } = require('../../utils/emojiMapper');
const { getCustomEmojiPath, CUSTOM_EMOJIS } = require('../../utils/customEmojis');
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Register Nunito font
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets/fonts/Nunito-Bold.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets/fonts/Nunito-SemiBold.ttf'), 'Nunito SemiBold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets/fonts/Nunito-Regular.ttf'), 'Nunito Regular');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your cowboy profile card')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('View another cowboy\'s profile')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;

    const inventory = getInventory(targetUser.id);
    const silver = inventory.items['Silver Coin'] || 0;
    const gold = inventory.items['Saloon Token'] || 0;
    const xpData = getUserXP(targetUser.id);
    const profile = getUserProfile(targetUser.id);

    const card = await createProfileCard(targetUser, {
      silver,
      gold,
      xp: xpData.xp,
      level: xpData.level,
      bio: profile.bio,
      background: profile.background,
      reps: profile.reps || 0
    });

    const isOwnProfile = targetUser.id === interaction.user.id;

    if (isOwnProfile) {
      const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('edit_bio')
            .setLabel('Edit Bio')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('change_background')
            .setLabel('Change Background')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('shop_backgrounds')
            .setLabel('Shop Backgrounds')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.editReply({ files: [card], components: [row1] });
    } else {
      await interaction.editReply({ files: [card] });
    }
  },
};

async function createProfileCard(user: User, stats: any): Promise<AttachmentBuilder> {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Load custom background or use default gradient
  let backgroundLoaded = false;
  if (stats.background) {
    try {
      const bgPath = path.join(process.cwd(), 'assets', 'profile-backgrounds', stats.background);
      if (fs.existsSync(bgPath)) {
        const bgImage = await loadImage(bgPath);
        ctx.drawImage(bgImage, 0, 0, 800, 400);
        backgroundLoaded = true;
      }
    } catch (error) {
      console.error('Error loading custom background:', error);
    }
  }

  // Default gradient background (modern teal/cyan theme like in the image)
  if (!backgroundLoaded) {
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#0a7ea4');
    gradient.addColorStop(0.5, '#1d8fb5');
    gradient.addColorStop(1, '#2ba5c9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);
  }

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, 800, 400);

  // "Rex" signature in top right (like in the image)
  ctx.save();
  ctx.font = 'italic bold 60px Nunito';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'right';
  ctx.fillText('Rex', 770, 60);
  ctx.restore();

  // Avatar circle (top left, large)
  const avatarX = 120;
  const avatarY = 100;
  const avatarRadius = 70;

  try {
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Black circle background
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2);
    ctx.fill();

    // White inner border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Draw avatar (circular)
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.restore();
  } catch (error) {
    console.error('Error loading avatar:', error);
  }

  // Username with lightning emoji customizado
  ctx.save();
  ctx.font = 'bold 56px Nunito';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  
  // Draw username
  ctx.fillText(user.username, 220, 110);
  
  // Draw custom lightning emoji next to username
  try {
    const lightningImg = await loadImage(CUSTOM_EMOJIS.LIGHTNING);
    const usernameWidth = ctx.measureText(user.username).width;
    ctx.drawImage(lightningImg, 220 + usernameWidth + 10, 110 - 40, 40, 40);
  } catch (error) {
    // Fallback to Unicode emoji if custom emoji fails
    const usernameWidth = ctx.measureText(user.username).width;
    ctx.fillText('⚡', 220 + usernameWidth + 10, 110);
  }
  
  ctx.restore();

  // Stats section (left side, stacked vertically)
  const statsX = 50;
  let statsY = 200;
  const statSpacing = 55;

  // Helper function to draw compact stat with custom emoji
  async function drawCompactStat(emojiPath: string | null, fallbackEmoji: string, value: string, color: string) {
    ctx.save();
    
    // Try to load custom emoji image
    if (emojiPath) {
      try {
        const emojiImg = await loadImage(emojiPath);
        ctx.drawImage(emojiImg, statsX, statsY - 28, 32, 32);
      } catch (error) {
        // Fallback to Unicode emoji if custom emoji fails
        ctx.font = 'bold 32px Nunito';
        ctx.fillStyle = color;
        ctx.fillText(fallbackEmoji, statsX, statsY);
      }
    } else {
      // Use Unicode emoji
      ctx.font = 'bold 32px Nunito';
      ctx.fillStyle = color;
      ctx.fillText(fallbackEmoji, statsX, statsY);
    }
    
    // Value
    ctx.font = 'bold 32px Nunito';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(value, statsX + 50, statsY);
    
    ctx.restore();
    statsY += statSpacing;
  }

  // Saloon Tokens (Gold) - usando emoji customizado GEM
  await drawCompactStat(CUSTOM_EMOJIS.GEM, '💎', stats.gold.toLocaleString(), '#FFD700');

  // Silver Coins - usando emoji customizado SILVER_COIN
  await drawCompactStat(CUSTOM_EMOJIS.SILVER_COIN, '🪙', stats.silver.toLocaleString(), '#C0C0C0');

  // Level & XP - usando emoji customizado STAR
  const currentXP = stats.xp;
  const xpForCurrentLevel = getXPForLevel(stats.level);
  const xpForNextLevel = getXPForNextLevel(stats.level);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  
  ctx.save();
  
  // Draw custom star emoji
  try {
    const starImg = await loadImage(CUSTOM_EMOJIS.STAR);
    ctx.drawImage(starImg, statsX, statsY - 28, 32, 32);
  } catch (error) {
    // Fallback to Unicode emoji
    ctx.font = 'bold 32px Nunito';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('⭐', statsX, statsY);
  }
  
  ctx.font = 'bold 32px Nunito';
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.fillText(`Nível ${stats.level}`, statsX + 50, statsY);
  
  // XP next to level
  ctx.font = 'bold 20px Nunito';
  ctx.fillStyle = '#CCCCCC';
  ctx.fillText(`${xpInCurrentLevel} XP`, statsX + 200, statsY);
  ctx.restore();
  statsY += statSpacing;

  // Reps - usando emoji customizado CHECK
  await drawCompactStat(CUSTOM_EMOJIS.CHECK, '👍', `${stats.reps || 0} Reps`, '#4A9EFF');

  // "Sobre Mim" section (center-right, like in the image)
  const bioX = 380;
  const bioY = 200;
  const bioWidth = 380;
  const bioHeight = 140;

  // Semi-transparent dark box for bio
  ctx.fillStyle = 'rgba(0, 30, 60, 0.7)';
  roundRect(ctx, bioX, bioY, bioWidth, bioHeight, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, bioX, bioY, bioWidth, bioHeight, 12);
  ctx.stroke();

  // "Sobre Mim" title
  ctx.save();
  ctx.font = 'bold 24px Nunito';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Sobre Mim', bioX + 20, bioY + 35);
  ctx.restore();

  // Bio text
  ctx.save();
  ctx.font = '16px Nunito Regular';
  ctx.fillStyle = '#E0E0E0';
  await wrapTextWithEmojis(ctx, stats.bio || 'No bio set...', bioX + 20, bioY + 65, bioWidth - 40, 22);
  ctx.restore();

  // Dropdown button icon (bottom right, like in the image)
  const buttonX = 720;
  const buttonY = 350;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, buttonX, buttonY, 50, 40, 8);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  roundRect(ctx, buttonX, buttonY, 50, 40, 8);
  ctx.stroke();
  
  // Dropdown icon (chevron down)
  ctx.save();
  ctx.font = 'bold 28px Nunito';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('▼', buttonX + 25, buttonY + 28);
  ctx.restore();

  return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile.png' });
}

function roundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function wrapTextWithEmojis(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number): Promise<void> {
  if (!text || text.trim() === '') {
    ctx.fillText('No bio set yet...', x, y);
    return;
  }

  const parts = parseTextWithEmojis(text);
  const emojiSize = 16;
  const maxLines = 3;
  let currentLine: any[] = [];
  let currentWidth = 0;
  let lineCount = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.type === 'text') {
      const words = part.value.split(' ');
      
      for (let w = 0; w < words.length; w++) {
        const word = words[w] + (w < words.length - 1 ? ' ' : '');
        const wordWidth = ctx.measureText(word).width;
        
        if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
          await drawLineWithEmojis(ctx, currentLine, x, y + (lineCount * lineHeight), emojiSize);
          lineCount++;
          
          if (lineCount >= maxLines) return;
          
          currentLine = [{ type: 'text', value: word }];
          currentWidth = wordWidth;
        } else {
          currentLine.push({ type: 'text', value: word });
          currentWidth += wordWidth;
        }
      }
    } else if (part.type === 'emoji') {
      if (currentWidth + emojiSize > maxWidth && currentLine.length > 0) {
        await drawLineWithEmojis(ctx, currentLine, x, y + (lineCount * lineHeight), emojiSize);
        lineCount++;
        
        if (lineCount >= maxLines) return;
        
        currentLine = [part];
        currentWidth = emojiSize;
      } else {
        currentLine.push(part);
        currentWidth += emojiSize;
      }
    }
  }

  if (currentLine.length > 0 && lineCount < maxLines) {
    await drawLineWithEmojis(ctx, currentLine, x, y + (lineCount * lineHeight), emojiSize);
  }
}

async function drawLineWithEmojis(ctx: any, parts: any[], x: number, y: number, emojiSize: number): Promise<void> {
  let currentX = x;
  
  for (const part of parts) {
    if (part.type === 'text') {
      ctx.fillText(part.value, currentX, y);
      currentX += ctx.measureText(part.value).width;
    } else if (part.type === 'emoji' && part.path) {
      try {
        const emojiImg = await loadImage(part.path);
        ctx.drawImage(emojiImg, currentX, y - emojiSize + 4, emojiSize, emojiSize);
        currentX += emojiSize + 2;
      } catch (error) {
        ctx.fillText(part.value, currentX, y);
        currentX += ctx.measureText(part.value).width;
      }
    }
  }
}
