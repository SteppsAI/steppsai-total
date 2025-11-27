import { Hono } from 'hono';

export const imagesRouter = new Hono<{ Bindings: Env }>();

// Upload Image (Fire & Forget from Extension)
imagesRouter.put('/:key', async (c) => {
    const key = c.req.param('key');
    const body = await c.req.arrayBuffer();

    // TODO: Add proper authentication (e.g. JWT or API Key from Extension)
    // For now, we rely on the UUID key generation to be hard to guess

    await c.env.BUCKET.put(key, body);
    return c.json({ success: true });
});

// Retrieve Image (Proxy)
imagesRouter.get('/:key', async (c) => {
    const key = c.req.param('key');

    const object = await c.env.BUCKET.get(key);
    if (!object) {
        return c.text('Image not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new Response(object.body, {
        headers,
    });
});
