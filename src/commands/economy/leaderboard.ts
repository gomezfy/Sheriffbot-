import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import * as path from 'path';
const { getTopUsers } = require('../../utils/inventoryManager');

GlobalFonts.registerFromPath(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Nunito-Bold.ttf'), 'Nunito-Bold');
GlobalFonts.registerFromPath(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Nunito-Regular.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(__dirname, '..', '..', '..', 'assets', 'fonts', 'Nunito-SemiBold.ttf'), 'Nunito-SemiBold');

interface UserData {
  userId: string;
  amount: number;
}

async function createLeaderboardImage(
  topUsers: UserData[], 
  category: string, 
  interaction: ChatInputCommandInteraction
): Promise<Buffer> {
  const canvas = createCanvas(1200, 800);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 800);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#0f0f1e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 800);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 1160, 760);

  const emoji = category === 'tokens' ? '🎫' : '🪙';
  const name = category === 'tokens' ? 'SALOON TOKENS' : 'SILVER COINS';
  const color = category === 'tokens' ? '#FFD700' : '#C0C0C0';

  ctx.fillStyle = color;
  ctx.font = 'bold 48px Nunito-Bold';
  ctx.textAlign = 'center';
  ctx.fillText(`${emoji} ${name} LEADERBOARD`, 600, 80);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(1100, 100);
  ctx.stroke();

  const leftWidth = 700;
  const rightX = leftWidth + 50;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(40, 120, leftWidth - 80, 640);
  ctx.fillRect(rightX, 120, 1140 - rightX, 640);

  for (let i = 0; i < Math.min(topUsers.length, 10); i++) {
    const userData = topUsers[i];
    const y = 170 + (i * 60);
    
    let user;
    try {
      user = await interaction.client.users.fetch(userData.userId);
    } catch (error) {
      user = { username: 'Unknown User', discriminator: '0000' };
    }

    const medals = ['🥇', '🥈', '🥉'];
    const medal = i < 3 ? medals[i] : `${i + 1}.`;
    
    if (i < 3) {
      ctx.fillStyle = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32';
      ctx.font = 'bold 32px Nunito-Bold';
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '28px Nunito-SemiBold';
    }
    
    ctx.textAlign = 'left';
    ctx.fillText(medal, 80, y);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = i < 3 ? 'bold 26px Nunito-SemiBold' : '24px Nunito';
    const username = user.username || 'Unknown';
    ctx.fillText(username.substring(0, 20), 150, y);
    
    ctx.fillStyle = color;
    ctx.font = i < 3 ? 'bold 26px Nunito-Bold' : '24px Nunito-SemiBold';
    ctx.textAlign = 'right';
    ctx.fillText(`${userData.amount.toLocaleString()} ${emoji}`, leftWidth - 40, y);
  }

  for (let i = 0; i < Math.min(topUsers.length, 3); i++) {
    const userData = topUsers[i];
    const avatarY = 180 + (i * 200);
    
    let user;
    try {
      user = await interaction.client.users.fetch(userData.userId);
      const avatarURL = user.displayAvatarURL({ extension: 'png', size: 128 });
      const avatar = await loadImage(avatarURL);
      
      const avatarSize = 120;
      const avatarX = rightX + 180;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
      
      const borderColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32';
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
      
      const medals = ['🥇', '🥈', '🥉'];
      ctx.font = '40px Nunito-Bold';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(medals[i], avatarX + avatarSize / 2, avatarY - 20);
      ctx.fillText(medals[i], avatarX + avatarSize / 2, avatarY - 20);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Nunito-SemiBold';
      const displayName = (user.username || 'Unknown').substring(0, 15);
      ctx.fillText(displayName, avatarX + avatarSize / 2, avatarY + avatarSize + 30);
      
      ctx.fillStyle = color;
      ctx.font = 'bold 18px Nunito-Bold';
      ctx.fillText(`${userData.amount.toLocaleString()} ${emoji}`, avatarX + avatarSize / 2, avatarY + avatarSize + 55);
      
    } catch (error) {
      console.error(`Failed to load avatar for user ${userData.userId}:`, error);
    }
  }

  ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
  ctx.fillRect(0, 750, 1200, 50);
  ctx.fillStyle = '#d4af37';
  ctx.font = '20px Nunito';
  ctx.textAlign = 'center';
  ctx.fillText('🤠 Sheriff Rex Bot • Work hard and climb the ranks!', 600, 780);

  return canvas.toBuffer('image/png');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('📊 View the top cowboys in the Wild West!')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Leaderboard category')
        .setRequired(false)
        .addChoices(
          { name: '🎫 Saloon Tokens', value: 'tokens' },
          { name: '🪙 Silver Coins', value: 'silver' }
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

    await interaction.editReply({ 
      content: '🏆 **WILD WEST LEADERBOARD** 🏆',
      files: [attachment] 
    });
  },
};
