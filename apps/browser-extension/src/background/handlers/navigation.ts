/// <reference types="chrome" />

import { injectContentScript } from '../helpers/content-script';

export async function handleNavigation(details: chrome.webNavigation.WebNavigationCallbackDetails) {
    const { isRecording, isPaused, steps } = await chrome.storage.local.get(['isRecording', 'isPaused', 'steps']);

    // @ts-ignore - url exists on WebNavigationCallbackDetails but TS might be outdated
    const url = details.url;

    if (!isRecording || isPaused || !url || url.startsWith('chrome://')) return;

    if (details.tabId) {
        await injectContentScript(details.tabId);
    }

    const lastStep = steps && steps.length > 0 ? steps[steps.length - 1] : null;
    if (lastStep && lastStep.type === 'navigate' && lastStep.pageUrl === url) {
        return;
    }

    const newStep = {
        id: crypto.randomUUID(),
        type: 'navigate',
        orderIndex: (steps || []).length,
        pageUrl: url,
    };

    await chrome.storage.local.set({ steps: [...(steps || []), newStep] });
    console.log('Recorded Navigation:', newStep);
}
