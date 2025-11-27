import { Hono } from 'hono';
import { uploadBase64ToR2 } from '../../helpers/base64toR2';

export const imagesRouter = new Hono<{ Bindings: Env }>();

// Upload Image via base64 (from Extension)
imagesRouter.post('/upload', async (c) => {
    try {
        const { key, dataUrl } = await c.req.json<{ key: string; dataUrl: string }>();

        if (!key || !dataUrl) {
            return c.json({ error: 'Missing key or dataUrl' }, 400);
        }

        await uploadBase64ToR2(c.env.BUCKET, key, dataUrl);
        return c.json({ success: true, key });
    } catch (error) {
        console.error('Failed to upload image:', error);
        return c.json({ error: 'Upload failed' }, 500);
    }
});

// Legacy: Upload Image binary (keep for backwards compatibility)
imagesRouter.put('/:key', async (c) => {
    const key = c.req.param('key');
    const body = await c.req.arrayBuffer();

    await c.env.BUCKET.put(key, body);
    return c.json({ success: true });
});

// Retrieve Image (Proxy)
imagesRouter.get('/:key{.+}', async (c) => {
    const key = c.req.param('key');

    const object = await c.env.BUCKET.get(key);
    if (!object) {
        return c.text('Image not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, { headers });
});
