import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { getDataPath } from './database';
import { User } from 'discord.js';
import path from 'path';

// Register Nunito font
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets/fonts/Nunito-Bold.ttf'), 'Nunito');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'assets/fonts/Nunito-Regular.ttf'), 'Nunito Regular');

export async function generateWantedPoster(user: User, bountyAmount: number): Promise<Buffer> {
  const width = 600;
  const height = 800;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d4a574';
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 5;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 70px Nunito';
  ctx.textAlign = 'center';
  ctx.fillText('WANTED', width / 2, 120);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 130);
  ctx.lineTo(450, 130);
  ctx.stroke();

  try {
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    const avatarSize = 200;
    const avatarX = (width - avatarSize) / 2;
    const avatarY = 180;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(avatarX - 5, avatarY - 5, avatarSize + 10, avatarSize + 10);
    
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  } catch (error) {
    console.error('Error loading avatar:', error);
    ctx.fillStyle = '#999999';
    ctx.fillRect(200, 180, 200, 200);
  }

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px Nunito';
  ctx.textAlign = 'center';
  const username = user.tag.length > 20 ? user.tag.substring(0, 17) + '...' : user.tag;
  ctx.fillText(username, width / 2, 440);

  ctx.font = 'bold 35px Nunito';
  ctx.fillText('REWARD', width / 2, 520);

  ctx.fillStyle = '#8b4513';
  ctx.font = 'bold 60px Nunito';
  ctx.fillText(`${bountyAmount.toLocaleString()} SILVER`, width / 2, 600);

  ctx.fillStyle = '#000000';
  ctx.font = '20px Nunito Regular';
  ctx.fillText('DEAD OR ALIVE', width / 2, 680);
  
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 470);
  ctx.lineTo(500, 470);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(100, 630);
  ctx.lineTo(500, 630);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}
