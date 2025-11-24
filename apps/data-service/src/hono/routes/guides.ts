import { Hono } from 'hono';
import { ingestGuideSchema } from '@repo/data-ops/zod-schema/guides';
import { RecordingIngestMessageType } from '@repo/data-ops/zod-schema/queue';

export const guidesRouter = new Hono<{ Bindings: Env }>();

// Ingest Recording (Queue Producer)
guidesRouter.post('/ingest', async (c) => {
    const body = await c.req.json();
    const result = ingestGuideSchema.safeParse(body);

    if (!result.success) {
        return c.json({ error: result.error }, 400);
    }

    const message: RecordingIngestMessageType = {
        type: 'RECORDING_INGEST',
        userId: '00000000-0000-0000-0000-000000000000', // TODO: Get from Auth Context
        data: result.data
    };

    // Send to Cloudflare Queue
    await c.env.QUEUE.send(message);

    return c.json({ success: true, message: 'Recording queued for processing' });
});
