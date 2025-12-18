import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { renderGuideToPdf } from '../helpers/browser-render';
import { generateExportHtml, imageToBase64DataUrl } from '../helpers/generateExportHtml';
import { generateExportDocx } from '../helpers/generateExportDocx';
import { getGuide, updateGuideExportStatus } from '@repo/data-ops/queries/guides';
import { initDatabase } from '@repo/data-ops/database';
import { v4 as uuidv4 } from 'uuid';
import type { ExportParams, Step, ImageDataResult } from '@repo/data-ops/zod-schema';

export class GuidePdfExportWorkflow extends WorkflowEntrypoint<Env, ExportParams> {
    async run(event: Readonly<WorkflowEvent<ExportParams>>, step: WorkflowStep) {
        const { guideId, format } = event.payload;

        console.log('🚀 Export workflow started');
        console.log('📋 Payload:', JSON.stringify({ guideId, format }));

        const retryConfig = {
            retries: {
                limit: 3,
                delay: 5000,
                backoff: 'exponential' as const,
            },
            timeout: '10 minutes' as const,
        };

        // Step 1: Fetch guide data from database
        const guide = await step.do('Fetch Guide', retryConfig, async () => {
            initDatabase(this.env.DATABASE_URL);
            console.log('📚 Fetching guide:', guideId);

            const guideData = await getGuide(guideId);
            if (!guideData) {
                throw new Error(`Guide not found: ${guideId}`);
            }

            console.log('✅ Guide fetched:', guideData.title);
            console.log('📊 Steps count:', guideData.steps?.length || 0);
            return guideData;
        });

        const userId = guide.userId;

        // Step 2: Generate HTML with embedded images
        // Combined into single step to avoid serialization issues with large base64 strings
        const htmlContent = await step.do('Generate HTML with Images', retryConfig, async () => {
            const steps = (guide.steps || []) as Step[];
            console.log('🖼️ Preparing images for', steps.length, 'steps');

            // ImageMap now includes aspect ratio for proper overlay scaling
            const imageMap: Record<string, ImageDataResult> = {};

            for (const stepItem of steps) {
                if (!stepItem.imageKey || stepItem.isExcluded) {
                    console.log(`⏭️ Skipping step ${stepItem.id}: no imageKey or excluded`);
                    continue;
                }

                console.log(`📥 Fetching image for step ${stepItem.id}: ${stepItem.imageKey}`);
                const imageData = await imageToBase64DataUrl(this.env.BUCKET, stepItem.imageKey);

                if (imageData) {
                    imageMap[stepItem.id] = imageData;
                    console.log(`✅ Image loaded for step ${stepItem.id} (${imageData.dataUrl.length} chars, AR: ${imageData.aspectRatio.toFixed(2)})`);
                } else {
                    console.warn(`⚠️ Image not found: ${stepItem.imageKey}`);
                }
            }

            console.log(`📊 Loaded ${Object.keys(imageMap).length} images`);
            console.log('📄 Generating HTML...');

            const html = generateExportHtml(guide, imageMap);
            console.log(`✅ HTML generated: ${html.length} bytes`);

            return html;
        });

        // Step 3: Delete old exports from R2 and update DB to PENDING
        await step.do('Delete Old Export', retryConfig, async () => {
            initDatabase(this.env.DATABASE_URL);

            const prefix = `exports/${userId}/${guideId}/`;
            const extensionMap: Record<string, string> = { pdf: '.pdf', html: '.html', docx: '.docx' };
            const extension = extensionMap[format] || '.pdf';

            console.log(`🗑️ Deleting old ${format} files with prefix: ${prefix}`);

            try {
                const listed = await this.env.BUCKET.list({ prefix, limit: 100 });
                const toDelete = listed.objects.filter(obj => obj.key.endsWith(extension));

                if (toDelete.length > 0) {
                    await Promise.all(toDelete.map(obj => this.env.BUCKET.delete(obj.key)));
                    console.log(`✅ Deleted ${toDelete.length} old ${format} file(s)`);
                } else {
                    console.log(`ℹ️ No old ${format} files to delete`);
                }
            } catch (error) {
                console.error('❌ Failed to delete old files:', error);
            }

            await updateGuideExportStatus(guideId, format, 'PENDING');
            console.log('✅ DB updated to PENDING');
        });

        // Step 4: Render export based on format
        // Store temporarily in R2 to avoid 1 MiB step output limit
        const tempR2Key = await step.do('Render Export', retryConfig, async () => {
            const extensionMap: Record<string, string> = { pdf: 'pdf', html: 'html', docx: 'docx' };
            const ext = extensionMap[format] || 'pdf';
            const tempKey = `temp-exports/${userId}/${guideId}/${uuidv4()}.${ext}`;

            if (format === 'pdf') {
                console.log('🎨 Rendering PDF...');
                console.log(`📊 HTML size for PDF: ${htmlContent.length} bytes`);

                try {
                    const pdfBytes = await renderGuideToPdf(this.env, htmlContent);
                    console.log(`✅ PDF rendered: ${pdfBytes.length} bytes`);

                    await this.env.BUCKET.put(tempKey, pdfBytes, {
                        httpMetadata: { contentType: 'application/pdf' }
                    });
                    console.log(`📦 PDF stored temporarily at: ${tempKey}`);

                    return tempKey;
                } catch (error) {
                    console.error('❌ PDF render failed:', error);
                    initDatabase(this.env.DATABASE_URL);
                    await updateGuideExportStatus(guideId, format, 'FAILED');
                    throw error;
                }
            } else if (format === 'docx') {
                console.log('📝 Rendering Word document...');

                try {
                    // Re-fetch images for docx generation (imageMap from step 2 is embedded in HTML)
                    const steps = (guide.steps || []) as Step[];
                    const imageMap: Record<string, ImageDataResult> = {};

                    for (const stepItem of steps) {
                        if (!stepItem.imageKey || stepItem.isExcluded) continue;
                        const imageData = await imageToBase64DataUrl(this.env.BUCKET, stepItem.imageKey);
                        if (imageData) {
                            imageMap[stepItem.id] = imageData;
                        }
                    }

                    const docxBytes = await generateExportDocx(guide, imageMap);
                    console.log(`✅ Word document generated: ${docxBytes.length} bytes`);

                    await this.env.BUCKET.put(tempKey, docxBytes, {
                        httpMetadata: { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
                    });
                    console.log(`📦 Word document stored temporarily at: ${tempKey}`);

                    return tempKey;
                } catch (error) {
                    console.error('❌ Word document generation failed:', error);
                    initDatabase(this.env.DATABASE_URL);
                    await updateGuideExportStatus(guideId, format, 'FAILED');
                    throw error;
                }
            } else {
                // HTML format
                await this.env.BUCKET.put(tempKey, htmlContent, {
                    httpMetadata: { contentType: 'text/html' }
                });
                console.log(`📦 HTML stored temporarily at: ${tempKey}`);
                return tempKey;
            }
        });

        // Step 5: Move from temp location to final location and update DB to COMPLETED
        await step.do('Upload Export', retryConfig, async () => {
            initDatabase(this.env.DATABASE_URL);

            const fileId = uuidv4();
            const extensionMap: Record<string, string> = { pdf: 'pdf', html: 'html', docx: 'docx' };
            const contentTypeMap: Record<string, string> = {
                pdf: 'application/pdf',
                html: 'text/html',
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            };
            const extension = extensionMap[format] || 'pdf';
            const r2Key = `exports/${userId}/${guideId}/${fileId}.${extension}`;
            const contentType = contentTypeMap[format] || 'application/pdf';

            console.log(`☁️ Moving from temp to final location: ${r2Key}`);

            try {
                // Fetch from temp location
                const tempObject = await this.env.BUCKET.get(tempR2Key);
                if (!tempObject) {
                    throw new Error(`Temp file not found: ${tempR2Key}`);
                }

                const fileContent = await tempObject.arrayBuffer();

                // Upload to final location
                await this.env.BUCKET.put(r2Key, fileContent, {
                    httpMetadata: { contentType }
                });
                console.log('✅ Upload successful');

                // Delete temp file
                await this.env.BUCKET.delete(tempR2Key);
                console.log('🗑️ Temp file deleted');

                const baseUrl = this.env.ASSETS_URL ?? 'https://stepps-assets-stage.stepps.ai';
                const publicUrl = `${baseUrl}/${r2Key}`;
                console.log(`🔗 Public URL: ${publicUrl}`);

                await updateGuideExportStatus(guideId, format, 'COMPLETED', publicUrl);
                console.log('✅ Export completed successfully!');
            } catch (error) {
                console.error('❌ Upload failed:', error);
                await updateGuideExportStatus(guideId, format, 'FAILED');
                throw error;
            }
        });
    }
}
