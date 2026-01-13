/**
 * Renders HTML content to PDF using Cloudflare Browser Rendering REST API
 * @param env - Environment variables containing Cloudflare credentials
 * @param htmlContent - Complete HTML document to convert to PDF
 * @returns PDF as Uint8Array
 */
export async function renderGuideToPdf(env: Env, htmlContent: string): Promise<Uint8Array> {
    console.log('🔧 Starting PDF render...');
    console.log(`📊 HTML size: ${htmlContent.length} bytes`);

    // Check credentials
    if (!env.CLOUDFLARE_ACCOUNT_ID) {
        throw new Error('❌ CLOUDFLARE_ACCOUNT_ID is not set in environment variables');
    }
    if (!env.CLOUDFLARE_API_TOKEN_BROWSER) {
        throw new Error('❌ CLOUDFLARE_API_TOKEN_BROWSER is not set in environment variables');
    }

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/pdf`;
    console.log(`🌐 API URL: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN_BROWSER}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: htmlContent,
                // Optional: Add inline styles for better PDF rendering
                // addStyleTag: [
                //     { content: "body { margin: 0; padding: 20mm; }" }
                // ]
            }),
        });

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Cloudflare API Error Response:', errorText);
            throw new Error(`Cloudflare PDF rendering failed: ${response.status} - ${errorText}`);
        }

        const pdfBuffer = await response.arrayBuffer();
        console.log(`✅ PDF generated successfully: ${pdfBuffer.byteLength} bytes`);
        return new Uint8Array(pdfBuffer);
    } catch (error) {
        console.error('❌ PDF render failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
}

/**
 * Prepares HTML content for export (no transformation needed, just pass through)
 * @param htmlContent - Complete HTML document
 * @returns The same HTML content
 */
export function prepareHtmlForExport(htmlContent: string): string {
    console.log('📄 Preparing HTML for export...');
    console.log(`📊 HTML size: ${htmlContent.length} bytes`);
    // For now, just return the HTML as-is
    // In the future, we could add optimizations like:
    // - Minifying HTML
    // - Inlining external resources
    // - Adding metadata
    return htmlContent;
}

/**
 * Converts a webp image to PNG using Cloudflare Browser Rendering screenshot API
 * Needed because docx library only supports png/jpg/gif/bmp, not webp
 */
export async function convertWebpToPng(
    env: Env,
    webpDataUrl: string,
    width: number,
    height: number
): Promise<string | null> {
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN_BROWSER) {
        console.error('❌ Missing Cloudflare credentials for webp conversion');
        return null;
    }

    // Create minimal HTML that just displays the image
    const html = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0}
body{width:${width}px;height:${height}px;overflow:hidden}
img{width:100%;height:100%;object-fit:contain}
</style></head>
<body><img src="${webpDataUrl}"/></body></html>`;

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/screenshot`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN_BROWSER}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html,
                screenshotOptions: {
                    type: 'png',
                    clip: { x: 0, y: 0, width, height },
                },
                viewport: { width, height },
            }),
        });

        if (!response.ok) {
            console.error('❌ Webp conversion failed:', response.status);
            return null;
        }

        const pngBuffer = await response.arrayBuffer();
        const base64 = uint8ArrayToBase64(new Uint8Array(pngBuffer));
        console.log(`✅ Converted webp to PNG: ${pngBuffer.byteLength} bytes`);
        return `data:image/png;base64,${base64}`;
    } catch (error) {
        console.error('❌ Webp to PNG conversion error:', error);
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
