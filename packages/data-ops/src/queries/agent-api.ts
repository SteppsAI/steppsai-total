import { getDb } from "@/db/database";
import {
	agentApiKeys,
	agentRuns,
	browserSessions,
} from "@/drizzle-out/schema";
import {
	agentApiKeySchema,
	agentPlanSchema,
	agentRunArtifactsSchema,
	agentRunOutputSchema,
	agentRunRuntimeOptionsSchema,
	agentRunSchema,
	browserSessionCapabilitiesSchema,
	browserSessionSchema,
	type AgentApiKey,
	type AgentPlan,
	type AgentRun,
	type AgentRunArtifacts,
	type AgentRunOutput,
	type AgentRunRuntimeOptions,
	type BrowserSession,
} from "@/zod/agent-api";
import { and, eq, isNull, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { SafeParseReturnType } from "zod";

type AgentApiKeyRow = typeof agentApiKeys.$inferSelect;
type BrowserSessionRow = typeof browserSessions.$inferSelect;
type AgentRunRow = typeof agentRuns.$inferSelect;

async function sha256Hex(value: string): Promise<string> {
	const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
	return Array.from(new Uint8Array(buffer))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function parseJsonValue<T>(
	value: unknown,
	parse: (input: unknown) => SafeParseReturnType<unknown, T>,
	fallback: T
): T {
	const parsed = parse(value);
	return parsed.success ? parsed.data : fallback;
}

function mapAgentApiKey(row: AgentApiKeyRow): AgentApiKey {
	return agentApiKeySchema.parse({
		apiKeyId: row.apiKeyId,
		ownerUserId: row.ownerUserId,
		label: row.label,
		keyPrefix: row.keyPrefix,
		keyLast4: row.keyLast4,
		lastUsedAt: row.lastUsedAt,
		revokedAt: row.revokedAt,
		createdAt: row.createdAt,
	});
}

function mapBrowserSession(row: BrowserSessionRow): BrowserSession {
	return browserSessionSchema.parse({
		browserSessionId: row.browserSessionId,
		ownerUserId: row.ownerUserId,
		extensionUserId: row.extensionUserId,
		displayName: row.displayName,
		status: row.status,
		capabilities: parseJsonValue(
			row.capabilities,
			browserSessionCapabilitiesSchema.safeParse,
			{ actions: [], supportsLiveBroker: false, supportsManualRecording: true }
		),
		currentRunId: row.currentRunId,
		lastSeenAt: row.lastSeenAt,
		pairingCodeExpiresAt: row.pairingCodeExpiresAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	});
}

function mapAgentRun(row: AgentRunRow): AgentRun {
	const parsedPlanner = row.plannerOutput
		? agentPlanSchema.safeParse(row.plannerOutput)
		: null;

	return agentRunSchema.parse({
		agentRunId: row.agentRunId,
		ownerUserId: row.ownerUserId,
		browserSessionId: row.browserSessionId,
		guideId: row.guideId,
		prompt: row.prompt,
		title: row.title,
		status: row.status,
		failureCode: row.failureCode,
		failureMessage: row.failureMessage,
		output: parseJsonValue(row.output, agentRunOutputSchema.safeParse, {
			shareGuide: true,
			generateDocs: false,
			publishDocs: false,
			reactExport: false,
		}),
		runtimeOptions: parseJsonValue(row.runtimeOptions, agentRunRuntimeOptionsSchema.safeParse, {
			maxSteps: 40,
			maxDurationSec: 900,
			screenshotPolicy: "after_each_step",
			stopOnAuthWall: true,
		}),
		plannerOutput: parsedPlanner?.success ? parsedPlanner.data : null,
		artifacts: parseJsonValue(row.artifacts, agentRunArtifactsSchema.safeParse, {}),
		stepCount: row.stepCount ?? 0,
		startedAt: row.startedAt,
		completedAt: row.completedAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	});
}

export async function createAgentApiKey(
	ownerUserId: string,
	label?: string
): Promise<{ apiKey: AgentApiKey; key: string }> {
	const db = getDb();
	const key = `stpk_${nanoid(40)}`;
	const keyHash = await sha256Hex(key);
	const keyPrefix = key.slice(0, 12);
	const keyLast4 = key.slice(-4);

	const [row] = await db
		.insert(agentApiKeys)
		.values({
			ownerUserId,
			label: label || null,
			keyPrefix,
			keyHash,
			keyLast4,
		})
		.returning();

	return {
		apiKey: mapAgentApiKey(row),
		key,
	};
}

export async function listAgentApiKeysForOwner(ownerUserId: string): Promise<AgentApiKey[]> {
	const db = getDb();
	const rows = await db
		.select()
		.from(agentApiKeys)
		.where(eq(agentApiKeys.ownerUserId, ownerUserId));

	return rows.map(mapAgentApiKey);
}

export async function revokeAgentApiKey(
	ownerUserId: string,
	apiKeyId: string
): Promise<AgentApiKey | null> {
	const db = getDb();
	const [row] = await db
		.update(agentApiKeys)
		.set({
			revokedAt: sql`now()`,
		})
		.where(and(eq(agentApiKeys.apiKeyId, apiKeyId), eq(agentApiKeys.ownerUserId, ownerUserId)))
		.returning();

	return row ? mapAgentApiKey(row) : null;
}

export async function authenticateAgentApiKey(rawKey: string): Promise<AgentApiKey | null> {
	const db = getDb();
	const keyHash = await sha256Hex(rawKey.trim());
	const rows = await db
		.select()
		.from(agentApiKeys)
		.where(and(eq(agentApiKeys.keyHash, keyHash), isNull(agentApiKeys.revokedAt)))
		.limit(1);

	if (!rows.length) return null;

	await db
		.update(agentApiKeys)
		.set({
			lastUsedAt: sql`now()`,
		})
		.where(eq(agentApiKeys.apiKeyId, rows[0].apiKeyId));

	return mapAgentApiKey({
		...rows[0],
		lastUsedAt: new Date().toISOString(),
	});
}

export async function createBrowserSessionPairing(
	ownerUserId: string,
	input?: { displayName?: string; expiresInMinutes?: number }
): Promise<{ browserSession: BrowserSession; pairingToken: string }> {
	const db = getDb();
	const pairingToken = `stpair_${nanoid(32)}`;
	const pairingTokenHash = await sha256Hex(pairingToken);
	const expiresAt = new Date(Date.now() + (input?.expiresInMinutes ?? 15) * 60 * 1000).toISOString();

	const [row] = await db
		.insert(browserSessions)
		.values({
			ownerUserId,
			displayName: input?.displayName || null,
			status: "awaiting_pair",
			capabilities: {},
			pairingTokenHash,
			pairingCodeExpiresAt: expiresAt,
		})
		.returning();

	return {
		browserSession: mapBrowserSession(row),
		pairingToken,
	};
}

export async function listBrowserSessionsForOwner(ownerUserId: string): Promise<BrowserSession[]> {
	const db = getDb();
	const rows = await db
		.select()
		.from(browserSessions)
		.where(eq(browserSessions.ownerUserId, ownerUserId));

	return rows.map(mapBrowserSession);
}

export async function getBrowserSessionForOwner(
	ownerUserId: string,
	browserSessionId: string
): Promise<BrowserSession | null> {
	const db = getDb();
	const rows = await db
		.select()
		.from(browserSessions)
		.where(and(eq(browserSessions.browserSessionId, browserSessionId), eq(browserSessions.ownerUserId, ownerUserId)))
		.limit(1);

	return rows[0] ? mapBrowserSession(rows[0]) : null;
}

export async function claimBrowserSession(
	pairingToken: string,
	input?: {
		displayName?: string;
		extensionUserId?: string;
		capabilities?: Record<string, unknown>;
	},
	ownerUserId?: string
): Promise<{ browserSession: BrowserSession; sessionSecret: string } | null> {
	const db = getDb();
	const pairingTokenHash = await sha256Hex(pairingToken.trim());
	const rows = await db
		.select()
		.from(browserSessions)
		.where(
			ownerUserId
				? and(
						eq(browserSessions.pairingTokenHash, pairingTokenHash),
						eq(browserSessions.ownerUserId, ownerUserId)
					)
				: eq(browserSessions.pairingTokenHash, pairingTokenHash)
		)
		.limit(1);

	if (!rows.length) return null;

	const row = rows[0];
	if (row.pairingCodeExpiresAt && new Date(row.pairingCodeExpiresAt).getTime() < Date.now()) {
		return null;
	}

	const sessionSecret = `stbs_${nanoid(40)}`;
	const sessionSecretHash = await sha256Hex(sessionSecret);
	const [updated] = await db
		.update(browserSessions)
		.set({
			displayName: input?.displayName || row.displayName,
			status: "active",
			capabilities: input?.capabilities || row.capabilities || {},
			extensionUserId: input?.extensionUserId || row.extensionUserId,
			pairingTokenHash: null,
			pairingCodeExpiresAt: null,
			sessionSecretHash,
			lastSeenAt: sql`now()`,
			updatedAt: sql`now()`,
		})
		.where(eq(browserSessions.browserSessionId, row.browserSessionId))
		.returning();

	return {
		browserSession: mapBrowserSession(updated),
		sessionSecret,
	};
}

export async function authenticateBrowserSession(
	browserSessionId: string,
	sessionSecret: string
): Promise<BrowserSession | null> {
	const db = getDb();
	const rows = await db
		.select()
		.from(browserSessions)
		.where(eq(browserSessions.browserSessionId, browserSessionId))
		.limit(1);

	if (!rows.length || !rows[0].sessionSecretHash || rows[0].status === "revoked") {
		return null;
	}

	const providedHash = await sha256Hex(sessionSecret.trim());
	if (providedHash !== rows[0].sessionSecretHash) {
		return null;
	}

	return mapBrowserSession(rows[0]);
}

export async function heartbeatBrowserSession(
	browserSessionId: string,
	capabilities?: Record<string, unknown>
): Promise<BrowserSession | null> {
	const db = getDb();
	const updateData: Record<string, unknown> = {
		status: "active",
		lastSeenAt: sql`now()`,
		updatedAt: sql`now()`,
	};

	if (capabilities) {
		updateData.capabilities = capabilities;
	}

	const [row] = await db
		.update(browserSessions)
		.set(updateData)
		.where(eq(browserSessions.browserSessionId, browserSessionId))
		.returning();

	return row ? mapBrowserSession(row) : null;
}

export async function setBrowserSessionCurrentRun(
	browserSessionId: string,
	currentRunId: string | null
): Promise<void> {
	const db = getDb();
	await db
		.update(browserSessions)
		.set({
			currentRunId,
			updatedAt: sql`now()`,
		})
		.where(eq(browserSessions.browserSessionId, browserSessionId));
}

export async function createAgentRunRecord(input: {
	ownerUserId: string;
	browserSessionId: string;
	guideId?: string | null;
	prompt: string;
	title?: string | null;
	status: AgentRun["status"];
	output: AgentRunOutput;
	runtimeOptions: AgentRunRuntimeOptions;
	plannerOutput?: AgentPlan | null;
	artifacts?: AgentRunArtifacts;
	failureCode?: AgentRun["failureCode"];
	failureMessage?: string | null;
}): Promise<AgentRun> {
	const db = getDb();
	const [row] = await db
		.insert(agentRuns)
		.values({
			ownerUserId: input.ownerUserId,
			browserSessionId: input.browserSessionId,
			guideId: input.guideId || null,
			prompt: input.prompt,
			title: input.title || null,
			status: input.status,
			output: input.output,
			runtimeOptions: input.runtimeOptions,
			plannerOutput: input.plannerOutput || null,
			artifacts: input.artifacts || {},
			failureCode: input.failureCode || null,
			failureMessage: input.failureMessage || null,
			startedAt: sql`now()`,
		})
		.returning();

	return mapAgentRun(row);
}

export async function getAgentRunForOwner(
	ownerUserId: string,
	agentRunId: string
): Promise<AgentRun | null> {
	const db = getDb();
	const rows = await db
		.select()
		.from(agentRuns)
		.where(and(eq(agentRuns.agentRunId, agentRunId), eq(agentRuns.ownerUserId, ownerUserId)))
		.limit(1);

	return rows[0] ? mapAgentRun(rows[0]) : null;
}

export async function updateAgentRun(
	agentRunId: string,
	data: Partial<{
		title: string | null;
		status: AgentRun["status"];
		failureCode: AgentRun["failureCode"];
		failureMessage: string | null;
		output: AgentRunOutput;
		runtimeOptions: AgentRunRuntimeOptions;
		plannerOutput: AgentPlan | null;
		artifacts: AgentRunArtifacts;
		stepCount: number;
		completedAt: string | null;
	}>
): Promise<AgentRun | null> {
	const db = getDb();
	const [row] = await db
		.update(agentRuns)
		.set({
			...(data.title !== undefined ? { title: data.title } : {}),
			...(data.status !== undefined ? { status: data.status } : {}),
			...(data.failureCode !== undefined ? { failureCode: data.failureCode } : {}),
			...(data.failureMessage !== undefined ? { failureMessage: data.failureMessage } : {}),
			...(data.output !== undefined ? { output: data.output } : {}),
			...(data.runtimeOptions !== undefined ? { runtimeOptions: data.runtimeOptions } : {}),
			...(data.plannerOutput !== undefined ? { plannerOutput: data.plannerOutput } : {}),
			...(data.artifacts !== undefined ? { artifacts: data.artifacts } : {}),
			...(data.stepCount !== undefined ? { stepCount: data.stepCount } : {}),
			...(data.completedAt !== undefined ? { completedAt: data.completedAt } : {}),
			updatedAt: sql`now()`,
		})
		.where(eq(agentRuns.agentRunId, agentRunId))
		.returning();

	return row ? mapAgentRun(row) : null;
}
