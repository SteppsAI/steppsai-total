/**
 * Generates a simple, readable description from a DOM selector
 * Only uses basic element types - no random class names
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
