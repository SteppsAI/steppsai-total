/**
 * Server-side HTML generation for guide exports
 * Generates a self-contained HTML document with embedded base64 images
 */
import type { Guide, Step, Overlay, ImageMeta, ImageDataResult } from '@repo/data-ops/zod-schema';

/**
 * Generates a complete HTML document for export
 * @param guide - Guide data with steps
 * @param imageMap - Map of stepId to base64 data URL
 * @returns Complete HTML string
 */
export function generateExportHtml(
    guide: Guide,
    imageMap: Record<string, string | ImageMeta>
): string {
    const steps = (guide.steps || []) as Step[];

    const visibleSteps = steps
        .filter((step) => !step.isExcluded)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    const stepsHtml = visibleSteps
        .map((step, index) => {
            const imageEntry = imageMap[step.id];
            // Support both string (legacy) and ImageMeta (new) formats
            const imageDataUrl = typeof imageEntry === 'string' ? imageEntry : imageEntry?.dataUrl || '';
            const aspectRatio = typeof imageEntry === 'object' ? imageEntry.aspectRatio : undefined;

            const caption = step.caption || step.aiCaption || `Step ${index + 1}`;

            // Check current step image status
            const hasImage = !!(step.imageKey && imageDataUrl);

            // Check previous step image status to determine if we are starting a text group
            const prevStep = visibleSteps[index - 1];
            const prevImageEntry = prevStep ? imageMap[prevStep.id] : undefined;
            const prevDataUrl = typeof prevImageEntry === 'string' ? prevImageEntry : prevImageEntry?.dataUrl || '';
            const prevHasImage = prevStep ? !!(prevStep.imageKey && prevDataUrl) : false;

            // Logic:
            // If this is the FIRST step, it's a "start"
            // If the PREVIOUS step had an image, this step (if text) starts a new group/page -> "start"
            // If the PREVIOUS step was text, and this is text, this is a "follow" -> less padding

            const isFirstStep = index === 0;
            const previousWasImageOrBreak = isFirstStep || prevHasImage;

            // Check next step for grouping logic
            const nextStep = visibleSteps[index + 1];
            const nextImageEntry = nextStep ? imageMap[nextStep.id] : undefined;
            const nextDataUrl = typeof nextImageEntry === 'string' ? nextImageEntry : nextImageEntry?.dataUrl || '';
            const nextHasImage = nextStep ? !!(nextStep.imageKey && nextDataUrl) : false;

            let pageBreakClass = '';
            let stepClass = 'step';

            if (hasImage) {
                stepClass = 'step step-with-image';
                pageBreakClass = 'force-break';
            } else {
                // Text Only
                if (previousWasImageOrBreak) {
                    stepClass = 'step step-text-start'; // 80px top padding
                } else {
                    stepClass = 'step step-text-follow'; // Standard spacing
                }

                if (nextHasImage) {
                    pageBreakClass = 'force-break';
                } else {
                    pageBreakClass = 'avoid-break-after';
                }
            }

            // Override for last element
            if (index === visibleSteps.length - 1) {
                pageBreakClass = '';
            }

            let imageHtml = '';
            if (hasImage) {
                const overlaysSvg = renderOverlaysSvg(step.overlays, aspectRatio);
                imageHtml = `
                    <div class="screenshot">
                        <img src="${imageDataUrl}" alt="Step ${index + 1}" />
                        ${overlaysSvg}
                    </div>
                `;
            } else if (step.imageKey) {
                imageHtml = `
                    <div class="screenshot">
                        <div class="screenshot-placeholder">Image could not be loaded</div>
                    </div>
                `;
            }

            return `
                <div class="${stepClass} ${pageBreakClass}">
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-number">${index + 1}</div>
                            <div class="step-title-wrapper">
                                <h2>${escapeHtml(caption)}</h2>
                            </div>
                        </div>
                    </div>
                    ${imageHtml}
                </div>
            `;
        })
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(guide.title || 'Guide')}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #ffffff;
            color: #0B0F19;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
        }

        .container {
            max-width: 768px;
            margin: 0 auto;
            padding: 48px 24px 80px;
        }

        @media (min-width: 768px) {
            .container {
                padding: 0 24px;
                max-width: 100%;
            }
        }

        .header {
            text-align: center;
            border-bottom: none;
            margin-bottom: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            break-after: page;
        }

        h1 {
            font-size: 1.875rem;
            font-weight: 700;
            letter-spacing: -0.025em;
            color: #0B0F19;
        }

        @media (min-width: 768px) {
            h1 {
                font-size: 3rem;
            }
        }

        .description {
            font-size: 1.25rem;
            color: #6b7280;
            line-height: 1.625;
            max-width: 640px;
            margin: 16px auto 0;
        }

        .steps {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        /* Base Step Style */
        .step {
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: relative;
        }

        /* Image Steps - Specific Layout */
        .step-with-image {
             min-height: 100vh;
             justify-content: start;
             padding-top: 80px; /* CONSTANT TOP PADDING */
             padding-bottom: 40px;
        }
        
        /* Text Start Steps - Same top padding as Image Steps */
        .step-text-start {
             padding-top: 80px; /* CONSTANT TOP PADDING */
             padding-bottom: 24px;
        }
        
        /* Follow-up text steps - tighter spacing */
        .step-text-follow {
            padding-top: 24px;
            padding-bottom: 24px;
        }

        /* Page Break Utilities */
        .force-break {
            page-break-after: always;
            break-after: page;
        }
        
        .avoid-break-after {
            page-break-after: avoid;
            break-after: avoid;
        }

        .step-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 768px;
            width: 100%;
            margin: 0 auto;
            flex-shrink: 0; 
            align-items: center; 
            text-align: center;
        }

        .step-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }

        /* Step number with primary color background */
        .step-number {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.1);
            color: #6366F1;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .step h2 {
            font-size: 1.5rem;
            font-weight: 500;
            line-height: 1.4;
            color: #0B0F19;
            margin: 0;
        }

        @media (min-width: 768px) {
            .step h2 {
                font-size: 2rem;
            }
        }

        .screenshot {
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            background: rgba(0, 0, 0, 0.025);
            position: relative;
            outline: 1px solid rgba(0, 0, 0, 0.05);
            outline-offset: -1px;
            max-width: 90%;
            width: 100%;
            margin: 0 auto;
        }

        .screenshot img {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
            background: #ffffff;
            max-height: 80vh;
        }

        .screenshot-placeholder {
            width: 100%;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f4f6;
            color: #9ca3af;
            font-size: 0.875rem;
        }

        .overlays {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        /* Print Specifics */
        @media print {
            .container {
                padding: 0;
                width: 100%;
                max-width: 100%;
            }
            
            .header {
                height: 100vh;
                margin-bottom: 0;
            }
            
            .step-with-image {
                height: 100vh;
            }
            
            /* Ensure text steps don't get split awkwardly */
            .step-text-start, .step-text-follow {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(guide.title || 'Untitled Guide')}</h1>
            ${guide.description ? `<p class="description">${escapeHtml(guide.description)}</p>` : ''}
        </div>
        <div class="steps">
            ${stepsHtml}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Renders overlay annotations as an SVG element
 * 
 * CRITICAL: This must match the rendering logic in canvas.tsx exactly.
 */
function renderOverlaysSvg(overlays?: Overlay[], imageAspectRatio?: number): string {
    if (!overlays || overlays.length === 0) return '';

    // Use a large viewBox for precision (1000x1000 base, adjusted for aspect ratio)
    const viewBoxWidth = 1000;
    const viewBoxHeight = imageAspectRatio ? viewBoxWidth / imageAspectRatio : 1000;
    const minDim = Math.min(viewBoxWidth, viewBoxHeight);

    // Collect unique colors for arrow markers
    const arrowColors = new Set<string>();
    overlays.forEach(o => {
        if (o.type === 'arrow') {
            arrowColors.add(o.color || '#ef4444');
        }
    });

    // Generate marker definitions
    const markers = Array.from(arrowColors).map((color, idx) => {
        const markerId = `arrowhead-${idx}`;
        return `<marker id="${markerId}" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 12 6, 0 12" fill="${color}" />
                </marker>`;
    }).join('\n                ');

    // Create color to marker ID mapping
    const colorToMarkerId: Record<string, string> = {};
    Array.from(arrowColors).forEach((color, idx) => {
        colorToMarkerId[color] = `arrowhead-${idx}`;
    });

    const elements = overlays
        .map((overlay) => {
            if (overlay.type === 'circle') {
                const cx = ((overlay.x ?? 50) / 100) * viewBoxWidth;
                const cy = ((overlay.y ?? 50) / 100) * viewBoxHeight;
                const radius = ((overlay.radius ?? 2.5) / 100) * minDim;
                const color = overlay.color || '#ef4444';
                const strokeWidth = overlay.strokeWidth || 3;

                return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" />`;
            }

            if (overlay.type === 'arrow') {
                const points = overlay.points;
                if (!points || points.length < 4) return '';
                const x1 = (points[0] / 100) * viewBoxWidth;
                const y1 = (points[1] / 100) * viewBoxHeight;
                const x2 = (points[2] / 100) * viewBoxWidth;
                const y2 = (points[3] / 100) * viewBoxHeight;
                const color = overlay.color || '#ef4444';
                const strokeWidth = overlay.strokeWidth || 4;
                const markerId = colorToMarkerId[color] || 'arrowhead-0';

                return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#${markerId})" />`;
            }

            if (overlay.type === 'hide') {
                const x = ((overlay.x ?? 0) / 100) * viewBoxWidth;
                const y = ((overlay.y ?? 0) / 100) * viewBoxHeight;
                const width = ((overlay.width ?? 10) / 100) * viewBoxWidth;
                const height = ((overlay.height ?? 10) / 100) * viewBoxHeight;
                const color = overlay.color || '#000';
                const rectX = width < 0 ? x + width : x;
                const rectY = height < 0 ? y + height : y;
                return `<rect x="${rectX}" y="${rectY}" width="${Math.abs(width)}" height="${Math.abs(height)}" fill="${color}" rx="4" />`;
            }

            if (overlay.type === 'text') {
                const x = ((overlay.x ?? 50) / 100) * viewBoxWidth;
                const y = ((overlay.y ?? 50) / 100) * viewBoxHeight;
                const text = overlay.text || '';
                const fontSize = (overlay.fontSize || 20) * (viewBoxWidth / 800);
                const fontFamily = overlay.fontFamily || 'Arial';
                const fill = overlay.fill || '#000';

                return `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="${fontFamily}" fill="${fill}" dominant-baseline="hanging">${escapeHtml(text)}</text>`;
            }

            return '';
        })
        .filter(Boolean)
        .join('\n            ');

    if (!elements) return '';

    return `
        <svg class="overlays" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" preserveAspectRatio="none">
            <defs>
                ${markers}
            </defs>
            ${elements}
        </svg>
    `;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Fetches an image from R2 and converts it to a base64 data URL
 * Also extracts image dimensions for proper overlay rendering
 * Uses chunked approach for large binary data compatibility in Workers
 */
export async function imageToBase64DataUrl(
    bucket: R2Bucket,
    imageKey: string
): Promise<ImageDataResult | null> {
    try {
        let key = imageKey;
        const urlPrefixes = [
            'https://stepps-assets-stage.stepps.ai/',
            'https://assets.stepps.ai/',
            'https://stepps-assets-production.stepps.ai/',
        ];

        for (const prefix of urlPrefixes) {
            if (key.startsWith(prefix)) {
                key = key.replace(prefix, '');
                break;
            }
        }

        if (key.startsWith('https://')) {
            const url = new URL(key);
            key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
        }

        console.log(`📥 Fetching image from R2: ${key} (original: ${imageKey})`);
        const object = await bucket.get(key);
        if (!object) {
            console.warn(`⚠️ Image not found in R2: ${key}`);
            return null;
        }

        const buffer = await object.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        const dimensions = getImageDimensions(bytes);
        const aspectRatio = dimensions ? dimensions.width / dimensions.height : 16 / 9;

        const base64 = uint8ArrayToBase64(bytes);
        const contentType = object.httpMetadata?.contentType || getContentTypeFromKey(key);

        return {
            dataUrl: `data:${contentType};base64,${base64}`,
            aspectRatio,
        };
    } catch (error) {
        console.error(`❌ Failed to fetch image ${imageKey}:`, error);
        return null;
    }
}

/**
 * Extracts image dimensions from binary data
 */
function getImageDimensions(bytes: Uint8Array): { width: number; height: number } | null {
    try {
        // WebP
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
            // VP8
            if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x20) {
                const width = (bytes[26] | (bytes[27] << 8)) & 0x3FFF;
                const height = (bytes[28] | (bytes[29] << 8)) & 0x3FFF;
                return { width, height };
            }
            // VP8L
            if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x4C) {
                const signature = bytes[21];
                if (signature !== 0x2F) return null;
                const bits = bytes[22] | (bytes[23] << 8) | (bytes[24] << 16) | (bytes[25] << 24);
                const width = (bits & 0x3FFF) + 1;
                const height = ((bits >> 14) & 0x3FFF) + 1;
                return { width, height };
            }
            // VP8X
            if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38 && bytes[15] === 0x58) {
                const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
                const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
                return { width, height };
            }
        }

        // PNG
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
            const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
            const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
            return { width, height };
        }

        // JPEG
        if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
            let offset = 2;
            while (offset < bytes.length - 8) {
                if (bytes[offset] !== 0xFF) break;
                const marker = bytes[offset + 1];
                if (marker >= 0xC0 && marker <= 0xC2) {
                    const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
                    const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
                    return { width, height };
                }
                const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
                offset += 2 + length;
            }
        }

        // GIF
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
            const width = bytes[6] | (bytes[7] << 8);
            const height = bytes[8] | (bytes[9] << 8);
            return { width, height };
        }

        return null;
    } catch {
        return null;
    }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    const CHUNK_SIZE = 8192;
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return btoa(binary);
}

function getContentTypeFromKey(key: string): string {
    if (key.endsWith('.webp')) return 'image/webp';
    if (key.endsWith('.png')) return 'image/png';
    if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
    if (key.endsWith('.gif')) return 'image/gif';
    return 'image/webp';
}
