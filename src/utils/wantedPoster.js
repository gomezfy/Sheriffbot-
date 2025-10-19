const { createCanvas, loadImage } = require('@napi-rs/canvas');

async function generateWantedPoster(user, bountyAmount) {
  // Canvas dimensions
  const width = 600;
  const height = 800;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background - Old paper texture effect
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner border
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 5;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // "WANTED" text at top
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 70px serif';
  ctx.textAlign = 'center';
  ctx.fillText('WANTED', width / 2, 120);
  
  // Underline for WANTED
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 130);
  ctx.lineTo(450, 130);
  ctx.stroke();

  // Avatar/Photo
  try {
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Draw avatar with border
    const avatarSize = 200;
    const avatarX = (width - avatarSize) / 2;
    const avatarY = 180;
    
    // Avatar border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeRect(avatarX - 5, avatarY - 5, avatarSize + 10, avatarSize + 10);
    
    // Draw avatar
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  } catch (error) {
    console.error('Error loading avatar:', error);
    // Draw placeholder if avatar fails
    ctx.fillStyle = '#999999';
    ctx.fillRect(200, 180, 200, 200);
  }

  // User's name/tag
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px serif';
  ctx.textAlign = 'center';
  const username = user.tag.length > 20 ? user.tag.substring(0, 17) + '...' : user.tag;
  ctx.fillText(username, width / 2, 440);

  // "REWARD" text
  ctx.font = 'bold 35px serif';
  ctx.fillText('REWARD', width / 2, 520);

  // Bounty amount
  ctx.fillStyle = '#8b4513';
  ctx.font = 'bold 60px serif';
  ctx.fillText(`${bountyAmount.toLocaleString()} SILVER`, width / 2, 600);

  // Warning text at bottom
  ctx.fillStyle = '#000000';
  ctx.font = '20px serif';
  ctx.fillText('DEAD OR ALIVE', width / 2, 680);
  
  // Decorative lines
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

module.exports = { generateWantedPoster };
