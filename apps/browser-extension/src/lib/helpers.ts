/**
 * Convert a PNG/JPEG dataUrl to WebP with compression using OffscreenCanvas
 * Works in service workers (no DOM required)
 * @param dataUrl - Base64 PNG/JPEG data URL
 * @param quality - WebP quality 0-1 (default 0.8)
 * @returns WebP data URL
 */
export async function convertToWebP(dataUrl: string, quality = 0.8): Promise<string> {
    // Fetch the image as a blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create ImageBitmap (works in service workers)
    const imageBitmap = await createImageBitmap(blob);
    
    // Use OffscreenCanvas (works in service workers)
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(imageBitmap, 0, 0);
    imageBitmap.close();
    
    // Convert to WebP blob
    const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality });
    
    // Convert blob to data URL
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(webpBlob);
    });
}

/**
 * Generates a simple, readable description from a DOM selector
 * Used for preview in sidepanel + future AI processing
 */
export function generateStepDescription(domSelector: string): string {
    if (!domSelector) return "Click here";

    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1] || domSelector;

    // Only extract tag name - ignore classes and IDs (often auto-generated)
    const tagMatch = lastPart.match(/^([a-z0-9-]+)/i);
    const tag = tagMatch?.[1]?.toLowerCase() || "element";

    const elementDescriptions: Record<string, string> = {
        button: "button",
        input: "input field",
        textarea: "text area",
        a: "link",
        select: "dropdown",
        img: "image",
        div: "section", 
        span: "text",
        nav: "navigation",
        li: "list item",
        ul: "list",
        ol: "list",
        label: "label",
        p: "paragraph",
        h1: "heading",
        h2: "heading",
        h3: "heading",
        h4: "heading",
        svg: "icon",
        path: "icon",
        form: "form",
        table: "table",
        tr: "row",
        td: "cell",
        header: "header",
        footer: "footer",
        main: "main content",
        article: "article",
        section: "section",
    };

    return `Click on ${elementDescriptions[tag] || tag}`;
}
