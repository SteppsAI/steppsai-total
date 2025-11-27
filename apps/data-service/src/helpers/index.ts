/**
 * Helpers for step descriptions and UI text generation
 * Note: R2 upload helper is in base64toR2.ts
 */

/**
 * Generates a human-readable description from a DOM selector
 * @param domSelector - CSS selector string
 * @returns Human-readable action text
 */
export function generateStepDescription(domSelector: string): string {
    if (!domSelector) return "Click here";

    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1] || domSelector;

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
        label: "label",
        p: "paragraph",
        h1: "heading",
        h2: "heading",
        h3: "heading",
        svg: "icon",
    };

    return `Click on ${elementDescriptions[tag] || tag}`;
}

/**
 * Shortens a selector for display purposes
 */
export function shortenSelector(domSelector: string, maxLength: number = 30): string {
    if (!domSelector) return "";
    if (domSelector.length <= maxLength) return domSelector;

    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1];

    if (lastPart && lastPart.length <= maxLength) {
        return `...${lastPart}`;
    }

    return domSelector.substring(0, maxLength - 3) + "...";
}
