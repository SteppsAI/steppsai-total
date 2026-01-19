// Content script to capture user interactions
// Uses mousedown instead of click to capture screenshot BEFORE the action happens

// Idempotency check: prevent re-execution if already injected
if ((window as any).__STEPPS_CONTENT_SCRIPT_LOADED__) {
    throw new Error('Stepps Content Script already loaded'); // Stop execution
}
(window as any).__STEPPS_CONTENT_SCRIPT_LOADED__ = true;

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

    const mouseEvent = event as MouseEvent;

    // Window-relative coordinates: click position relative to browser window origin
    // This correctly handles toolbars, sidebars, devtools regardless of position
    const clickInWindowX = mouseEvent.screenX - window.screenX;
    const clickInWindowY = mouseEvent.screenY - window.screenY;

    // Send ALL coordinate systems - background will pick the right one
    chrome.runtime.sendMessage({
        type: 'STEP_ACTION',
        payload: {
            selector,
            url: window.location.href,
            // Viewport-relative (for tab capture)
            viewportX: (mouseEvent.clientX / window.innerWidth) * 100,
            viewportY: (mouseEvent.clientY / window.innerHeight) * 100,
            // Window-relative (for window capture) - uses screen position minus window origin
            windowX: (clickInWindowX / window.outerWidth) * 100,
            windowY: (clickInWindowY / window.outerHeight) * 100,
            // Screen-relative (for full screen capture)
            screenX: (mouseEvent.screenX / window.screen.width) * 100,
            screenY: (mouseEvent.screenY / window.screen.height) * 100,
        }
    }).catch(() => {
        // Extension context invalidated - silently ignore
    });
}, true);
