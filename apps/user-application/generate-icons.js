import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const iconDir = './public/icons';
const sourceSvg = './public/brand/logo-symbol-circle.svg';

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-48.png', size: 48 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

async function generateIcons() {
  try {
    // Ensure the icons directory exists
    await fs.mkdir(iconDir, { recursive: true });

    console.log('Generating icons from SVG...');

    for (const { name, size } of sizes) {
      const outputPath = path.join(iconDir, name);

      await sharp(sourceSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`Generated ${name} (${size}x${size})`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();