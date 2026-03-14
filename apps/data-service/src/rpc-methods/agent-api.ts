import {
	authenticateAgentApiKey as authenticateAgentApiKeyQuery,
	authenticateBrowserSession,
	claimBrowserSession as claimBrowserSessionQuery,
	createAgentApiKey as createAgentApiKeyQuery,
	createAgentRunRecord,
	createBrowserSessionPairing,
	getGuide,
	getAgentRunForOwner,
	getBrowserSessionForOwner,
	heartbeatBrowserSession as heartbeatBrowserSessionQuery,
	listAgentApiKeysForOwner,
	listBrowserSessionsForOwner,
	revokeAgentApiKey,
	setBrowserSessionCurrentRun,
	updateAgentRun,
	createGuide,
	updateGuide,
	updateGuideSteps,
	startGuideDocumentationGeneration,
} from "@repo/data-ops/queries";
import { initDatabase } from "@repo/data-ops/database";
import type {
	AgentRunOutput,
	AgentRunRuntimeOptions,
	GuideDocsGenerationInput,
	StepFromExtension,
	Step,
} from "@repo/data-ops/zod-schema";
import { generateAgentRunPlan } from "../helpers/generateAgentRunPlan";
import { nanoid } from "nanoid";

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

function promptToFallbackTitle(prompt: string) {
	const cleaned = prompt.replace(/^record me how to\s+/i, "").trim();
	return cleaned.slice(0, 100) || "Recorded workflow";
}

function buildGuideSlug(title: string) {
	const base = slugify(title) || "recorded-workflow";
	return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function buildDefaultArtifacts(guideId?: string | null) {
	return guideId ? { guideId } : {};
}

function toGuideSteps(rawSteps: StepFromExtension[]): Step[] {
	return rawSteps.map((step) => {
		let caption: string;
		if (step.type === "navigate") {
			caption = `Navigate to ${new URL(step.pageUrl).hostname}`;
		} else if (step.type === "manual") {
			caption = "Screenshot";
		} else {
			const selector = step.domSelector || "";
			const cleaned = selector
				.replace(/[#.]/g, " ")
				.replace(/\s+/g, " ")
				.trim();
			caption = cleaned ? `Click ${cleaned}` : "Click highlighted element";
		}

		const overlays =
			step.type === "click" && step.x !== undefined && step.y !== undefined
				? [
						{
							id: `overlay-${nanoid(8)}`,
							type: "circle" as const,
							x: step.x,
							y: step.y,
							radius: 2.5,
							color: "#ef4444",
							strokeWidth: 3,
						},
					]
				: undefined;

		return {
			id: step.id,
			type: step.type,
			orderIndex: step.orderIndex,
			imageKey: step.imageKey,
			pageUrl: step.pageUrl,
			domSelector: step.domSelector,
			x: step.x,
			y: step.y,
			caption,
			aiCaption: undefined,
			isExcluded: false,
			overlays,
		};
	});
}

function deriveGuideDocsInput(prompt: string, guideTitle: string): GuideDocsGenerationInput {
	return {
		productName: guideTitle,
		featureName: undefined,
		audience: "users",
		jobToBeDone: prompt,
		prerequisites: [],
		tone: "friendly",
		includeRequirements: true,
		includeTroubleshooting: true,
		includeFaq: false,
	};
}

export async function createAgentApiKey(env: Env, ownerUserId: string, label?: string) {
	initDatabase(env.DATABASE_URL);
	return createAgentApiKeyQuery(ownerUserId, label);
}

export async function listAgentApiKeys(env: Env, ownerUserId: string) {
	initDatabase(env.DATABASE_URL);
	return listAgentApiKeysForOwner(ownerUserId);
}

export async function revokeAgentApiKeyForOwner(env: Env, ownerUserId: string, apiKeyId: string) {
	initDatabase(env.DATABASE_URL);
	return revokeAgentApiKey(ownerUserId, apiKeyId);
}

export async function authenticateAgentApiKey(env: Env, rawKey: string) {
	initDatabase(env.DATABASE_URL);
	const apiKey = await authenticateAgentApiKeyQuery(rawKey);
	if (!apiKey) {
		return { success: false };
	}
	return {
		success: true,
		apiKeyId: apiKey.apiKeyId,
		ownerUserId: apiKey.ownerUserId,
		label: apiKey.label,
	};
}

export async function createBrowserSessionPairingToken(
	env: Env,
	ownerUserId: string,
	displayName?: string
) {
	initDatabase(env.DATABASE_URL);
	return createBrowserSessionPairing(ownerUserId, { displayName });
}

export async function listBrowserSessions(env: Env, ownerUserId: string) {
	initDatabase(env.DATABASE_URL);
	return listBrowserSessionsForOwner(ownerUserId);
}

export async function claimBrowserSession(
	env: Env,
	pairingToken: string,
	input?: {
		displayName?: string;
		extensionUserId?: string;
		capabilities?: Record<string, unknown>;
	}
) {
	initDatabase(env.DATABASE_URL);
	return claimBrowserSessionQuery(pairingToken, input);
}

export async function claimBrowserSessionForOwner(
	env: Env,
	ownerUserId: string,
	pairingToken: string,
	input?: {
		displayName?: string;
		capabilities?: Record<string, unknown>;
	}
) {
	initDatabase(env.DATABASE_URL);
	return claimBrowserSessionQuery(
		pairingToken,
		{
			displayName: input?.displayName,
			extensionUserId: ownerUserId,
			capabilities: input?.capabilities,
		},
		ownerUserId
	);
}

export async function heartbeatBrowserSession(
	env: Env,
	browserSessionId: string,
	sessionSecret: string,
	capabilities?: Record<string, unknown>
) {
	initDatabase(env.DATABASE_URL);
	const session = await authenticateBrowserSession(browserSessionId, sessionSecret);
	if (!session) {
		return { success: false };
	}

	const updated = await heartbeatBrowserSessionQuery(browserSessionId, capabilities);
	return {
		success: true,
		browserSession: updated,
	};
}

export async function heartbeatBrowserSessionForOwner(
	env: Env,
	ownerUserId: string,
	browserSessionId: string,
	capabilities?: Record<string, unknown>
) {
	initDatabase(env.DATABASE_URL);
	const session = await getBrowserSessionForOwner(ownerUserId, browserSessionId);
	if (!session) {
		return { success: false, error: "browser_session_not_found" };
	}

	const updatedSession = await heartbeatBrowserSessionQuery(browserSessionId, capabilities);
	const currentRun =
		updatedSession?.currentRunId
			? await getAgentRunForOwner(ownerUserId, updatedSession.currentRunId)
			: null;

	return {
		success: true,
		browserSession: updatedSession,
		currentRun,
	};
}

export async function createAgentRun(
	env: Env,
	ownerUserId: string,
	input: {
		prompt: string;
		browserSessionId: string;
		output: AgentRunOutput;
		runtime: AgentRunRuntimeOptions;
	}
) {
	initDatabase(env.DATABASE_URL);
	const browserSession = await getBrowserSessionForOwner(ownerUserId, input.browserSessionId);
	if (!browserSession) {
		throw new Error("Browser session not found");
	}

	if (browserSession.currentRunId) {
		throw new Error("Browser session already has an active run");
	}

	const fallbackTitle = promptToFallbackTitle(input.prompt);
	const guideId = await createGuide({
		userId: ownerUserId,
		title: fallbackTitle,
		description: `Agent planned workflow for: ${fallbackTitle}`,
		slug: buildGuideSlug(fallbackTitle),
		status: "recording",
		visibility: input.output.shareGuide ? "public" : "private",
	});

	const run = await createAgentRunRecord({
		ownerUserId,
		browserSessionId: input.browserSessionId,
		guideId,
		prompt: input.prompt,
		title: fallbackTitle,
		status: "planning",
		output: input.output,
		runtimeOptions: input.runtime,
		artifacts: buildDefaultArtifacts(guideId),
	});

	await setBrowserSessionCurrentRun(input.browserSessionId, run.agentRunId);

	try {
		const plannerOutput = await generateAgentRunPlan(env, input.prompt, input.runtime.maxSteps);
		await updateGuide(guideId, {
			title: plannerOutput.title,
			description: plannerOutput.summary,
		});

		const updated = await updateAgentRun(run.agentRunId, {
			title: plannerOutput.title,
			status: "waiting_for_browser",
			plannerOutput,
			artifacts: {
				...run.artifacts,
				guideId,
			},
		});

		return updated;
	} catch (error) {
		await updateAgentRun(run.agentRunId, {
			status: "failed",
			failureCode: "planner_failed",
			failureMessage: error instanceof Error ? error.message : "Unknown planner error",
			completedAt: new Date().toISOString(),
		});
		await setBrowserSessionCurrentRun(input.browserSessionId, null);
		return getAgentRunForOwner(ownerUserId, run.agentRunId);
	}
}

export async function getAgentRun(env: Env, ownerUserId: string, agentRunId: string) {
	initDatabase(env.DATABASE_URL);
	return getAgentRunForOwner(ownerUserId, agentRunId);
}

export async function resumeAgentRun(env: Env, ownerUserId: string, agentRunId: string) {
	initDatabase(env.DATABASE_URL);
	const existing = await getAgentRunForOwner(ownerUserId, agentRunId);
	if (!existing) {
		return null;
	}

	if (existing.status !== "paused_for_user") {
		return existing;
	}

	return updateAgentRun(agentRunId, {
		status: "waiting_for_browser",
		failureCode: null,
		failureMessage: null,
	});
}

export async function cancelAgentRun(env: Env, ownerUserId: string, agentRunId: string) {
	initDatabase(env.DATABASE_URL);
	const existing = await getAgentRunForOwner(ownerUserId, agentRunId);
	if (!existing) {
		return null;
	}

	await setBrowserSessionCurrentRun(existing.browserSessionId, null);
	return updateAgentRun(agentRunId, {
		status: "cancelled",
		completedAt: new Date().toISOString(),
	});
}

export async function updateAgentRunStateFromBrowser(
	env: Env,
	browserSessionId: string,
	sessionSecret: string,
	agentRunId: string,
	data: {
		status: "running" | "paused_for_user" | "failed";
		failureCode?: "auth_required" | "captcha_required" | "selector_not_found" | "browser_disconnected" | "run_timeout" | "upload_failed" | "planner_failed" | null;
		failureMessage?: string | null;
		stepCount?: number;
	}
) {
	initDatabase(env.DATABASE_URL);
	const session = await authenticateBrowserSession(browserSessionId, sessionSecret);
	if (!session) {
		return { success: false, error: "invalid_browser_session" };
	}

	const run = await getAgentRunForOwner(session.ownerUserId, agentRunId);
	if (!run || run.browserSessionId !== browserSessionId) {
		return { success: false, error: "run_not_found" };
	}

	const updated = await updateAgentRun(agentRunId, {
		status: data.status,
		failureCode: data.failureCode ?? null,
		failureMessage: data.failureMessage ?? null,
		stepCount: data.stepCount ?? run.stepCount,
		completedAt: data.status === "failed" ? new Date().toISOString() : undefined,
	});

	if (data.status === "failed") {
		await setBrowserSessionCurrentRun(browserSessionId, null);
	}

	return { success: true, run: updated };
}

export async function updateAgentRunStateForOwner(
	env: Env,
	ownerUserId: string,
	browserSessionId: string,
	agentRunId: string,
	data: {
		status: "running" | "paused_for_user" | "failed";
		failureCode?: "auth_required" | "captcha_required" | "selector_not_found" | "browser_disconnected" | "run_timeout" | "upload_failed" | "planner_failed" | null;
		failureMessage?: string | null;
		stepCount?: number;
	}
) {
	initDatabase(env.DATABASE_URL);
	const session = await getBrowserSessionForOwner(ownerUserId, browserSessionId);
	if (!session) {
		return { success: false, error: "browser_session_not_found" };
	}

	const run = await getAgentRunForOwner(ownerUserId, agentRunId);
	if (!run || run.browserSessionId !== browserSessionId) {
		return { success: false, error: "run_not_found" };
	}

	const updated = await updateAgentRun(agentRunId, {
		status: data.status,
		failureCode: data.failureCode ?? null,
		failureMessage: data.failureMessage ?? null,
		stepCount: data.stepCount ?? run.stepCount,
		completedAt: data.status === "failed" ? new Date().toISOString() : undefined,
	});

	if (data.status === "failed") {
		await setBrowserSessionCurrentRun(browserSessionId, null);
	}

	return { success: true, run: updated };
}

export async function completeAgentRunFromBrowser(
	env: Env,
	browserSessionId: string,
	sessionSecret: string,
	agentRunId: string,
	data: {
		title?: string;
		rawSteps: StepFromExtension[];
		brandImageKey?: string | null;
	}
) {
	initDatabase(env.DATABASE_URL);
	const session = await authenticateBrowserSession(browserSessionId, sessionSecret);
	if (!session) {
		return { success: false, error: "invalid_browser_session" };
	}

	const run = await getAgentRunForOwner(session.ownerUserId, agentRunId);
	if (!run || run.browserSessionId !== browserSessionId || !run.guideId) {
		return { success: false, error: "run_not_found" };
	}

	const finalSteps = toGuideSteps(data.rawSteps);
	await updateGuideSteps(run.guideId, finalSteps);
	await updateGuide(run.guideId, {
		title: data.title || run.title || promptToFallbackTitle(run.prompt),
		status: run.output.shareGuide ? "published" : "draft",
		visibility: run.output.shareGuide ? "public" : "private",
		...(data.brandImageKey ? { brandImageKey: data.brandImageKey } : {}),
	});

	if (run.output.generateDocs) {
		const guide = await getGuide(run.guideId);
		if (guide) {
			const docsInput = deriveGuideDocsInput(run.prompt, guide.title || data.title || run.title || "Documentation");
			await startGuideDocumentationGeneration(run.guideId, docsInput);
			await env.GUIDE_DOCS_WORKFLOW.create({
				params: {
					guideId: run.guideId,
					input: docsInput,
					section: "all",
				},
			});
		}
	}

	const updated = await updateAgentRun(agentRunId, {
		status: "completed",
		title: data.title || run.title,
		stepCount: finalSteps.length,
		artifacts: {
			...(run.artifacts || {}),
			guideId: run.guideId,
			docsPageId: run.output.generateDocs ? run.guideId : null,
		},
		completedAt: new Date().toISOString(),
	});

	await setBrowserSessionCurrentRun(browserSessionId, null);

	return {
		success: true,
		run: updated,
	};
}

export async function completeAgentRunForOwner(
	env: Env,
	ownerUserId: string,
	browserSessionId: string,
	agentRunId: string,
	data: {
		title?: string;
		rawSteps: StepFromExtension[];
		brandImageKey?: string | null;
	}
) {
	initDatabase(env.DATABASE_URL);
	const session = await getBrowserSessionForOwner(ownerUserId, browserSessionId);
	if (!session) {
		return { success: false, error: "browser_session_not_found" };
	}

	const run = await getAgentRunForOwner(ownerUserId, agentRunId);
	if (!run || run.browserSessionId !== browserSessionId || !run.guideId) {
		return { success: false, error: "run_not_found" };
	}

	const finalSteps = toGuideSteps(data.rawSteps);
	await updateGuideSteps(run.guideId, finalSteps);
	await updateGuide(run.guideId, {
		title: data.title || run.title || promptToFallbackTitle(run.prompt),
		status: run.output.shareGuide ? "published" : "draft",
		visibility: run.output.shareGuide ? "public" : "private",
		...(data.brandImageKey ? { brandImageKey: data.brandImageKey } : {}),
	});

	if (run.output.generateDocs) {
		const guide = await getGuide(run.guideId);
		if (guide) {
			const docsInput = deriveGuideDocsInput(run.prompt, guide.title || data.title || run.title || "Documentation");
			await startGuideDocumentationGeneration(run.guideId, docsInput);
			await env.GUIDE_DOCS_WORKFLOW.create({
				params: {
					guideId: run.guideId,
					input: docsInput,
					section: "all",
				},
			});
		}
	}

	const updated = await updateAgentRun(agentRunId, {
		status: "completed",
		title: data.title || run.title,
		stepCount: finalSteps.length,
		artifacts: {
			...(run.artifacts || {}),
			guideId: run.guideId,
			docsPageId: run.output.generateDocs ? run.guideId : null,
		},
		completedAt: new Date().toISOString(),
	});

	await setBrowserSessionCurrentRun(browserSessionId, null);

	return {
		success: true,
		run: updated,
	};
}
