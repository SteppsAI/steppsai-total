

/**
 * Shortens a selector for display purposes
 * @param domSelector - Full CSS selector
 * @param maxLength - Maximum length before truncation
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
