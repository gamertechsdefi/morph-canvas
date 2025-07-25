import Jimp from 'jimp';
import { removeBackground } from '@imgly/background-removal';

/**
 * AI-powered background removal using @imgly/background-removal
 * Much simpler and more accurate than manual algorithms
 */
export async function removeBackgroundAI(fileBuffer: Buffer): Promise<Buffer> {
  try {
    // Convert buffer to blob for the AI library
    const uint8Array = new Uint8Array(fileBuffer);
    const blob = new Blob([uint8Array], { type: 'image/png' });
    
    // Use AI to remove background
    const result = await removeBackground(blob);
    
    // Convert result back to buffer
    const arrayBuffer = await result.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch  {
    console.error('AI background removal failed:');
    throw new Error('AI background removal failed');
  }
}

/**
 * Simple fallback method using color-based removal
 */
export async function removeBackgroundSimple(fileBuffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(fileBuffer);
  
  // Convert to RGBA
  if (image.hasAlpha()) {
    image.background(0x00000000);
  }
  
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Find the most common color (likely background)
  const colorHistogram = new Map<string, number>();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = image.getPixelColor(x, y);
      const color = Jimp.intToRGBA(pixel);
      const key = `${color.r},${color.g},${color.b}`;
      colorHistogram.set(key, (colorHistogram.get(key) || 0) + 1);
    }
  }
  
  // Find dominant color
  let maxCount = 0;
  let dominantColor = { r: 255, g: 255, b: 255 };
  
  for (const [key, count] of colorHistogram) {
    if (count > maxCount) {
      maxCount = count;
      const [r, g, b] = key.split(',').map(Number);
      dominantColor = { r, g, b };
    }
  }
  
  // Remove background with tolerance
  const tolerance = 40;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = image.getPixelColor(x, y);
      const color = Jimp.intToRGBA(pixel);
      
      const colorDiff = Math.sqrt(
        Math.pow(color.r - dominantColor.r, 2) + 
        Math.pow(color.g - dominantColor.g, 2) + 
        Math.pow(color.b - dominantColor.b, 2)
      );
      
      if (colorDiff <= tolerance) {
        image.setPixelColor(0x00000000, x, y);
      }
    }
  }
  
  return await image.getBufferAsync(Jimp.MIME_PNG);
}

/**
 * Robust background removal that tries AI first, then falls back to simple method
 */
export async function removeBackgroundRobust(fileBuffer: Buffer): Promise<Buffer> {
  try {
    // Try AI method first (best results)
    return await removeBackgroundAI(fileBuffer);
  } catch {
    console.log("AI method failed, trying simple color-based method...");
    return await removeBackgroundSimple(fileBuffer);
  }
}

/**
 * Applies a tint to an image
 */
export async function applyTint(
  imageBuffer: Buffer, 
  tintColor = { r: 102, g: 212, b: 255 }, 
  tintFactor = 0.2
): Promise<Buffer> {
  const image = await Jimp.read(imageBuffer);
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    if (this.bitmap.data[idx + 3] > 0) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      this.bitmap.data[idx + 0] = Math.round(r * (1 - tintFactor) + tintColor.r * tintFactor);
      this.bitmap.data[idx + 1] = Math.round(g * (1 - tintFactor) + tintColor.g * tintFactor);
      this.bitmap.data[idx + 2] = Math.round(b * (1 - tintFactor) + tintColor.b * tintFactor);
    }
  });

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

/**
 * Applies a background to an image
 */
export async function applyBackground(
  imageBuffer: Buffer,
  backgroundBuffer: Buffer
): Promise<Buffer> {
  const image = await Jimp.read(imageBuffer);
  const background = await Jimp.read(backgroundBuffer);
  
  background.resize(image.bitmap.width, image.bitmap.height);
  background.composite(image, 0, 0);
  
  return await background.getBufferAsync(Jimp.MIME_PNG);
} 