import { Hono } from 'hono';
import { renderGuideToPdf, prepareHtmlForExport } from '../../helpers/browser-render';

export const exportsRouter = new Hono<{
    Bindings: Env;
    Variables: { userId: string };
}>();

/**
 * POST /exports/trigger - Trigger export workflow
 * The workflow will:
 * 1. Fetch guide data from DB
 * 2. Fetch images from R2 and convert to base64
 * 3. Generate HTML server-side
 * 4. Convert to PDF (if needed)
 * 5. Upload to R2 and update DB
 */
exportsRouter.post('/trigger', async (c) => {
    try {
        const { guideId, format } = await c.req.json<{
            guideId: string;
            format: 'pdf' | 'html';
        }>();

        if (!guideId || !format) {
            return c.json({ error: 'Missing guideId or format' }, 400);
        }

        if (format !== 'pdf' && format !== 'html') {
            return c.json({ error: 'Invalid format. Must be pdf or html' }, 400);
        }

        // Trigger the workflow - it will fetch all data server-side
        await c.env.GUIDE_EXPORT_WORKFLOW.create({
            params: { guideId, format }
        });

        return c.json({ success: true, status: 'PENDING' });
    } catch (error) {
        console.error('Failed to trigger export workflow:', error);
        return c.json({
            error: 'Failed to start export process',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});


// TESTING ENDPOINTS (keep for debugging)

// POST /exports/pdf - Direct PDF export (synchronous, for testing)
exportsRouter.post('/pdf', async (c) => {
    try {
        const { htmlContent } = await c.req.json<{ htmlContent: string }>();

        if (!htmlContent) {
            return c.json({ error: 'Missing htmlContent' }, 400);
        }

        const pdfBytes = await renderGuideToPdf(c.env, htmlContent);

        return new Response(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="export.pdf"',
            },
        });
    } catch (error) {
        console.error('Failed to render PDF:', error);
        return c.json({
            error: 'PDF rendering failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});

// POST /exports/html - Direct HTML export (synchronous, for testing)
exportsRouter.post('/html', async (c) => {
    try {
        const { htmlContent } = await c.req.json<{ htmlContent: string }>();

        if (!htmlContent) {
            return c.json({ error: 'Missing htmlContent' }, 400);
        }

        const processedHtml = prepareHtmlForExport(htmlContent);

        return new Response(processedHtml, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': 'attachment; filename="export.html"',
            },
        });
    } catch (error) {
        console.error('Failed to export HTML:', error);
        return c.json({
            error: 'HTML export failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
});
