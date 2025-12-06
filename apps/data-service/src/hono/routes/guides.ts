import { Hono } from 'hono';
import { createGuide, deleteGuide, updateGuide, deleteStep } from "@repo/data-ops/queries";
import { nanoid } from 'nanoid';

export const guidesRouter = new Hono<{
    Bindings: Env;
    Variables: { userId: string };
}>();

// Start Recording - Creates a draft guide and returns guideId
guidesRouter.post('/start', async (c) => {
    const userId = c.var.userId;

    try {
        const guideId = await createGuide({
            userId,
            title: 'Recording in progress...',
            description: '',
            slug: nanoid(10),
            status: 'recording',
            visibility: 'private',
        });

        console.log(`Created draft guide: ${guideId}`);

        return c.json({
            success: true,
            guideId,
            userId
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to create guide:', errorMessage);
        return c.json({
            error: 'Failed to create guide',
            details: errorMessage
        }, 500);
    }
});

// Complete Recording - Updates guide title and sends steps to queue
guidesRouter.post('/:guideId/complete', async (c) => {
    const guideId = c.req.param('guideId');

    try {
        const { title, steps } = await c.req.json();

        // 1. Update guide title and status
        await updateGuide(guideId, {
            title: title || 'Untitled Recording',
            status: 'processing'
        });

        // 2. Send steps to queue for processing
        await c.env.QUEUE.send({
            type: 'STEPS_INSERT',
            guideId,
            steps: steps || []
        });

        console.log(`Guide ${guideId} sent to queue with ${steps?.length || 0} steps`);

        return c.json({ success: true, guideId });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to complete guide:', errorMessage);
        return c.json({
            error: 'Failed to complete guide',
            details: errorMessage
        }, 500);
    }
});

// Delete Recording - Deletes images from R2 FIRST, then guide from DB
// ATOMIC: If R2 fails, DB is NOT deleted. If DB fails after R2, error is returned.
guidesRouter.delete('/:guideId', async (c) => {
    const guideId = c.req.param('guideId');

    try {
        // 1. Delete all images for this guide from R2 FIRST
        const prefix = `screenshots/${guideId}/`;
        const listed = await c.env.BUCKET.list({ prefix });

        if (listed.objects.length > 0) {
            await Promise.all(
                listed.objects.map(obj => c.env.BUCKET.delete(obj.key))
            );
            console.log(`Deleted ${listed.objects.length} images from R2 for guide ${guideId}`);
        }

        // 2. Delete guide from DB AFTER R2 deletion succeeds
        await deleteGuide(guideId);

        console.log(`Deleted guide: ${guideId}`);

        return c.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to delete guide:', errorMessage);
        return c.json({
            error: 'Failed to delete guide',
            details: errorMessage
        }, 500);
    }
});

// Delete Step - Atomic deletion of image (R2) and step (DB)
// 1. Try to delete image from R2 first (if imageKey exists)
// 2. If R2 delete fails (image already gone), continue anyway - not a blocker
// 3. Always delete step from DB (this must succeed)
guidesRouter.delete('/steps/:stepId', async (c) => {
    const stepId = c.req.param('stepId');
    const { guideId, imageKey } = await c.req.json<{ guideId: string; imageKey?: string }>();

    if (!guideId) {
        return c.json({ error: 'Missing guideId' }, 400);
    }

    try {
        // 1. Delete image from R2 FIRST (if exists)
        if (imageKey) {
            try {
                // Extract key from full URL if needed
                let key = imageKey;
                if (key.startsWith('http')) {
                    const url = new URL(key);
                    key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                }

                await c.env.BUCKET.delete(key);
                console.log(`Deleted image from R2: ${key}`);
            } catch (error) {
                console.warn('Failed to delete image from R2:', error);
                // Continue to DB deletion even if R2 fails (image might already be gone)
            }
        }

        // 2. Delete step from DB AFTER R2 deletion
        await deleteStep(guideId, stepId);

        console.log(`Deleted step ${stepId} from guide ${guideId}`);

        return c.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to delete step:', errorMessage);
        return c.json({
            error: 'Failed to delete step',
            details: errorMessage
        }, 500);
    }
});
