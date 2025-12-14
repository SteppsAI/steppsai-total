// Content script to capture user interactions
// Uses mousedown instead of click to capture screenshot BEFORE the action happens

function getBestFaviconUrl(): string | null {
    const candidates: string[] = [];

    // Prefer larger icons first
    const selectors = [
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'link[rel~="icon"][sizes]',
        'link[rel~="icon"]',
        'link[rel="shortcut icon"]',
    ];

    for (const selector of selectors) {
        const links = Array.from(document.querySelectorAll<HTMLLinkElement>(selector));
        for (const link of links) {
            if (link.href) candidates.push(link.href);
        }
    }

    // Fallback to /favicon.ico
    try {
        candidates.push(new URL('/favicon.ico', window.location.origin).toString());
    } catch {
        // ignore
    }

    // Pick the first valid http(s) URL
    for (const url of candidates) {
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            return url;
        }
    }

    return null;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'GET_FAVICON_URL') {
        sendResponse({ url: getBestFaviconUrl() });
        return true;
    }
});

function getCssSelector(el: Element): string {
    if (!(el instanceof Element)) return '';

    const path: string[] = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
        } else {
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling as Element) {
                if (sib.nodeName.toLowerCase() == selector)
                    nth++;
            }
            if (nth != 1)
                selector += ":nth-of-type(" + nth + ")";
        }
        path.unshift(selector);
        el = el.parentNode as Element;
    }
    return path.join(" > ");
}

// Use mousedown to capture BEFORE the click action happens
document.addEventListener('mousedown', (event) => {
    // Only capture left mouse button
    if (event.button !== 0) return;

    const target = event.target as Element;
    const selector = getCssSelector(target);

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
        return;
    }

    const x = (event as MouseEvent).clientX;
    const y = (event as MouseEvent).clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    chrome.runtime.sendMessage({
        type: 'STEP_ACTION',
        payload: {
            selector,
            url: window.location.href,
            x: (x / windowWidth) * 100,
            y: (y / windowHeight) * 100
        }
    }).catch(() => {
        // Extension context invalidated - silently ignore
    });
}, true);
