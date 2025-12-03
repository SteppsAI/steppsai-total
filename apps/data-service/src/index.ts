import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app'
import { initDatabase } from '@repo/data-ops/database';
import { queueMessageSchema } from "@repo/data-ops/zod-schema/queue";
import { handleStepsInsert } from './queue-handlers/recording-ingest';
export { GuidePdfExportWorkflow } from './workflows/guide-pdf-export';
export { GuideSession } from './durable-objects/GuideSession';

export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		initDatabase(env.DATABASE_URL);
	}
	async fetch(request: Request) {
		// Handle CORS preflight requests
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

		// Add CORS headers to response
		const newRes = new Response(response.body, response);
		newRes.headers.set("Access-Control-Allow-Origin", "*");
		newRes.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		newRes.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		return newRes;
	}
	async queue(batch: MessageBatch<unknown>) {
		// Initialize database for queue context
		initDatabase(this.env.DATABASE_URL);

		for (const message of batch.messages) {
			const parsedEvent = queueMessageSchema.safeParse(message.body);

			if (!parsedEvent.success) {
				console.error("Invalid Queue Message:", parsedEvent.error.message);
				message.ack(); // Ack invalid messages to prevent infinite loop
				continue;
			}

			const event = parsedEvent.data;

			try {
				if (event.type === "STEPS_INSERT") {
					await handleStepsInsert(this.env, event);
				}
				message.ack();
			} catch (error) {
				// Handler already cleaned up zombie data
				// Ack the message so we don't retry (data is already deleted)
				console.error(`Queue handler failed, data cleaned up. Acknowledging message.`);
				message.ack();
			}
		}
	}
}
