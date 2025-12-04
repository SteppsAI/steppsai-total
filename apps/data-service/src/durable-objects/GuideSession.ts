import { DurableObject } from "cloudflare:workers";
import { updateGuide } from "@repo/data-ops/queries";
import { initDatabase } from "@repo/data-ops/database";
import type { GuideState, SessionResponse } from "@repo/data-ops/zod-schema";

// Auto-save configuration: save to DB after 5 minutes of inactivity
const AUTO_SAVE_DELAY_MS = 300_000; // 5 minutes


/**
 * GuideSession Durable Object
 * 
 * Manages editor session state for a single guide.
 * - Stores draft changes in DO storage (fast, persistent)
 * - Syncs to Postgres on explicit "save" action ? Because we otherwise store everything in DO
 * - Survives page refreshes and browser crashes
 * 
 * Call methods directly via stub - no HTTP requests needed!
 */
export class GuideSession extends DurableObject<Env> {
	state: GuideState | null = null;
	guideId: string | null = null;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			this.state = await ctx.storage.get<GuideState>("guide_state") || null;
			this.guideId = await ctx.storage.get<string>("guide_id") || null;
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
	 * Set the guide ID for this session
	 * Called during initialization to track which guide this DO manages
	 */
	async setGuideId(guideId: string): Promise<void> {
		if (this.guideId !== guideId) {
			this.guideId = guideId;
			await this.ctx.storage.put("guide_id", guideId);
		}
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

		// Set/reset alarm for auto-save after inactivity
		// Resets on every edit to ensure it only fires after continuous inactivity
		const alarmTime = Date.now() + AUTO_SAVE_DELAY_MS;
		await this.ctx.storage.setAlarm(alarmTime);

		return { success: true, lastModified: this.state.lastModified };
	}

	/**
	 * Save draft to database
	 */
	async saveToDb(guideId: string): Promise<{ success: boolean; savedAt: number }> {
		if (!this.state) {
			throw new Error("No draft to save");
		}

		// Store guideId if not set
		if (!this.guideId) {
			this.guideId = guideId;
			await this.ctx.storage.put("guide_id", guideId);
		}

		initDatabase(this.env.DATABASE_URL);

		await updateGuide(guideId, {
			title: this.state.title,
			steps: this.state.steps,
		});

		console.log(`[GuideSession] Manual save to DB: ${guideId}`);

		// Cancel any pending auto-save alarm since we just saved
		const existingAlarm = await this.ctx.storage.getAlarm();
		if (existingAlarm) {
			await this.ctx.storage.deleteAlarm();
			console.log('[GuideSession] Cancelled auto-save alarm (manual save)');
		}

		// Clear draft from storage to reduce KV operations
		await this.ctx.storage.delete("guide_state");
		this.state = null;

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

	/**
	 * Alarm handler - auto-saves to database after inactivity
	 * Called by Cloudflare Workers runtime when alarm fires
	 */
	async alarm() {
		console.log('[GuideSession] Alarm triggered - checking if auto-save needed');

		// Check if there's anything to save
		if (!this.state) {
			console.log('[GuideSession] No state to save, skipping auto-save');
			return;
		}

		if (!this.guideId) {
			console.error('[GuideSession] No guideId set, cannot auto-save');
			return;
		}

		// Check if state is empty (no steps or empty title)
		if ((!this.state.steps || this.state.steps.length === 0) && !this.state.title) {
			console.log('[GuideSession] State is empty, clearing DO without DB write');
			await this.ctx.storage.delete("guide_state");
			await this.ctx.storage.delete("guide_id");
			this.state = null;
			this.guideId = null;
			return;
		}

		try {
			// Save to database
			initDatabase(this.env.DATABASE_URL);
			await updateGuide(this.guideId, {
				title: this.state.title,
				steps: this.state.steps,
			});

			console.log(`[GuideSession] ✅ Auto-saved guide ${this.guideId} to database`);

			// Clear draft from KV storage to avoid double data
			await this.ctx.storage.delete("guide_state");
			await this.ctx.storage.delete("guide_id");
			this.state = null;
			this.guideId = null;

			console.log('[GuideSession] ✅ Draft cleared from DO storage');
		} catch (error) {
			console.error('[GuideSession] ❌ Auto-save failed:', error);
			// Don't clear draft if save failed - leave it for retry or manual save
		}
	}
}
