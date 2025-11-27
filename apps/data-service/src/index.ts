import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app'
import { initDatabase } from '@repo/data-ops/database';
import { queueMessageSchema } from "@repo/data-ops/zod-schema/queue";
import { handleRecordingIngest } from './queue-handlers/recording-ingest';

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
			if (parsedEvent.success) {
				const event = parsedEvent.data;
				if (event.type === "RECORDING_INGEST") {
					await handleRecordingIngest(this.env, event);
				}
			} else {
				console.error("Invalid Queue Message:", parsedEvent.error);
			}
			message.ack();
		}
	}
}

