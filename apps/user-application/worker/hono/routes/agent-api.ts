import { Hono } from "hono";
import {
	authMiddleware,
	accessMiddleware,
} from "../helpers/auth-instance";
import {
	createAgentApiKeyInputSchema,
	createAgentRunInputSchema,
	browserSessionPairingRequestSchema,
	type AgentRun,
} from "@repo/data-ops/zod-schema";
import {
	getGuide,
	getGuideDocumentationPage,
} from "@repo/data-ops/queries";
import { transformGuideWithUrls } from "../../trpc/helpers/transform-assets";
import { buildDocsReactExportSource } from "../../../src/lib/docs-react-export";

type AgentRouteEnv = {
	Bindings: ServiceBindings & {
		AUTH_RATE_LIMITER: RateLimit;
		TRPC_RATE_LIMITER: RateLimit;
	};
	Variables: { userId: string };
};

export const agentApiRoutes = new Hono<AgentRouteEnv>();

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
	return new Response(
		JSON.stringify({
			error: message,
			...extra,
		}),
		{
			status,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
		}
	);
}

async function parseBody<T>(request: Request, schema: { parse: (input: unknown) => T }): Promise<T> {
	const body = await request.json().catch(() => ({}));
	return schema.parse(body);
}

async function authenticateBearer(c: any) {
	const header = c.req.header("Authorization") || "";
	if (!header.startsWith("Bearer ")) {
		return null;
	}
	const rawKey = header.slice("Bearer ".length).trim();
	if (!rawKey) {
		return null;
	}

	const backend = c.env.BACKEND_SERVICE as any;
	const result = await backend.authenticateAgentApiKey(rawKey);
	if (!result?.success) {
		return null;
	}

	return result as {
		success: true;
		apiKeyId: string;
		ownerUserId: string;
		label?: string | null;
	};
}

async function buildArtifacts(
	c: any,
	run: AgentRun | null,
	options?: { includeReactExport?: boolean }
) {
	if (!run?.guideId) {
		return {
			guideId: null,
			sharedGuideUrl: null,
			docsPageId: null,
			publishedDocsUrl: null,
			reactExportSource: null,
		};
	}

	const origin = new URL(c.req.url).origin;
	const sharedGuideUrl = run.output.shareGuide === false ? null : `${origin}/shared/${run.guideId}`;
	const page = await getGuideDocumentationPage(run.guideId);
	const docsPageId = page?.guideId || null;
	const publishedDocsUrl =
		page?.status === "published" ? `${origin}/shared/docs/${run.guideId}` : null;

	let reactExportSource: string | null = null;
	if (options?.includeReactExport && run.output.reactExport && page?.draftContent) {
		const guide = await getGuide(run.guideId);
		if (guide) {
			const transformedGuide = transformGuideWithUrls(guide as any, c.env.ASSETS_URL);
			reactExportSource = buildDocsReactExportSource({
				guide: transformedGuide as any,
				content: page.draftContent,
				theme: "light",
			});
		}
	}

	return {
		guideId: run.guideId,
		sharedGuideUrl,
		docsPageId,
		publishedDocsUrl,
		reactExportSource,
	};
}

async function serializeRun(
	c: any,
	run: AgentRun | null,
	options?: { includeReactExport?: boolean }
) {
	if (!run) return null;
	const artifacts = await buildArtifacts(c, run, options);
	return {
		agentRunId: run.agentRunId,
		status: run.status,
		guideId: run.guideId || null,
		sharedGuideUrl: artifacts.sharedGuideUrl,
		browserSessionId: run.browserSessionId,
		failureCode: run.failureCode || null,
		failureMessage: run.failureMessage || null,
		stepCount: run.stepCount,
		title: run.title || null,
		prompt: run.prompt,
		output: run.output,
		runtime: run.runtimeOptions,
		plannerOutput: run.plannerOutput || null,
		artifacts,
		createdAt: run.createdAt,
		updatedAt: run.updatedAt,
		completedAt: run.completedAt,
	};
}

agentApiRoutes.post("/api/agent/v1/api-keys", authMiddleware, accessMiddleware, async (c) => {
	try {
		const input = await parseBody(c.req.raw, createAgentApiKeyInputSchema);
		const backend = c.env.BACKEND_SERVICE as any;
		const result = await backend.createAgentApiKey(c.get("userId"), input.label);
		return c.json(result);
	} catch (error) {
		return jsonError("failed_to_create_api_key", 400, {
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

agentApiRoutes.get("/api/agent/v1/api-keys", authMiddleware, accessMiddleware, async (c) => {
	const backend = c.env.BACKEND_SERVICE as any;
	const result = await backend.listAgentApiKeys(c.get("userId"));
	return c.json({ apiKeys: result });
});

agentApiRoutes.delete("/api/agent/v1/api-keys/:apiKeyId", authMiddleware, accessMiddleware, async (c) => {
	const backend = c.env.BACKEND_SERVICE as any;
	const result = await backend.revokeAgentApiKey(c.get("userId"), c.req.param("apiKeyId"));
	if (!result) {
		return jsonError("api_key_not_found", 404);
	}
	return c.json({ success: true, apiKey: result });
});

agentApiRoutes.post("/api/agent/v1/browser-sessions/pairing-tokens", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	try {
		const input = await parseBody(c.req.raw, browserSessionPairingRequestSchema);
		const backend = c.env.BACKEND_SERVICE as any;
		const result = await backend.createBrowserSessionPairingToken(caller.ownerUserId, input.displayName);
		return c.json({
			browserSessionId: result.browserSession.browserSessionId,
			status: result.browserSession.status,
			displayName: result.browserSession.displayName,
			expiresAt: result.browserSession.pairingCodeExpiresAt,
			pairingToken: result.pairingToken,
		});
	} catch (error) {
		return jsonError("failed_to_create_pairing_token", 400, {
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

agentApiRoutes.get("/api/agent/v1/browser-sessions", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	const backend = c.env.BACKEND_SERVICE as any;
	const result = await backend.listBrowserSessions(caller.ownerUserId);
	return c.json({ browserSessions: result });
});

agentApiRoutes.post("/api/agent/v1/runs", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	try {
		const input = await parseBody(c.req.raw, createAgentRunInputSchema);
		const backend = c.env.BACKEND_SERVICE as any;
		const run = await backend.createAgentRun(caller.ownerUserId, {
			prompt: input.prompt,
			browserSessionId: input.browserSessionId,
			output: input.output,
			runtime: input.runtime,
		});

		return c.json(await serializeRun(c, run));
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return jsonError("failed_to_create_run", message.includes("active run") ? 409 : 400, {
			details: message,
		});
	}
});

agentApiRoutes.get("/api/agent/v1/runs/:runId", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	const backend = c.env.BACKEND_SERVICE as any;
	const run = await backend.getAgentRun(caller.ownerUserId, c.req.param("runId"));
	if (!run) {
		return jsonError("run_not_found", 404);
	}

	return c.json(await serializeRun(c, run));
});

agentApiRoutes.post("/api/agent/v1/runs/:runId/resume", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	const backend = c.env.BACKEND_SERVICE as any;
	const run = await backend.resumeAgentRun(caller.ownerUserId, c.req.param("runId"));
	if (!run) {
		return jsonError("run_not_found", 404);
	}

	return c.json(await serializeRun(c, run));
});

agentApiRoutes.post("/api/agent/v1/runs/:runId/cancel", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	const backend = c.env.BACKEND_SERVICE as any;
	const run = await backend.cancelAgentRun(caller.ownerUserId, c.req.param("runId"));
	if (!run) {
		return jsonError("run_not_found", 404);
	}

	return c.json(await serializeRun(c, run));
});

agentApiRoutes.get("/api/agent/v1/runs/:runId/artifacts", async (c) => {
	const caller = await authenticateBearer(c);
	if (!caller) {
		return jsonError("invalid_api_key", 401);
	}

	const backend = c.env.BACKEND_SERVICE as any;
	const run = await backend.getAgentRun(caller.ownerUserId, c.req.param("runId"));
	if (!run) {
		return jsonError("run_not_found", 404);
	}

	return c.json(await buildArtifacts(c, run, { includeReactExport: true }));
});
