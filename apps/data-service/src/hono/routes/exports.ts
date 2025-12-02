import { Hono } from 'hono';
import { renderGuideToPdf, prepareHtmlForExport } from '../../helpers/browser-render';

export const exportsRouter = new Hono<{ Bindings: Env }>();

// POST /exports/trigger - Trigger export workflow
exportsRouter.post('/trigger', async (c) => {
    try {
        const { guideId, accountId, format, htmlContent } = await c.req.json<{
            guideId: string;
            accountId: string;
            format: 'pdf' | 'html';
            htmlContent: string;
        }>();

        if (!guideId || !accountId || !format || !htmlContent) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        if (format !== 'pdf' && format !== 'html') {
            return c.json({ error: 'Invalid format. Must be pdf or html' }, 400);
        }

        // Trigger the workflow
        await c.env.GUIDE_EXPORT_WORKFLOW.create({
            params: {
                guideId,
                accountId,
                format,
                htmlContent,
            }
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

// POST /exports/pdf - Direct PDF export (synchronous, for testing)
exportsRouter.post('/pdf', async (c) => {
    try {
        const { htmlContent } = await c.req.json<{ htmlContent: string }>();

        if (!htmlContent) {
            return c.json({ error: 'Missing htmlContent' }, 400);
        }

        // Render HTML to PDF using Cloudflare REST API
        const pdfBytes = await renderGuideToPdf(c.env, htmlContent);

        // Return PDF as blob
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

        // Prepare HTML for export
        const processedHtml = prepareHtmlForExport(htmlContent);

        // Return HTML as blob
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
