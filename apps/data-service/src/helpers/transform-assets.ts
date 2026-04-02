export function prependAssetsUrl(key: string | null | undefined, assetsUrl: string): string | null {
	if (!key) return null;
	if (key.startsWith('http://') || key.startsWith('https://')) return key;
	return `${assetsUrl}/${key}`;
}

export function transformStepsWithUrls<T extends { imageKey?: string | null }>(
	steps: T[] | undefined,
	assetsUrl: string
) {
	if (!steps || !Array.isArray(steps)) return steps;
	return steps.map((step) => ({
		...step,
		imageKey: prependAssetsUrl(step.imageKey, assetsUrl),
	}));
}

export function transformGuideWithUrls<T extends Record<string, any>>(guide: T, assetsUrl: string): T {
	return {
		...guide,
		brandImageKey: prependAssetsUrl((guide as any).brandImageKey, assetsUrl),
		steps: transformStepsWithUrls((guide as any).steps, assetsUrl),
	};
}
