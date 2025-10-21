import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const backgroundsDir = path.join(__dirname, '..', 'assets', 'profile-backgrounds');

if (!fs.existsSync(backgroundsDir)) {
  fs.mkdirSync(backgroundsDir, { recursive: true });
}

const backgrounds = [
  { filename: 'default.jpg', color1: '#8B4513', color2: '#D2691E', name: 'Desert Sunset' },
  { filename: 'saloon.jpg', color1: '#654321', color2: '#8B7355', name: 'Wild West Saloon' },
  { filename: 'canyon.jpg', color1: '#CD5C5C', color2: '#F08080', name: 'Red Canyon' },
  { filename: 'town.jpg', color1: '#696969', color2: '#A9A9A9', name: 'Ghost Town' }
];

for (const bg of backgrounds) {
  const canvas = createCanvas(800, 550);
  const ctx = canvas.getContext('2d');

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 550);
  gradient.addColorStop(0, bg.color1);
  gradient.addColorStop(1, bg.color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 550);

  // Add texture pattern
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 550;
    const radius = Math.random() * 50 + 10;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add text watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bg.name, 400, 275);

  // Save
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(backgroundsDir, bg.filename), buffer);
  console.log(`✅ Created ${bg.filename}`);
}

console.log('\n🎨 All background placeholders created!');
