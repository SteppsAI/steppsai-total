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
        console.log(`Uploaded image to R2: ${key}`);
        return c.json({ success: true, key });
    } catch (error) {
        console.error('Failed to upload image:', error);
        return c.json({ error: 'Upload failed' }, 500);
    }
});

// Delete images (for discard recording)
imagesRouter.post('/delete-batch', async (c) => {
    try {
        const { keys } = await c.req.json<{ keys: string[] }>();

        if (!keys || !Array.isArray(keys)) {
            return c.json({ error: 'Missing keys array' }, 400);
        }

        await Promise.all(keys.map(key => c.env.BUCKET.delete(key)));
        return c.json({ success: true, deleted: keys.length });
    } catch (error) {
        console.error('Failed to delete images:', error);
        return c.json({ error: 'Delete failed' }, 500);
    }
});

// Retrieve Image - Use wildcard to catch all paths including slashes
imagesRouter.get('/*', async (c) => {
    // Get full path after /images/
    const url = new URL(c.req.url);
    const fullPath = url.pathname;
    // Remove /images/ prefix to get R2 key
    const key = fullPath.replace(/^\/images\//, '');

    console.log(`GET image request - fullPath: ${fullPath}, key: ${key}`);

    if (!key) {
        return c.text('No key provided', 400);
    }

    const object = await c.env.BUCKET.get(key);
    if (!object) {
        console.log(`Image not found in R2: ${key}`);
        return c.text('Image not found', 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    // Ensure content-type is set for images
    if (!headers.get('content-type')) {
        if (key.endsWith('.webp')) {
            headers.set('content-type', 'image/webp');
        } else if (key.endsWith('.png')) {
            headers.set('content-type', 'image/png');
        } else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
            headers.set('content-type', 'image/jpeg');
        }
    }

    return new Response(object.body, { headers });
});

// Delete single image
imagesRouter.delete('/*', async (c) => {
    const url = new URL(c.req.url);
    const key = url.pathname.replace(/^\/images\//, '');

    try {
        await c.env.BUCKET.delete(key);
        return c.json({ success: true });
    } catch (error) {
        console.error('Failed to delete image:', error);
        return c.json({ error: 'Delete failed' }, 500);
    }
});

// Legacy: Upload Image binary
imagesRouter.put('/*', async (c) => {
    const url = new URL(c.req.url);
    const key = url.pathname.replace(/^\/images\//, '');
    const body = await c.req.arrayBuffer();

    await c.env.BUCKET.put(key, body);
    return c.json({ success: true });
});
