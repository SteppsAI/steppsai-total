/**
 * Generates a human-readable description from a DOM selector
 * Only uses element type - ignores IDs and classes (often auto-generated garbage)
 * @param domSelector - CSS selector string
 * @returns Human-readable action text (e.g., "Click on text area")
 */
export function generateStepDescription(domSelector: string): string {
    if (!domSelector) return "Click here";

    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1] || domSelector;

    // Only extract tag name - ignore IDs and classes
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
        path: "icon",
        main: "main content",
        article: "article",
        section: "section",
        aside: "sidebar",
    };

    return `Click on ${elementDescriptions[tag] || tag}`;
}
