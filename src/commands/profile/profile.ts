import { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, User } from 'discord.js';
const { getUserSilver, getUserGold } = require('../../utils/dataManager');
const { getUserXP, getXPForLevel, getXPForNextLevel } = require('../../utils/xpManager');
const { getUserProfile } = require('../../utils/profileManager');
const { parseTextWithEmojis } = require('../../utils/emojiMapper');
const { getCustomEmojiPath } = require('../../utils/customEmojis');
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

// Register Nunito font
GlobalFonts.registerFromPath(path.join(__dirname, '../../../assets/fonts/Nunito-Bold.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(__dirname, '../../../assets/fonts/Nunito-SemiBold.ttf'), 'Nunito SemiBold');
GlobalFonts.registerFromPath(path.join(__dirname, '../../../assets/fonts/Nunito-Regular.ttf'), 'Nunito Regular');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your cowboy profile card')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('View another cowboy\'s profile')
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;

    const silver = getUserSilver(targetUser.id);
    const gold = getUserGold(targetUser.id);
    const xpData = getUserXP(targetUser.id);
    const profile = getUserProfile(targetUser.id);

    const card = await createProfileCard(targetUser, {
      silver,
      gold,
      xp: xpData.xp,
      level: xpData.level,
      bio: profile.bio,
      background: profile.background
    });

    const isOwnProfile = targetUser.id === interaction.user.id;

    if (isOwnProfile) {
      const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('edit_bio')
            .setLabel('Edit Bio')
            .setEmoji('📝')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('change_background')
            .setLabel('Change Background')
            .setEmoji('🎨')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.editReply({ files: [card], components: [buttonRow] });
    } else {
      await interaction.editReply({ files: [card] });
    }
  },
};

async function createProfileCard(user: User, stats: any): Promise<AttachmentBuilder> {
  const canvas = createCanvas(800, 550);
  const ctx = canvas.getContext('2d');

  // Load custom background or use default gradient
  let backgroundLoaded = false;
  if (stats.background) {
    try {
      const bgPath = path.join(__dirname, '..', '..', '..', 'assets', 'profile-backgrounds', stats.background);
      if (fs.existsSync(bgPath)) {
        const bgImage = await loadImage(bgPath);
        ctx.drawImage(bgImage, 0, 0, 800, 550);
        backgroundLoaded = true;
      }
    } catch (error) {
      console.error('Error loading custom background:', error);
    }
  }

  // Default gradient background
  if (!backgroundLoaded) {
    const gradient = ctx.createLinearGradient(0, 0, 800, 550);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 550);
  }

  // Dark overlay for text readability
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, 800, 550);

  // Top accent bar (level color)
  const levelColor = getLevelColor(stats.level);
  const topGradient = ctx.createLinearGradient(0, 0, 800, 0);
  topGradient.addColorStop(0, levelColor);
  topGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, 800, 6);

  // Avatar (top left)
  try {
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Avatar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(120, 120, 85, 0, Math.PI * 2);
    ctx.fill();

    // Avatar border
    ctx.strokeStyle = levelColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(120, 120, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Draw avatar (circular)
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 120, 74, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 46, 46, 148, 148);
    ctx.restore();
  } catch (error) {
    console.error('Error loading avatar:', error);
  }

  // Username (top right of avatar)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Nunito';
  ctx.fillText(user.username, 250, 90);

  // Tag
  ctx.fillStyle = '#B0B0B0';
  ctx.font = '24px Nunito Regular';
  ctx.fillText(`#${user.discriminator}`, 250, 125);

  // Currency section (below avatar)
  const currencyY = 280;
  
  // Saloon Tokens (custom image)
  const saloonTokenImg = await loadImage(getCustomEmojiPath('SALOON_TOKEN'));
  await drawCurrencyBoxWithImage(ctx, 50, currencyY, 300, 80, saloonTokenImg, 'Saloon Tokens', stats.gold.toLocaleString(), '#D4AF37');
  
  // Silver Coins
  await drawCurrencyBox(ctx, 50, currencyY + 100, 300, 80, '🪙', 'Silver Coins', stats.silver.toLocaleString(), '#C0C0C0');

  // XP/Level section (right side)
  const xpPanelX = 400;
  const xpPanelY = 250;

  // Level display
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, xpPanelX, xpPanelY, 350, 100, 12);
  ctx.fill();

  ctx.strokeStyle = levelColor;
  ctx.lineWidth = 3;
  roundRect(ctx, xpPanelX, xpPanelY, 350, 100, 12);
  ctx.stroke();

  // Level icon and number
  ctx.fillStyle = levelColor;
  ctx.font = 'bold 50px Nunito';
  ctx.fillText('⭐', xpPanelX + 20, xpPanelY + 65);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px Nunito';
  ctx.fillText(`Level ${stats.level}`, xpPanelX + 90, xpPanelY + 45);

  // XP text
  const currentXP = stats.xp;
  const xpForCurrentLevel = getXPForLevel(stats.level);
  const xpForNextLevel = getXPForNextLevel(stats.level);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

  ctx.fillStyle = '#B0B0B0';
  ctx.font = '18px Nunito Regular';
  ctx.fillText(`${xpInCurrentLevel.toLocaleString()} / ${xpNeededForLevel.toLocaleString()} XP`, xpPanelX + 90, xpPanelY + 75);

  // XP Progress bar
  const xpPercent = xpInCurrentLevel / xpNeededForLevel;
  drawProgressBar(ctx, xpPanelX + 20, xpPanelY + 85, 310, 8, xpPercent * 100, 100, levelColor, '#2C2F33');

  // "About Me" section
  const bioY = 370;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, 400, bioY, 350, 150, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  roundRect(ctx, 400, bioY, 350, 150, 12);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Nunito';
  ctx.fillText('📝 About Me', 420, bioY + 35);

  // Bio text (wrapped) - with emoji support
  ctx.fillStyle = '#D0D0D0';
  ctx.font = '16px Nunito Regular';
  await wrapTextWithEmojis(ctx, stats.bio, 420, bioY + 65, 310, 20);

  // Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 538, 800, 2);
  
  ctx.fillStyle = '#7289DA';
  ctx.font = '14px Nunito Regular';
  ctx.fillText('Sheriff Bot • Cowboy Profile', 20, 535);

  if (stats.background) {
    ctx.fillStyle = levelColor;
    ctx.fillText('⭐ Custom Background', 650, 535);
  }

  return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile.png' });
}

async function drawCurrencyBoxWithImage(ctx: any, x: number, y: number, width: number, height: number, iconImage: any, label: string, value: string, color: string): Promise<void> {
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, width, height, 12);
  ctx.stroke();

  // Icon (custom image)
  const iconSize = 48;
  ctx.drawImage(iconImage, x + 15, y + 16, iconSize, iconSize);

  // Label
  ctx.font = '18px Nunito Regular';
  ctx.fillStyle = '#B0B0B0';
  ctx.fillText(label, x + 75, y + 30);

  // Value
  ctx.font = 'bold 28px Nunito';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(value, x + 75, y + 60);
}

async function drawCurrencyBox(ctx: any, x: number, y: number, width: number, height: number, icon: string, label: string, value: string, color: string): Promise<void> {
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, width, height, 12);
  ctx.stroke();

  // Icon
  ctx.font = 'bold 36px Nunito';
  ctx.fillStyle = color;
  ctx.fillText(icon, x + 20, y + 50);

  // Label
  ctx.font = '18px Nunito Regular';
  ctx.fillStyle = '#B0B0B0';
  ctx.fillText(label, x + 75, y + 30);

  // Value
  ctx.font = 'bold 28px Nunito';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(value, x + 75, y + 60);
}

function drawProgressBar(ctx: any, x: number, y: number, width: number, height: number, current: number, max: number, fillColor: string, bgColor: string): void {
  // Background
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, width, height, height / 2);
  ctx.fill();

  // Fill
  const percentage = Math.min((current / max), 1);
  ctx.fillStyle = fillColor;
  roundRect(ctx, x, y, width * percentage, height, height / 2);
  ctx.fill();
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
  const emojiSize = 18; // Size of emoji images
  const maxLines = 4;
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
          // Draw current line
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
        // Draw current line
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

  // Draw last line
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
        // If emoji image not found, draw the emoji character as text
        ctx.fillText(part.value, currentX, y);
        currentX += ctx.measureText(part.value).width;
      }
    }
  }
}

function getLevelColor(level: number): string {
  if (level >= 100) return '#FF0000'; // Red
  if (level >= 75) return '#FF00FF';  // Magenta
  if (level >= 50) return '#FFD700';  // Gold
  if (level >= 25) return '#00D9FF';  // Cyan
  if (level >= 10) return '#9B59B6';  // Purple
  return '#95A5A6'; // Gray
}
