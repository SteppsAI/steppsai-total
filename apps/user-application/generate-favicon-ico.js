import fs from 'fs/promises';
import pngToIco from 'png-to-ico';

const iconDir = './public/icons';
const faviconSizes = [16, 32, 48];

async function generateFaviconIco() {
  try {
    console.log('Generating favicon.ico from multiple PNG sizes...');

    const pngBuffers = [];

    for (const size of faviconSizes) {
      const pngPath = `${iconDir}/favicon-${size}.png`;
      const buffer = await fs.readFile(pngPath);
      pngBuffers.push(buffer);
    }

    const icoBuffer = await pngToIco(pngBuffers);
    await fs.writeFile(`${iconDir}/favicon.ico`, icoBuffer);

    console.log('favicon.ico generated successfully!');
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
    process.exit(1);
  }
}

generateFaviconIco();