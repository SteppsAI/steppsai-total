import { Hono } from 'hono';
import { createGuide, deleteGuide, updateGuide } from '@repo/data-ops/queries';
import { nanoid } from 'nanoid';

export const guidesRouter = new Hono<{ Bindings: Env }>();

// HARDCODED: Replace with auth context user ID when auth is implemented
const HARDCODED_USER_ID = 'f1d84914-ec7c-4b1a-9a89-eaeff6b2f366';

// Start Recording - Creates a draft guide and returns guideId
guidesRouter.post('/start', async (c) => {
    try {
        const guideId = await createGuide({
            userId: HARDCODED_USER_ID,
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
            userId: HARDCODED_USER_ID
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
});// Delete Recording - Deletes images from R2 FIRST, then guide from DB
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
