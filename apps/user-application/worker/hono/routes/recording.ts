import { Hono } from 'hono';

export const recordingRoutes = new Hono<{
    Bindings: ServiceBindings;
    Variables: { userId: string };
}>();

// Start recording
recordingRoutes.post('/start', async (c) => {
    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request('https://internal/guides/start', {
            method: 'POST',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        const error = await response.json() as { details?: string };
        return c.json({ error: error.details || 'Failed to start recording' }, 500);
    }

    return response.json();
});

// Complete recording
recordingRoutes.post('/:guideId/complete', async (c) => {
    const guideId = c.req.param('guideId');
    const { title, steps } = await c.req.json<{ title: string; steps: any[] }>();

    const headers = new Headers(c.req.raw.headers);
    headers.set('Content-Type', 'application/json');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/guides/${guideId}/complete`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ title, steps }),
        })
    );

    if (!response.ok) {
        const error = await response.json() as { details?: string };
        return c.json({ error: error.details || 'Failed to complete recording' }, 500);
    }

    return response.json();
});

// Discard recording (same as delete guide)
recordingRoutes.delete('/:guideId', async (c) => {
    const guideId = c.req.param('guideId');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/guides/${guideId}`, {
            method: 'DELETE',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        const error = await response.json() as { details?: string };
        return c.json({ error: error.details || 'Failed to discard recording' }, 500);
    }

    return response.json();
});
