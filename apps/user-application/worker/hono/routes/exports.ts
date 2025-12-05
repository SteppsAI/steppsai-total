import { Hono } from 'hono';

export const exportsRoutes = new Hono<{
    Bindings: ServiceBindings;
    Variables: { userId: string };
}>();

// Trigger export
exportsRoutes.post('/trigger', async (c) => {
    const { guideId, format } = await c.req.json<{ guideId: string; format: 'pdf' | 'html' }>();

    const headers = new Headers(c.req.raw.headers);
    headers.set('Content-Type', 'application/json');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request('https://internal/exports/trigger', {
            method: 'POST',
            headers,
            body: JSON.stringify({ guideId, format }),
        })
    );

    if (!response.ok) {
        const error = await response.json() as { error?: string };
        return c.json({ error: error.error || 'Failed to trigger export' }, 500);
    }

    return response.json();
});
