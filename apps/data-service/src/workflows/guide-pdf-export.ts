import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { renderGuideToPdf, prepareHtmlForExport } from '../helpers/browser-render';
import { updateGuideExportStatus } from '@repo/data-ops/queries/guides';
import { initDatabase } from '@repo/data-ops/database';
import { v4 as uuidv4 } from 'uuid';
import type { ExportParams } from '@repo/data-ops/zod-schema';


export class GuidePdfExportWorkflow extends WorkflowEntrypoint<Env, ExportParams> {
    async run(event: Readonly<WorkflowEvent<ExportParams>>, step: WorkflowStep) {
        console.log('🚀 Export workflow started');
        console.log('📋 Payload:', JSON.stringify({ guideId: event.payload.guideId, format: event.payload.format, htmlSize: event.payload.htmlContent.length }));

        // Initialize DB connection with the environment binding
        initDatabase(this.env.DATABASE_URL);

        const { guideId, accountId, format, htmlContent } = event.payload;

        // Retry config: max 3 attempts, no timeout (fail fast)
        const stepConfig = {
            retries: {
                limit: 3,
                delay: 5000, // 5 seconds
                backoff: 'exponential' as const,
            },
        };

        try {
            if (format === 'pdf') {
                console.log('📄 Starting PDF export...');

                // TODO: getImage based on the guideId. 

                // 0. Delete old PDF exports for this guide
                await step.do('Delete old PDF', stepConfig, async () => {
                    try {
                        const prefix = `exports/${accountId}/${guideId}/`;
                        console.log(`🗑️ Deleting old PDFs with prefix: ${prefix}`);
                        const listed = await this.env.BUCKET.list({ prefix, limit: 100 });

                        // Filter for PDF files only
                        const pdfFiles = listed.objects.filter(obj => obj.key.endsWith('.pdf'));

                        if (pdfFiles.length > 0) {
                            await Promise.all(pdfFiles.map(obj => this.env.BUCKET.delete(obj.key)));
                            console.log(`✅ Deleted ${pdfFiles.length} old PDF(s)`);
                        } else {
                            console.log('ℹ️ No old PDFs to delete');
                        }
                    } catch (error) {
                        console.error('❌ Failed to delete old PDFs:', error);
                        // Don't throw - continue with export even if deletion fails
                    }
                });

                // 1. Render HTML to PDF using Cloudflare REST API
                const pdfBuffer = await step.do('Render PDF', stepConfig, async () => {
                    try {
                        console.log('🎨 Calling renderGuideToPdf...');
                        const result = await renderGuideToPdf(this.env, htmlContent);
                        console.log('✅ PDF rendered successfully');
                        return result;
                    } catch (error) {
                        console.error('❌ PDF render failed in workflow step:', error);
                        await updateGuideExportStatus(guideId, 'pdf', 'FAILED');
                        throw error;
                    }
                });

                // 2. Upload PDF to R2
                await step.do('Upload PDF', stepConfig, async () => {
                    try {
                        const fileId = uuidv4();
                        const r2Key = `exports/${accountId}/${guideId}/${fileId}.pdf`;
                        console.log(`☁️ Uploading PDF to R2: ${r2Key}`);

                        await this.env.BUCKET.put(r2Key, pdfBuffer, {
                            httpMetadata: { contentType: 'application/pdf' }
                        });
                        console.log('✅ PDF uploaded to R2');

                        // Use stage URL as default if ASSETS_URL is not set
                        const baseUrl = this.env.ASSETS_URL ?? 'https://stepps-assets-stage.stepps.ai';
                        const publicUrl = `${baseUrl}/${r2Key}`;
                        console.log(`🔗 Public URL: ${publicUrl}`);

                        await updateGuideExportStatus(guideId, 'pdf', 'COMPLETED', publicUrl);
                        console.log('✅ PDF export completed successfully');
                    } catch (error) {
                        console.error('❌ PDF upload failed:', error);
                        await updateGuideExportStatus(guideId, 'pdf', 'FAILED');
                        throw error;
                    }
                });
            } else if (format === 'html') {
                console.log('📄 Starting HTML export...');

                // 0. Delete old HTML exports for this guide
                await step.do('Delete old HTML', stepConfig, async () => {
                    try {
                        const prefix = `exports/${accountId}/${guideId}/`;
                        console.log(`🗑️ Deleting old HTML files with prefix: ${prefix}`);
                        const listed = await this.env.BUCKET.list({ prefix, limit: 100 });

                        // Filter for HTML files only
                        const htmlFiles = listed.objects.filter(obj => obj.key.endsWith('.html'));

                        if (htmlFiles.length > 0) {
                            await Promise.all(htmlFiles.map(obj => this.env.BUCKET.delete(obj.key)));
                            console.log(`✅ Deleted ${htmlFiles.length} old HTML file(s)`);
                        } else {
                            console.log('ℹ️ No old HTML files to delete');
                        }
                    } catch (error) {
                        console.error('❌ Failed to delete old HTML files:', error);
                        // Don't throw - continue with export even if deletion fails
                    }
                });

                // 1. Prepare HTML for export (optional processing)
                const processedHtml = await step.do('Prepare HTML', stepConfig, async () => {
                    console.log('🎨 Preparing HTML...');
                    return prepareHtmlForExport(htmlContent);
                });

                // 2. Upload HTML to R2
                await step.do('Upload HTML', stepConfig, async () => {
                    try {
                        const fileId = uuidv4();
                        const r2Key = `exports/${accountId}/${guideId}/${fileId}.html`;
                        console.log(`☁️ Uploading HTML to R2: ${r2Key}`);

                        await this.env.BUCKET.put(r2Key, processedHtml, {
                            httpMetadata: { contentType: 'text/html' }
                        });
                        console.log('✅ HTML uploaded to R2');

                        // Use stage URL as default if ASSETS_URL is not set
                        const baseUrl = this.env.ASSETS_URL ?? 'https://stepps-assets-stage.stepps.ai';
                        const publicUrl = `${baseUrl}/${r2Key}`;
                        console.log(`🔗 Public URL: ${publicUrl}`);

                        await updateGuideExportStatus(guideId, 'html', 'COMPLETED', publicUrl);
                        console.log('✅ HTML export completed successfully');
                    } catch (error) {
                        console.error('❌ HTML upload failed:', error);
                        await updateGuideExportStatus(guideId, 'html', 'FAILED');
                        throw error;
                    }
                });
            } else {
                throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('❌ Workflow failed:', error);
            throw error;
        }
    }
}
