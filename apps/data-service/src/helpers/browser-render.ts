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
