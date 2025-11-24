import { Hono } from 'hono';

export const imagesRouter = new Hono<{ Bindings: Env }>();

// Upload Image (Fire & Forget from Extension)
imagesRouter.put('/:key', async (c) => {
    const key = c.req.param('key');
    const body = await c.req.arrayBuffer();

    // TODO: Add proper authentication (e.g. JWT or API Key from Extension)

    await c.env.BUCKET.put(key, body);
    return c.json({ success: true });
});

// Retrieve Image (Proxy)
imagesRouter.get('/:key', async (c) => {
    const key = c.req.param('key');

    // TODO: Add proper authentication (e.g. Session Cookie check)

    const object = await c.env.BUCKET.get(key);
    if (!object) {
        return c.text('Image not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, {
        headers,
    });
});
