import { Hono } from 'hono';

export const guidesRoutes = new Hono<{
    Bindings: ServiceBindings;
    Variables: { userId: string };
}>();

// Delete guide
guidesRoutes.delete('/:guideId', async (c) => {
    const guideId = c.req.param('guideId');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/guides/${guideId}`, {
            method: 'DELETE',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        const error = await response.json() as { error?: string };
        return c.json({ error: error.error || 'Failed to delete guide' }, 500);
    }

    return c.json({ success: true });
});

// Delete step
guidesRoutes.delete('/steps/:stepId', async (c) => {
    const stepId = c.req.param('stepId');
    const { guideId, imageKey } = await c.req.json<{ guideId: string; imageKey?: string }>();

    const headers = new Headers(c.req.raw.headers);
    headers.set('Content-Type', 'application/json');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/guides/steps/${stepId}`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ guideId, imageKey }),
        })
    );

    if (!response.ok) {
        const error = await response.json() as { error?: string };
        return c.json({ error: error.error || 'Failed to delete step' }, 500);
    }

    return c.json({ success: true });
});
