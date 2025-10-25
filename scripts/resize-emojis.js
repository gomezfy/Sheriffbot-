const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

async function resizeImage(inputPath, outputPath, targetSize = 128) {
  try {
    const image = await loadImage(inputPath);
    
    // Calculate new dimensions while maintaining aspect ratio
    let width = targetSize;
    let height = targetSize;
    
    if (image.width > image.height) {
      height = Math.round((image.height / image.width) * targetSize);
    } else {
      width = Math.round((image.width / image.height) * targetSize);
    }
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw resized image
    ctx.drawImage(image, 0, 0, width, height);
    
    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    const stats = fs.statSync(outputPath);
    console.log(`✅ Resized ${path.basename(inputPath)} -> ${Math.round(stats.size / 1024)}KB`);
    
    return stats.size;
  } catch (error) {
    console.error(`❌ Error resizing ${inputPath}:`, error.message);
    throw error;
  }
}

async function main() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const customEmojisDir = path.join(assetsDir, 'custom-emojis');
  
  console.log('Resizing emoji images to fit Discord emoji size limit (256KB)...\n');
  
  const images = [
    { input: path.join(assetsDir, 'silver-coin.png'), output: path.join(customEmojisDir, 'silver_coin.png') },
    { input: path.join(assetsDir, 'gold-bar.png'), output: path.join(customEmojisDir, 'gold_bar.png') }
  ];
  
  for (const { input, output } of images) {
    let size = 128;
    let fileSize = 999999;
    
    // Try different sizes until we get under 256KB
    while (fileSize > 256 * 1024 && size >= 32) {
      fileSize = await resizeImage(input, output, size);
      
      if (fileSize > 256 * 1024) {
        size = Math.floor(size * 0.8);
        console.log(`  File too large, trying ${size}px...`);
      }
    }
    
    if (fileSize > 256 * 1024) {
      console.warn(`⚠️  Warning: Could not reduce ${path.basename(input)} below 256KB`);
    }
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
