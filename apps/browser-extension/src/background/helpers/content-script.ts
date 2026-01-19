/// <reference types="chrome" />

export async function injectContentScript(tabId: number): Promise<void> {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['assets/content.js']
        });
        console.log(`Injected content script into tab ${tabId}`);
    } catch (err) {
        console.log('Content script injection note:', err);
    }
}
