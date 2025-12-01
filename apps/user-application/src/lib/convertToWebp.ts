/**
 * Convert a PNG/JPEG dataUrl to WebP with compression using OffscreenCanvas
 * Works in service workers (no DOM required)
 * @param dataUrl - Base64 PNG/JPEG data URL
 * @param quality - WebP quality 0-1 (default 0.8)
 * @returns WebP data URL
 */
export async function convertToWebP(dataUrl: string, quality = 0.8): Promise<string> {
    // Fetch the image as a blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Create ImageBitmap (works in service workers)
    const imageBitmap = await createImageBitmap(blob);

    // Use OffscreenCanvas (works in service workers)
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    ctx.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();

    // Convert to WebP blob
    const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality });

    // Convert blob to data URL
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(webpBlob);
    });
}
