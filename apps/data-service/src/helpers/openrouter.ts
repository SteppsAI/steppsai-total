import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getOpenRouterModel(env: Env) {
	const apiKey = env.OPENROUTER_API_KEY?.trim();
	const modelName = env.OPENROUTER_MODEL?.trim();

	if (!apiKey) {
		throw new Error("OPENROUTER_API_KEY is not configured");
	}

	if (!modelName) {
		throw new Error("OPENROUTER_MODEL is not configured");
	}

	const openrouter = createOpenRouter({
		apiKey,
		headers: {
			...(env.OPENROUTER_SITE_URL
				? { "HTTP-Referer": env.OPENROUTER_SITE_URL }
				: {}),
			...(env.OPENROUTER_APP_NAME ? { "X-Title": env.OPENROUTER_APP_NAME } : {}),
		},
	});

	return openrouter.chat(modelName);
}
