import { updateUser } from '@repo/data-ops/queries';
import { uploadBase64ToR2 } from '../helpers/base64toR2';

/**
 * Users RPC Methods
 * These are called directly from user-application via BACKEND_SERVICE binding
 */

export async function uploadAvatar(env: Env, userId: string, dataUrl: string) {
    // 1. Delete old avatars
    try {
        const prefix = `profile_pictures/${userId}/`;
        const listed = await env.BUCKET.list({ prefix });
        if (listed.objects.length > 0) {
            await Promise.all(listed.objects.map(obj => env.BUCKET.delete(obj.key)));
            console.log(`[RPC] Deleted ${listed.objects.length} old avatar(s)`);
        }
    } catch (error) {
        console.error('[RPC] Failed to delete old avatar:', error);
    }

    // 2. Upload new avatar
    const imageId = crypto.randomUUID();
    const key = `profile_pictures/${userId}/${imageId}.webp`;
    await uploadBase64ToR2(env.BUCKET, key, dataUrl);
    console.log(`[RPC] Uploaded avatar for user ${userId}: ${key}`);

    // 3. Update DB
    await updateUser(userId, { avatarUrl: key });

    return { success: true, key };
}

export async function deleteAvatar(env: Env, userId: string) {
    // 1. Delete from R2
    try {
        const prefix = `profile_pictures/${userId}/`;
        const listed = await env.BUCKET.list({ prefix });
        if (listed.objects.length > 0) {
            await Promise.all(listed.objects.map(obj => env.BUCKET.delete(obj.key)));
            console.log(`[RPC] Deleted ${listed.objects.length} avatar(s) from R2`);
        }
    } catch (error) {
        console.error('[RPC] Failed to delete from R2:', error);
    }

    // 2. Clear DB field
    await updateUser(userId, { avatarUrl: null });
    return { success: true };
}
