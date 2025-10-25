import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import * as path from 'path';
const { getTopUsers, getUserInventory } = require('../../utils/inventoryManager');
import { getTrophyEmoji, getGoldMedalEmoji, getSilverMedalEmoji, getBronzeMedalEmoji, getStatsEmoji, getSaloonTokenEmoji, getSilverCoinEmoji } from '../../utils/customEmojis';

GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets', 'fonts', 'Nunito-Bold.ttf'), 'Nunito-Bold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets', 'fonts', 'Nunito-Regular.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets', 'fonts', 'Nunito-SemiBold.ttf'), 'Nunito-SemiBold');

interface UserData {
  userId: string;
  amount: number;
}

function drawRoundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
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

function drawGlowEffect(ctx: any, x: number, y: number, radius: number, color: string) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, color.replace('1)', '0.3)'));
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawBadge(ctx: any, x: number, y: number, rank: number) {
  const colors = [
    { bg: '#FFD700', border: '#FFA500', glow: 'rgba(255, 215, 0, 0.6)' },
    { bg: '#C0C0C0', border: '#A8A8A8', glow: 'rgba(192, 192, 192, 0.6)' },
    { bg: '#CD7F32', border: '#B8733C', glow: 'rgba(205, 127, 50, 0.6)' }
  ];
  
  const color = colors[rank];
  
  // Glow effect
  drawGlowEffect(ctx, x, y, 50, color.glow);
  
  // Badge background
  ctx.save();
  ctx.beginPath();
  
  // Star shape
  const spikes = 8;
  const outerRadius = 45;
  const innerRadius = 22;
  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;
  
  ctx.moveTo(x, y - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(x, y - outerRadius);
  ctx.closePath();
  
  // Fill badge
  const badgeGradient = ctx.createRadialGradient(x, y, 0, x, y, outerRadius);
  badgeGradient.addColorStop(0, color.bg);
  badgeGradient.addColorStop(1, color.border);
  ctx.fillStyle = badgeGradient;
  ctx.fill();
  
  // Border
  ctx.strokeStyle = color.border;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  
  // Rank number
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px Nunito-Bold';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${rank + 1}`, x, y + 2);
}

async function createLeaderboardImage(
  topUsers: UserData[], 
  category: string, 
  interaction: ChatInputCommandInteraction
): Promise<Buffer> {
  const canvas = createCanvas(1400, 900);
  const ctx = canvas.getContext('2d');

  // Modern gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, 1400, 900);
  bgGradient.addColorStop(0, '#0f0c29');
  bgGradient.addColorStop(0.5, '#302b63');
  bgGradient.addColorStop(1, '#24243e');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1400, 900);

  // Decorative circles pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 1400;
    const y = Math.random() * 900;
    const radius = Math.random() * 100 + 50;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Header section with modern styling
  const headerGradient = ctx.createLinearGradient(0, 30, 0, 150);
  headerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
  headerGradient.addColorStop(1, 'rgba(255, 215, 0, 0.05)');
  ctx.fillStyle = headerGradient;
  drawRoundedRect(ctx, 40, 30, 1320, 120, 20);
  ctx.fill();

  // Border glow
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 40, 30, 1320, 120, 20);
  ctx.stroke();

  const emoji = category === 'tokens' ? getSaloonTokenEmoji() : getSilverCoinEmoji();
  const name = category === 'tokens' ? 'SALOON TOKENS' : 'SILVER COINS';
  const color = category === 'tokens' ? '#FFD700' : '#E8E8E8';
  const secondaryColor = category === 'tokens' ? '#FFA500' : '#C0C0C0';

  // Title with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  ctx.fillStyle = color;
  ctx.font = 'bold 56px Nunito-Bold';
  ctx.textAlign = 'center';
  ctx.fillText(`${emoji} ${name}`, 700, 85);
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '24px Nunito-SemiBold';
  ctx.fillText('LEADERBOARD', 700, 125);

  // Main leaderboard section
  const mainY = 180;
  
  // Left panel - Rankings
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  drawRoundedRect(ctx, 40, mainY, 850, 650, 15);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 40, mainY, 850, 650, 15);
  ctx.stroke();

  // Right panel - Top 3 Avatars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  drawRoundedRect(ctx, 920, mainY, 440, 650, 15);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 920, mainY, 440, 650, 15);
  ctx.stroke();

  // Panel titles
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Nunito-Bold';
  ctx.textAlign = 'left';
  ctx.fillText('TOP COWBOYS', 60, mainY + 35);
  
  ctx.textAlign = 'center';
  ctx.fillText('HALL OF FAME', 1140, mainY + 35);

  // Separator line
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, mainY + 50);
  ctx.lineTo(870, mainY + 50);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(940, mainY + 50);
  ctx.lineTo(1340, mainY + 50);
  ctx.stroke();

  // Find current user's position
  const currentUserId = interaction.user.id;
  let currentUserRank = -1;
  let currentUserAmount = 0;
  
  for (let i = 0; i < topUsers.length; i++) {
    if (topUsers[i].userId === currentUserId) {
      currentUserRank = i;
      currentUserAmount = topUsers[i].amount;
      break;
    }
  }

  // Draw rankings
  for (let i = 0; i < Math.min(topUsers.length, 10); i++) {
    const userData = topUsers[i];
    const y = mainY + 95 + (i * 58);
    const isCurrentUser = userData.userId === currentUserId;
    
    // Highlight current user
    if (isCurrentUser) {
      ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
      drawRoundedRect(ctx, 55, y - 35, 820, 50, 8);
      ctx.fill();
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 55, y - 35, 820, 50, 8);
      ctx.stroke();
    }
    
    let user;
    try {
      user = await interaction.client.users.fetch(userData.userId);
    } catch (error) {
      user = { username: 'Unknown User', discriminator: '0000' };
    }

    const medals = ['1st', '2nd', '3rd'];
    
    // Rank indicator
    if (i < 3) {
      ctx.fillStyle = i === 0 ? '#FFD700' : i === 1 ? '#E8E8E8' : '#CD7F32';
      ctx.font = 'bold 36px Nunito-Bold';
      ctx.textAlign = 'center';
      ctx.fillText(medals[i], 100, y);
    } else {
      ctx.fillStyle = isCurrentUser ? color : 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 28px Nunito-Bold';
      ctx.textAlign = 'center';
      ctx.fillText(`#${i + 1}`, 100, y);
    }
    
    // Username
    ctx.fillStyle = isCurrentUser ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)';
    ctx.font = i < 3 ? 'bold 26px Nunito-Bold' : (isCurrentUser ? 'bold 24px Nunito-SemiBold' : '24px Nunito');
    ctx.textAlign = 'left';
    const username = user.username || 'Unknown';
    const displayName = username.length > 22 ? username.substring(0, 22) + '...' : username;
    ctx.fillText(displayName, 150, y);
    
    // Amount with icon
    const amountText = `${userData.amount.toLocaleString()}`;
    ctx.fillStyle = i < 3 ? (i === 0 ? '#FFD700' : i === 1 ? '#E8E8E8' : '#CD7F32') : (isCurrentUser ? color : secondaryColor);
    ctx.font = i < 3 ? 'bold 28px Nunito-Bold' : '24px Nunito-SemiBold';
    ctx.textAlign = 'right';
    ctx.fillText(amountText, 820, y);
    
    ctx.font = '28px Nunito';
    ctx.fillText(emoji, 850, y);
  }

  // Draw top 3 avatars in right panel
  const avatarPositions = [
    { x: 1140, y: mainY + 120 },  // 1st
    { x: 1140, y: mainY + 320 },  // 2nd
    { x: 1140, y: mainY + 520 }   // 3rd
  ];

  for (let i = 0; i < Math.min(topUsers.length, 3); i++) {
    const userData = topUsers[i];
    const pos = avatarPositions[i];
    
    let user;
    try {
      user = await interaction.client.users.fetch(userData.userId);
      const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
      const avatar = await loadImage(avatarURL);
      
      const avatarSize = 140;
      const avatarX = pos.x - avatarSize / 2;
      const avatarY = pos.y - avatarSize / 2;
      
      // Glow effect
      const glowColor = i === 0 ? 'rgba(255, 215, 0, 0.4)' : i === 1 ? 'rgba(192, 192, 192, 0.4)' : 'rgba(205, 127, 50, 0.4)';
      drawGlowEffect(ctx, pos.x, pos.y, 85, glowColor);
      
      // Draw avatar with circular mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
      
      // Border with gradient
      const borderColor = i === 0 ? '#FFD700' : i === 1 ? '#E8E8E8' : '#CD7F32';
      const borderGradient = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
      borderGradient.addColorStop(0, borderColor);
      borderGradient.addColorStop(1, i === 0 ? '#FFA500' : i === 1 ? '#C0C0C0' : '#B8733C');
      
      ctx.strokeStyle = borderGradient;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, avatarSize / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Badge above avatar
      drawBadge(ctx, pos.x, avatarY - 35, i);
      
      // Username below avatar
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px Nunito-Bold';
      ctx.textAlign = 'center';
      const displayName = (user.username || 'Unknown').substring(0, 18);
      ctx.fillText(displayName, pos.x, pos.y + avatarSize / 2 + 30);
      
      // Amount
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 20px Nunito-Bold';
      ctx.fillText(`${userData.amount.toLocaleString()} ${emoji}`, pos.x, pos.y + avatarSize / 2 + 55);
      
    } catch (error) {
      console.error(`Failed to load avatar for user ${userData.userId}:`, error);
    }
  }

  // Footer with stats
  const footerGradient = ctx.createLinearGradient(0, 850, 0, 900);
  footerGradient.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
  footerGradient.addColorStop(1, 'rgba(212, 175, 55, 0.05)');
  ctx.fillStyle = footerGradient;
  ctx.fillRect(0, 850, 1400, 50);
  
  // Calculate total wealth
  const totalWealth = topUsers.reduce((sum, user) => sum + user.amount, 0);
  
  ctx.fillStyle = '#d4af37';
  ctx.font = '18px Nunito-SemiBold';
  ctx.textAlign = 'left';
  ctx.fillText(`🤠 Sheriff Rex Bot`, 50, 880);
  
  ctx.textAlign = 'center';
  ctx.fillText(`Total Wealth: ${totalWealth.toLocaleString()} ${emoji} • ${topUsers.length} Cowboys`, 700, 880);
  
  ctx.textAlign = 'right';
  if (currentUserRank !== -1) {
    ctx.fillText(`Your Rank: #${currentUserRank + 1} • ${currentUserAmount.toLocaleString()} ${emoji}`, 1350, 880);
  } else {
    ctx.fillText(`Keep earning to join the leaderboard!`, 1350, 880);
  }

  return canvas.toBuffer('image/png');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top cowboys in the Wild West!')
    .setContexts([0, 1, 2]) // Guild, BotDM, PrivateChannel
    .setIntegrationTypes([0, 1]) // Guild Install, User Install
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Leaderboard category')
        .setRequired(false)
        .addChoices(
          { name: 'Saloon Tokens', value: 'tokens' },
          { name: 'Silver Coins', value: 'silver' }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    
    const category = interaction.options.getString('category') || 'tokens';
    const itemType = category === 'tokens' ? 'saloon_token' : 'silver';
    const topUsers: UserData[] = getTopUsers(itemType, 10);

    if (topUsers.length === 0) {
      await interaction.editReply({
        content: `❌ No users found on the ${category} leaderboard!`
      });
      return;
    }

    const imageBuffer = await createLeaderboardImage(topUsers, category, interaction);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'leaderboard.png' });

    const trophyEmoji = getTrophyEmoji();
    const categoryEmoji = category === 'tokens' ? getSaloonTokenEmoji() : getSilverCoinEmoji();
    const statsEmoji = getStatsEmoji();
    
    await interaction.editReply({ 
      content: `${trophyEmoji} WILD WEST LEADERBOARD ${trophyEmoji}\n${statsEmoji} Category: ${categoryEmoji} ${category === 'tokens' ? 'Saloon Tokens' : 'Silver Coins'}`,
      files: [attachment] 
    });
  },
};
