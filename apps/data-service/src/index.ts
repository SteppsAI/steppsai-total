import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app'
import { initDatabase } from '@repo/data-ops/database';
import { queueMessageSchema } from "@repo/data-ops/zod-schema/queue";
import { handleStepsInsert } from './queue-handlers/recording-ingest';
import * as rpc from './rpc-methods';
export { GuidePdfExportWorkflow } from './workflows/guide-pdf-export';
export { GuideDocsGenerateWorkflow } from './workflows/guide-docs-generate';
export { WebinarReminderWorkflow } from './workflows/webinar-reminders';
export { GuideSession } from './durable-objects/GuideSession';

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		initDatabase(env.DATABASE_URL);
	}

	async fetch(request: Request) {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
				},
			});
		}
		const response = await App.fetch(request, this.env, this.ctx);
		const newRes = new Response(response.body, response);
		newRes.headers.set("Access-Control-Allow-Origin", "*");
		newRes.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		newRes.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		return newRes;
	}

	// ===== GUIDES =====
	startRecording(userId: string) { return rpc.startRecording(this.env, userId); }
	completeRecording(guideId: string, title: string, steps: any[]) { return rpc.completeRecording(this.env, guideId, title, steps); }
	deleteGuideWithImages(guideId: string) { return rpc.deleteGuideWithImages(this.env, guideId); }
	deleteStepWithImage(guideId: string, stepId: string, imageKey?: string) { return rpc.deleteStepWithImage(this.env, guideId, stepId, imageKey); }

	// ===== USERS =====
	uploadAvatar(userId: string, dataUrl: string) { return rpc.uploadAvatar(this.env, userId, dataUrl); }
	deleteAvatar(userId: string) { return rpc.deleteAvatar(this.env, userId); }

	// ===== EXPORTS =====
	triggerExport(guideId: string, format: 'pdf' | 'html' | 'docx') { return rpc.triggerExport(this.env, guideId, format); }
	triggerGuideDocsGeneration(guideId: string, input: any, section?: "all" | "intro" | "troubleshooting") {
		return rpc.triggerGuideDocsGeneration(this.env, guideId, input, section);
	}

	// ===== EDITOR =====
	getEditorState(guideId: string) { return rpc.getEditorState(this.env, guideId); }
	updateEditorState(guideId: string, state: any) { return rpc.updateEditorState(this.env, guideId, state); }
	saveEditorSession(guideId: string) { return rpc.saveEditorSession(this.env, guideId); }
	discardEditorSession(guideId: string) { return rpc.discardEditorSession(this.env, guideId); }

	// ===== IMAGES =====
	uploadImage(key: string, dataUrl: string) { return rpc.uploadImage(this.env, key, dataUrl); }
	deleteImage(key: string) { return rpc.deleteImage(this.env, key); }
	deleteImagesBatch(keys: string[]) { return rpc.deleteImagesBatch(this.env, keys); }

	// ===== AUTH =====
	sendPasswordResetEmail(email: string, name: string, url: string) {
		return rpc.sendPasswordResetEmail(this.env, email, name, url);
	}
	sendVerificationEmail(email: string, name: string, url: string) {
		return rpc.sendVerificationEmail(this.env, email, name, url);
	}
	authHealthCheck() {
		return rpc.authHealthCheck(this.env);
	}

	// ===== NOTIFICATIONS =====
	sendFeedback(data: { email: string; name: string; subject: string; type: string; message: string }) {
		return rpc.sendFeedback(this.env, data);
	}

	// ===== WEBINAR & WAITLIST =====
	registerForWebinar(data: { email: string; name: string; webinarId?: string; source?: string }) {
		return rpc.registerForWebinar(this.env, data);
	}
	joinWaitlist(data: { email: string; name: string; source?: string }) {
		return rpc.joinWaitlist(this.env, data);
	}

	// ===== AGENT API =====
	createAgentApiKey(ownerUserId: string, label?: string) {
		return rpc.createAgentApiKey(this.env, ownerUserId, label);
	}
	listAgentApiKeys(ownerUserId: string) {
		return rpc.listAgentApiKeys(this.env, ownerUserId);
	}
	revokeAgentApiKey(ownerUserId: string, apiKeyId: string) {
		return rpc.revokeAgentApiKeyForOwner(this.env, ownerUserId, apiKeyId);
	}
	authenticateAgentApiKey(rawKey: string) {
		return rpc.authenticateAgentApiKey(this.env, rawKey);
	}
	createBrowserSessionPairingToken(ownerUserId: string, displayName?: string) {
		return rpc.createBrowserSessionPairingToken(this.env, ownerUserId, displayName);
	}
	listBrowserSessions(ownerUserId: string) {
		return rpc.listBrowserSessions(this.env, ownerUserId);
	}
	claimBrowserSessionForOwner(ownerUserId: string, pairingToken: string, input?: { displayName?: string; capabilities?: Record<string, unknown> }) {
		return rpc.claimBrowserSessionForOwner(this.env, ownerUserId, pairingToken, input);
	}
	claimBrowserSession(pairingToken: string, input?: { displayName?: string; extensionUserId?: string; capabilities?: Record<string, unknown> }) {
		return rpc.claimBrowserSession(this.env, pairingToken, input);
	}
	heartbeatBrowserSessionForOwner(ownerUserId: string, browserSessionId: string, capabilities?: Record<string, unknown>) {
		return rpc.heartbeatBrowserSessionForOwner(this.env, ownerUserId, browserSessionId, capabilities);
	}
	heartbeatBrowserSession(browserSessionId: string, sessionSecret: string, capabilities?: Record<string, unknown>) {
		return rpc.heartbeatBrowserSession(this.env, browserSessionId, sessionSecret, capabilities);
	}
	createAgentRun(ownerUserId: string, input: { prompt: string; browserSessionId: string; output: any; runtime: any }) {
		return rpc.createAgentRun(this.env, ownerUserId, input);
	}
	getAgentRun(ownerUserId: string, agentRunId: string) {
		return rpc.getAgentRun(this.env, ownerUserId, agentRunId);
	}
	resumeAgentRun(ownerUserId: string, agentRunId: string) {
		return rpc.resumeAgentRun(this.env, ownerUserId, agentRunId);
	}
	cancelAgentRun(ownerUserId: string, agentRunId: string) {
		return rpc.cancelAgentRun(this.env, ownerUserId, agentRunId);
	}
	updateAgentRunStateForOwner(
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
		return rpc.updateAgentRunStateForOwner(this.env, ownerUserId, browserSessionId, agentRunId, data);
	}
	updateAgentRunStateFromBrowser(
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
		return rpc.updateAgentRunStateFromBrowser(this.env, browserSessionId, sessionSecret, agentRunId, data);
	}
	completeAgentRunForOwner(
		ownerUserId: string,
		browserSessionId: string,
		agentRunId: string,
		data: {
			title?: string;
			rawSteps: any[];
			brandImageKey?: string | null;
		}
	) {
		return rpc.completeAgentRunForOwner(this.env, ownerUserId, browserSessionId, agentRunId, data);
	}
	completeAgentRunFromBrowser(
		browserSessionId: string,
		sessionSecret: string,
		agentRunId: string,
		data: {
			title?: string;
			rawSteps: any[];
			brandImageKey?: string | null;
		}
	) {
		return rpc.completeAgentRunFromBrowser(this.env, browserSessionId, sessionSecret, agentRunId, data);
	}

	// ===== QUEUE =====
	async queue(batch: MessageBatch<unknown>) {
		initDatabase(this.env.DATABASE_URL);
		for (const message of batch.messages) {
			const parsedEvent = queueMessageSchema.safeParse(message.body);
			if (!parsedEvent.success) {
				console.error("Invalid Queue Message:", parsedEvent.error.message);
				message.ack();
				continue;
			}
			const event = parsedEvent.data;
			try {
				if (event.type === "STEPS_INSERT") {
					await handleStepsInsert(this.env, event);
				}
				message.ack();
			} catch (error) {
				console.error(`Queue handler failed. Acknowledging message.`);
				message.ack();
			}
		}
	}
}
