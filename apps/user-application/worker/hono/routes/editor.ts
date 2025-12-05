import { Hono } from 'hono';
import { z } from 'zod';

export const editorRoutes = new Hono<{
    Bindings: ServiceBindings;
    Variables: { userId: string };
}>();

// Get session state
editorRoutes.get('/:guideId/state', async (c) => {
    const guideId = c.req.param('guideId');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/api/editor/${guideId}/state`, {
            method: 'GET',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        return c.json({ error: 'Failed to get session state' }, 500);
    }

    return response.json();
});

// Update session state
editorRoutes.post('/:guideId/update', async (c) => {
    const guideId = c.req.param('guideId');
    const state = await c.req.json();

    const headers = new Headers(c.req.raw.headers);
    headers.set('Content-Type', 'application/json');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/api/editor/${guideId}/update`, {
            method: 'POST',
            headers,
            body: JSON.stringify(state),
        })
    );

    if (!response.ok) {
        return c.json({ error: 'Failed to update session' }, 500);
    }

    return response.json();
});

// Save session to database
editorRoutes.post('/:guideId/save', async (c) => {
    const guideId = c.req.param('guideId');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/api/editor/${guideId}/save`, {
            method: 'POST',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        const error = await response.json() as { error?: string };
        return c.json({ error: error.error || 'Failed to save session' }, 500);
    }

    return response.json();
});

// Discard session draft
editorRoutes.post('/:guideId/discard', async (c) => {
    const guideId = c.req.param('guideId');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request(`https://internal/api/editor/${guideId}/discard`, {
            method: 'POST',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        return c.json({ error: 'Failed to discard session' }, 500);
    }

    return response.json();
});
