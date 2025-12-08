import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app'
import { initDatabase } from '@repo/data-ops/database';
import { queueMessageSchema } from "@repo/data-ops/zod-schema/queue";
import { handleStepsInsert } from './queue-handlers/recording-ingest';
import * as rpc from './rpc-methods';
export { GuidePdfExportWorkflow } from './workflows/guide-pdf-export';
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
	triggerExport(guideId: string, format: 'pdf' | 'html') { return rpc.triggerExport(this.env, guideId, format); }

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


