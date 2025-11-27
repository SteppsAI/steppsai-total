
// Content script to capture user interactions

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

document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const selector = getCssSelector(target);

    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
        return; // Extension was reloaded, ignore
    }

    chrome.runtime.sendMessage({
        type: 'STEP_ACTION',
        payload: {
            selector,
            actionType: 'click',
            timestamp: Date.now(),
            url: window.location.href
        }
    }).catch(() => {
        // Extension context invalidated - silently ignore
    });
}, true);
