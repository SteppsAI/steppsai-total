import { Hono } from 'hono';

export const usersRoutes = new Hono<{
    Bindings: ServiceBindings;
    Variables: { userId: string };
}>();

// Upload avatar
usersRoutes.post('/upload-avatar', async (c) => {
    const { dataUrl } = await c.req.json<{ dataUrl: string }>();

    const headers = new Headers(c.req.raw.headers);
    headers.set('Content-Type', 'application/json');

    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request('https://internal/users/upload-avatar', {
            method: 'POST',
            headers,
            body: JSON.stringify({ dataUrl }),
        })
    );

    if (!response.ok) {
        const error = await response.json() as { error?: string };
        return c.json({ error: error.error || 'Failed to upload avatar' }, 500);
    }

    return response.json();
});

// Delete avatar
usersRoutes.delete('/avatar', async (c) => {
    const response = await c.env.BACKEND_SERVICE.fetch(
        new Request('https://internal/users/avatar', {
            method: 'DELETE',
            headers: c.req.raw.headers,
        })
    );

    if (!response.ok) {
        return c.json({ error: 'Failed to delete avatar' }, 500);
    }

    return c.json({ success: true });
});
