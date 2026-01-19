/// <reference types="chrome" />

let creatingOffscreen: Promise<void> | null = null;

export async function ensureOffscreenDocument(): Promise<void> {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');

    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        return;
    }

    if (creatingOffscreen) {
        await creatingOffscreen;
        return;
    }

    creatingOffscreen = chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: [chrome.offscreen.Reason.DISPLAY_MEDIA],
        justification: 'Capture screen/window for step screenshots'
    });

    await creatingOffscreen;
    creatingOffscreen = null;
}

export async function closeOffscreenDocument(): Promise<void> {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');

    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
        await chrome.offscreen.closeDocument();
    }
}

export async function offscreenDocumentExists(): Promise<boolean> {
    const offscreenUrl = chrome.runtime.getURL('offscreen.html');
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl]
    });
    return existingContexts.length > 0;
}
