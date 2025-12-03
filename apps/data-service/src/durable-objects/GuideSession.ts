import { DurableObject } from "cloudflare:workers";
import { updateGuide } from "@repo/data-ops/queries";
import { initDatabase } from "@repo/data-ops/database";
import type { Step } from "@repo/data-ops/zod-schema";

export interface GuideState {
	title: string;
	steps: Step[];
	lastModified: number;
}

export interface SessionResponse {
	source: "draft" | "none";
	data: GuideState | null;
}

/**
 * GuideSession Durable Object
 * 
 * Manages editor session state for a single guide.
 * - Stores draft changes in DO storage (fast, persistent)
 * - Syncs to Postgres on explicit "save" action
 * - Survives page refreshes and browser crashes
 * 
 * Call methods directly via stub - no HTTP requests needed!
 */
export class GuideSession extends DurableObject<Env> {
	state: GuideState | null = null;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this.state = await ctx.storage.get<GuideState>("guide_state") || null;
		});
	}

	/**
	 * Get current session state
	 */
	async getState(): Promise<SessionResponse> {
		if (this.state) {
			return { source: "draft", data: this.state };
		}
		return { source: "none", data: null };
	}

	/**
	 * Update draft state
	 */
	async updateState(data: Partial<GuideState>): Promise<{ success: boolean; lastModified: number }> {
		this.state = {
			title: data.title ?? this.state?.title ?? "",
			steps: data.steps ?? this.state?.steps ?? [],
			lastModified: Date.now(),
		};

		await this.ctx.storage.put("guide_state", this.state);

		return { success: true, lastModified: this.state.lastModified };
	}

	/**
	 * Save draft to database
	 */
	async saveToDb(guideId: string): Promise<{ success: boolean; savedAt: number }> {
		if (!this.state) {
			throw new Error("No draft to save");
		}

		initDatabase(this.env.DATABASE_URL);

		await updateGuide(guideId, {
			title: this.state.title,
			steps: this.state.steps,
		});

		console.log(`GuideSession saved to DB: ${guideId}`);

		return { success: true, savedAt: Date.now() };
	}

	/**
	 * Discard draft and clear storage
	 */
	async discard(): Promise<{ success: boolean }> {
		await this.ctx.storage.delete("guide_state");
		this.state = null;
		return { success: true };
	}
}
