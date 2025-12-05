import { uploadBase64ToR2 } from '../helpers/base64toR2';

/**
 * Upload image to R2
 */
export async function uploadImage(
    env: Env,
    key: string,
    dataUrl: string
): Promise<{ success: boolean; key: string }> {
    await uploadBase64ToR2(env.BUCKET, key, dataUrl);
    console.log(`[RPC] Uploaded image to R2: ${key}`);
    return { success: true, key };
}

/**
 * Delete single image from R2
 */
export async function deleteImage(
    env: Env,
    key: string
): Promise<{ success: boolean }> {
    await env.BUCKET.delete(key);
    console.log(`[RPC] Deleted image from R2: ${key}`);
    return { success: true };
}

/**
 * Delete multiple images from R2
 */
export async function deleteImagesBatch(
    env: Env,
    keys: string[]
): Promise<{ success: boolean; deleted: number }> {
    await Promise.all(keys.map(key => env.BUCKET.delete(key)));
    console.log(`[RPC] Deleted ${keys.length} images from R2`);
    return { success: true, deleted: keys.length };
}
