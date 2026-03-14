import { z } from "zod";

export const agentRunStatusSchema = z.enum([
	"queued",
	"planning",
	"waiting_for_browser",
	"running",
	"paused_for_user",
	"processing_guide",
	"generating_docs",
	"completed",
	"failed",
	"cancelled",
]);

export const agentRunFailureCodeSchema = z.enum([
	"auth_required",
	"captcha_required",
	"selector_not_found",
	"browser_disconnected",
	"run_timeout",
	"upload_failed",
	"planner_failed",
]);

export const browserSessionStatusSchema = z.enum([
	"awaiting_pair",
	"active",
	"offline",
	"revoked",
]);

export const agentActionTypeSchema = z.enum([
	"open_tab",
	"focus_tab",
	"navigate",
	"click",
	"type",
	"press",
	"wait_for",
	"scroll",
	"capture",
	"extract_text",
]);

export const browserSessionCapabilitiesSchema = z
	.object({
		platform: z.string().optional(),
		browser: z.string().optional(),
		browserVersion: z.string().optional(),
		extensionVersion: z.string().optional(),
		actions: z.array(agentActionTypeSchema).default([]),
		supportsLiveBroker: z.boolean().default(false),
		supportsManualRecording: z.boolean().default(true),
	})
	.passthrough();

export const agentRunOutputSchema = z.object({
	shareGuide: z.boolean().default(true),
	generateDocs: z.boolean().default(false),
	publishDocs: z.boolean().default(false),
	reactExport: z.boolean().default(false),
});

export const agentRunRuntimeOptionsSchema = z.object({
	maxSteps: z.number().int().min(1).max(200).default(40),
	maxDurationSec: z.number().int().min(30).max(7200).default(900),
	screenshotPolicy: z.enum(["after_each_step"]).default("after_each_step"),
	stopOnAuthWall: z.boolean().default(true),
});

export const agentPlanActionSchema = z.object({
	id: z.string(),
	type: agentActionTypeSchema,
	title: z.string(),
	description: z.string().optional(),
	url: z.string().url().optional(),
	selector: z.string().optional(),
	text: z.string().optional(),
	value: z.string().optional(),
	key: z.string().optional(),
	timeoutMs: z.number().int().positive().optional(),
	recordStep: z.boolean().default(true),
});

export const agentPlanSchema = z.object({
	title: z.string(),
	summary: z.string(),
	successCriteria: z.array(z.string()).default([]),
	stopConditions: z.array(z.string()).default([]),
	actions: z.array(agentPlanActionSchema).min(1),
});

export const agentRunArtifactsSchema = z.object({
	guideId: z.string().uuid().nullable().optional(),
	sharedGuideUrl: z.string().nullable().optional(),
	docsPageId: z.string().uuid().nullable().optional(),
	publishedDocsUrl: z.string().nullable().optional(),
	reactExportSource: z.string().nullable().optional(),
});

export const createAgentRunInputSchema = z.object({
	prompt: z.string().min(5).max(4000),
	browserSessionId: z.string().uuid(),
	output: agentRunOutputSchema.default({}),
	runtime: agentRunRuntimeOptionsSchema.default({}),
});

export const createAgentApiKeyInputSchema = z.object({
	label: z.string().trim().min(1).max(120).optional(),
});

export const browserSessionPairingRequestSchema = z.object({
	displayName: z.string().trim().min(1).max(120).optional(),
});

export const claimBrowserSessionInputSchema = z.object({
	pairingToken: z.string().min(10),
	displayName: z.string().trim().min(1).max(120).optional(),
	extensionUserId: z.string().optional(),
	capabilities: browserSessionCapabilitiesSchema.default({}),
});

export const browserSessionHeartbeatInputSchema = z.object({
	capabilities: browserSessionCapabilitiesSchema.optional(),
});

export const agentApiKeySchema = z.object({
	apiKeyId: z.string().uuid(),
	ownerUserId: z.string(),
	label: z.string().nullable().optional(),
	keyPrefix: z.string(),
	keyLast4: z.string(),
	lastUsedAt: z.string().nullable().optional(),
	revokedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export const browserSessionSchema = z.object({
	browserSessionId: z.string().uuid(),
	ownerUserId: z.string(),
	extensionUserId: z.string().nullable().optional(),
	displayName: z.string().nullable().optional(),
	status: browserSessionStatusSchema,
	capabilities: browserSessionCapabilitiesSchema.default({}),
	currentRunId: z.string().uuid().nullable().optional(),
	lastSeenAt: z.string().nullable().optional(),
	pairingCodeExpiresAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
});

export const agentRunSchema = z.object({
	agentRunId: z.string().uuid(),
	ownerUserId: z.string(),
	browserSessionId: z.string().uuid(),
	guideId: z.string().uuid().nullable().optional(),
	prompt: z.string(),
	title: z.string().nullable().optional(),
	status: agentRunStatusSchema,
	failureCode: agentRunFailureCodeSchema.nullable().optional(),
	failureMessage: z.string().nullable().optional(),
	output: agentRunOutputSchema,
	runtimeOptions: agentRunRuntimeOptionsSchema,
	plannerOutput: agentPlanSchema.nullable().optional(),
	artifacts: agentRunArtifactsSchema.default({}),
	stepCount: z.number().int().default(0),
	startedAt: z.string().nullable().optional(),
	completedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
});

export type AgentApiKey = z.infer<typeof agentApiKeySchema>;
export type BrowserSession = z.infer<typeof browserSessionSchema>;
export type AgentRun = z.infer<typeof agentRunSchema>;
export type AgentPlan = z.infer<typeof agentPlanSchema>;
export type AgentRunArtifacts = z.infer<typeof agentRunArtifactsSchema>;
export type AgentRunOutput = z.infer<typeof agentRunOutputSchema>;
export type AgentRunRuntimeOptions = z.infer<typeof agentRunRuntimeOptionsSchema>;
export type CreateAgentRunInput = z.infer<typeof createAgentRunInputSchema>;
