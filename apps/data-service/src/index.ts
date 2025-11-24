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
	fetch(request: Request) {
		return App.fetch(request, this.env, this.ctx)
	}
	async queue(batch: MessageBatch<unknown>) {
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

