import { Hono } from 'hono';
import { ingestGuideSchema } from '@repo/data-ops/zod-schema/guides';
import { RecordingIngestMessageType } from '@repo/data-ops/zod-schema/queue';

export const guidesRouter = new Hono<{ Bindings: Env }>();

// Ingest Recording (Batch - Queue Producer)
guidesRouter.post('/ingest', async (c) => {
    const body = await c.req.json();
    const result = ingestGuideSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: result.error }, 400);
    }

    // HARDCODED: Replace with auth context user ID when auth is implemented
    const HARDCODED_USER_ID = 'f1d84914-ec7c-4b1a-9a89-eaeff6b2f366';
    
    const message: RecordingIngestMessageType = {
        type: 'RECORDING_INGEST',
        userId: HARDCODED_USER_ID,
        data: result.data
    };

    // Send to Cloudflare Queue
    await c.env.QUEUE.send(message);

    return c.json({ success: true, message: 'Recording queued for processing' });
});
