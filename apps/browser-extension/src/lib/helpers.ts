/**
 * Generates a human-readable description from a DOM selector
 */
export function generateStepDescription(domSelector: string): string {
    if (!domSelector) return "Click here";

    const parts = domSelector.split(" > ");
    const lastPart = parts[parts.length - 1] || domSelector;

    const tagMatch = lastPart.match(/^([a-z0-9-]+)/i);
    const idMatch = lastPart.match(/#([a-zA-Z0-9_-]+)/);
    const classMatch = lastPart.match(/\.([a-zA-Z0-9_-]+)/);

    const tag = tagMatch?.[1]?.toLowerCase() || "element";
    const id = idMatch?.[1];
    const className = classMatch?.[1];

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

    const elementType = elementDescriptions[tag] || tag;

    if (id) {
        const readableId = id.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
        return `Click on ${readableId} ${elementType}`;
    }

    if (className) {
        const readableClass = className.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
        return `Click on ${readableClass} ${elementType}`;
    }

    return `Click on ${elementType}`;
}

