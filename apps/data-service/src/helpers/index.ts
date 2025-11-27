/**
 * Helpers for step descriptions and UI text generation
 */

/**
 * Generates a human-readable description from a DOM selector
 * @param domSelector - CSS selector string (e.g., "button#submit", "input.search-box")
 * @returns Human-readable action text (e.g., "Click on Submit button")
 */
export function generateStepDescription(domSelector: string): string {
    if (!domSelector) return "Click here";

    // Extract meaningful parts from selector
    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1] || domSelector;

    // Parse the last element
    const tagMatch = lastPart.match(/^([a-z0-9-]+)/i);
    const idMatch = lastPart.match(/#([a-zA-Z0-9_-]+)/);
    const classMatch = lastPart.match(/\.([a-zA-Z0-9_-]+)/);

    const tag = tagMatch?.[1]?.toLowerCase() || "element";
    const id = idMatch?.[1];
    const className = classMatch?.[1];

    // Generate description based on element type
    const elementDescriptions: Record<string, string> = {
        button: "button",
        input: "input field",
        textarea: "text area",
        a: "link",
        select: "dropdown",
        img: "image",
        div: "section",
        span: "text",
        form: "form",
        nav: "navigation",
        header: "header",
        footer: "footer",
        li: "list item",
        ul: "list",
        ol: "list",
        table: "table",
        tr: "row",
        td: "cell",
        th: "header cell",
        label: "label",
        p: "paragraph",
        h1: "heading",
        h2: "heading",
        h3: "heading",
        h4: "heading",
        h5: "heading",
        h6: "heading",
        video: "video",
        audio: "audio",
        canvas: "canvas",
        svg: "icon",
    };

    const elementType = elementDescriptions[tag] || tag;

    // Build description
    if (id) {
        // Clean up ID for readability (e.g., "search-box" → "Search Box")
        const readableId = id
            .replace(/[-_]/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .toLowerCase();
        return `Click on ${readableId} ${elementType}`;
    }

    if (className) {
        // Clean up class name
        const readableClass = className
            .replace(/[-_]/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .toLowerCase();
        return `Click on ${readableClass} ${elementType}`;
    }

    return `Click on ${elementType}`;
}

/**
 * Shortens a selector for display purposes
 * @param domSelector - Full CSS selector
 * @param maxLength - Maximum length before truncation
 */
export function shortenSelector(domSelector: string, maxLength: number = 30): string {
    if (!domSelector) return "";
    if (domSelector.length <= maxLength) return domSelector;

    // Try to show the most relevant part (last element)
    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1];

    if (lastPart && lastPart.length <= maxLength) {
        return `...${lastPart}`;
    }

    return domSelector.substring(0, maxLength - 3) + "...";
}


