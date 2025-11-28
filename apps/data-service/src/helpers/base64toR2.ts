/**
 * Upload a base64 data URL to R2 bucket
 * @param bucket - R2 bucket binding
 * @param key - Storage key/path
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @returns The key that was stored
 */
export async function uploadBase64ToR2(
    bucket: R2Bucket,
    key: string,
    dataUrl: string
): Promise<string> {
    // Extract base64 data and mime type
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid data URL format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Store in R2 with actual mime type from dataUrl
    await bucket.put(key, bytes.buffer, {
        httpMetadata: {
            contentType: mimeType
        }
    });

    return key;
}
