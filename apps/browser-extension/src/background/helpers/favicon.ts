/// <reference types="chrome" />

import { trpc } from '../../lib/trpc';
import { convertToWebP } from '../../lib/helpers';

export type BrandLogoContext = {
    guideId: string;
    userId: string;
};

export async function fetchAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch favicon: ${response.status}`);
    }
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read blob'));
        reader.readAsDataURL(blob);
    });
}

export async function getFaviconUrlForActiveTab(): Promise<string | null> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || tab.url.startsWith('chrome://')) return null;

    if (tab.favIconUrl && (tab.favIconUrl.startsWith('http://') || tab.favIconUrl.startsWith('https://'))) {
        return tab.favIconUrl;
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_FAVICON_URL' });
        const url = response?.url as string | undefined;
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url;
    } catch {
        // content script might not be ready / not injected on some pages
    }

    try {
        return new URL('/favicon.ico', tab.url).toString();
    } catch {
        return null;
    }
}

export async function captureAndPersistBrandLogo(ctx: BrandLogoContext): Promise<void> {
    try {
        const faviconUrl = await getFaviconUrlForActiveTab();
        if (!faviconUrl) return;

        const dataUrl = await fetchAsDataUrl(faviconUrl);
        const webpDataUrl = await convertToWebP(dataUrl, 0.9);

        const key = `brands/${ctx.guideId}/logo.webp`;

        await trpc.images.upload.mutate({
            key,
            dataUrl: webpDataUrl,
        });

        await trpc.guides.update.mutate({
            id: ctx.guideId,
            data: { brandImageKey: key },
        });
    } catch (error) {
        console.warn('Brand logo capture failed:', error);
    }
}
