/**
 * Helper functions for transforming data with asset URLs
 */

// Transform relative imageKey to full URL
export function prependAssetsUrl(key: string | null | undefined, assetsUrl: string): string | null {
    if (!key) return null;
    // Already a full URL? Return as-is
    if (key.startsWith('http://') || key.startsWith('https://')) return key;
    return `${assetsUrl}/${key}`;
}

// Transform steps array - prepend ASSETS_URL to imageKey
export function transformStepsWithUrls(steps: any[] | undefined, assetsUrl: string) {
    if (!steps || !Array.isArray(steps)) return steps;
    return steps.map((step) => ({
        ...step,
        imageKey: prependAssetsUrl(step.imageKey, assetsUrl),
    }));
}

// Transform a guide object - prepend ASSETS_URL to any asset keys
export function transformGuideWithUrls<T extends Record<string, any>>(guide: T, assetsUrl: string): T {
    return {
        ...guide,
        brandImageKey: prependAssetsUrl((guide as any).brandImageKey, assetsUrl),
        steps: transformStepsWithUrls((guide as any).steps, assetsUrl),
    };
}

