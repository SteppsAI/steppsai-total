import { Hono } from 'hono';
import { uploadBase64ToR2 } from '../../helpers/base64toR2';
import { updateUser } from '@repo/data-ops/queries';

export const usersRouter = new Hono<{
    Bindings: Env;
    Variables: { userId: string };
}>();

// Upload Avatar - Receives already-converted WebP, deletes old, uploads new, updates DB
usersRouter.post('/upload-avatar', async (c) => {
    try {
        const userId = c.var.userId; // from auth middleware
        const { dataUrl } = await c.req.json<{
            dataUrl: string; // Already WebP from frontend
        }>();

        if (!dataUrl) {
            return c.json({ error: 'Missing dataUrl' }, 400);
        }

        // 1. Delete old avatar from R2 if exists (construct URL pattern from userId)
        try {
            const prefix = `profile_pictures/${userId}/`;
            const listed = await c.env.BUCKET.list({ prefix });
            if (listed.objects.length > 0) {
                await Promise.all(listed.objects.map(obj => c.env.BUCKET.delete(obj.key)));
                console.log(`Deleted ${listed.objects.length} old avatar(s)`);
            }
        } catch (error) {
            console.error('Failed to delete old avatar:', error);
            // Continue anyway - not critical
        }

        // 2. Generate new key and upload to R2
        const imageId = crypto.randomUUID();
        const key = `profile_pictures/${userId}/${imageId}.webp`;
        await uploadBase64ToR2(c.env.BUCKET, key, dataUrl);

        console.log(`Uploaded avatar for user ${userId}: ${key}`);

        // 3. Update Database with KEY only (not full URL)
        await updateUser(userId, { avatarUrl: key });

        // 4. Return key (TRPC will transform to full URL)
        return c.json({ success: true, key });
    } catch (error) {
        console.error('Failed to upload avatar:', error);
        return c.json({
            error: 'Avatar upload failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

// Delete Avatar - Removes from R2 and clears DB field
usersRouter.delete('/avatar', async (c) => {
    try {
        const userId = c.var.userId; // from auth middleware

        // 1. Delete from R2 using prefix pattern
        try {
            const prefix = `profile_pictures/${userId}/`;
            const listed = await c.env.BUCKET.list({ prefix });
            if (listed.objects.length > 0) {
                await Promise.all(listed.objects.map(obj => c.env.BUCKET.delete(obj.key)));
                console.log(`Deleted ${listed.objects.length} avatar(s) from R2`);
            }
        } catch (error) {
            console.error('Failed to delete from R2:', error);
            // Continue to clear DB even if R2 fails
        }

        // 2. Clear DB field
        await updateUser(userId, { avatarUrl: null });

        return c.json({ success: true });
    } catch (error) {
        console.error('Failed to delete avatar:', error);
        return c.json({ error: 'Delete failed' }, 500);
    }
});
