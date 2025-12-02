import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { renderGuideToPdf } from '../helpers/browser-render';
import { getGuide, updateGuideExportStatus } from '@repo/data-ops/queries/guides';
import { initDatabase } from '@repo/data-ops/database';
import { v4 as uuidv4 } from 'uuid';

interface ExportPdfParams {
    guideId: string;
    accountId: string;
}

export class GuidePdfExportWorkflow extends WorkflowEntrypoint<Env, ExportPdfParams> {
    async run(event: Readonly<WorkflowEvent<ExportPdfParams>>, step: WorkflowStep) {
        // Initialize DB connection with the environment binding
        initDatabase(this.env.DATABASE_URL);

        const { guideId, accountId } = event.payload;

        // 1. Gather Data & Generate HTML
        const renderContext = await step.do('Prepare HTML Content', async () => {
            const guide = await getGuide(guideId);
            if (!guide) throw new Error(`Guide not found: ${guideId}`);

            // Generate HTML
            // Basic styling for now, can be enhanced later
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                            padding: 40px; 
                            max-width: 800px; 
                            margin: 0 auto; 
                            color: #1a1a1a;
                        }
                        h1 { font-size: 24px; margin-bottom: 10px; }
                        .meta { color: #666; font-size: 14px; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        .step { margin-bottom: 40px; break-inside: avoid; page-break-inside: avoid; }
                        .step-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                        .step-number { background: #000; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
                        .step-description { font-size: 16px; line-height: 1.6; margin-bottom: 15px; color: #333; }
                        img { max-width: 100%; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                    </style>
                </head>
                <body>
                    <h1>${guide.title || 'Untitled Guide'}</h1>
                    <div class="meta">
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    ${(guide.steps || []).map((step: any, index: number) => `
                        <div class="step">
                            <div class="step-title">
                                <span class="step-number">${index + 1}</span>
                                ${step.title || `Step ${index + 1}`}
                            </div>
                            ${step.description ? `<div class="step-description">${step.description}</div>` : ''}
                            ${step.imageUrl ? `<img src="${step.imageUrl}" />` : ''}
                        </div>
                    `).join('')}
                </body>
                </html>
            `;

            return { htmlContent };
        });

        // 2. Render to PDF
        const pdfBuffer = await step.do('Render PDF', async () => {
            return await renderGuideToPdf(this.env, renderContext.htmlContent);
        });

        // 3. Upload to R2 and Update DB
        await step.do('Upload and Finalize', async () => {
            const fileId = uuidv4();
            const r2Key = `exports/${accountId}/${guideId}/${fileId}.pdf`;

            await this.env.BUCKET.put(r2Key, pdfBuffer, {
                httpMetadata: { contentType: 'application/pdf' }
            });

            // Construct the public URL (assuming ASSETS_URL is set in env or we use a standard pattern)
            // If ASSETS_URL is not available in Env directly, we might need to construct it or pass it in payload.
            // For now, let's assume a standard R2 public access pattern or use the ASSETS_URL var if available.
            const baseUrl = this.env.ASSETS_URL || 'https://assets.stepps.ai';
            const publicUrl = `${baseUrl}/${r2Key}`;

            await updateGuideExportStatus(guideId, 'pdf', 'COMPLETED', publicUrl);
        });
    }
}
