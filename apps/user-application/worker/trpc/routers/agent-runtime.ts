import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";

const runStateSchema = z.object({
	status: z.enum(["running", "paused_for_user", "failed"]),
	failureCode: z
		.enum([
			"auth_required",
			"captcha_required",
			"selector_not_found",
			"browser_disconnected",
			"run_timeout",
			"upload_failed",
			"planner_failed",
		])
		.nullish(),
	failureMessage: z.string().nullish(),
	stepCount: z.number().int().nonnegative().optional(),
});

function serializeRuntimeRun(run: any) {
	return run
		? {
				...run,
				runtime: run.runtimeOptions,
			}
		: null;
}

export const agentRuntimeRouter = router({
	claimBrowserSession: publicProcedure
		.input(
			z.object({
				pairingToken: z.string(),
				displayName: z.string().optional(),
				capabilities: z.record(z.string(), z.unknown()),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.claimBrowserSessionForOwner(
				ctx.userInfo.userId,
				input.pairingToken,
				{
					displayName: input.displayName,
					capabilities: input.capabilities,
				}
			);

			if (!result) {
				throw new Error("Invalid pairing token");
			}

			return result;
		}),

	heartbeatBrowserSession: publicProcedure
		.input(
			z.object({
				browserSessionId: z.string(),
				capabilities: z.record(z.string(), z.unknown()),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.heartbeatBrowserSessionForOwner(
				ctx.userInfo.userId,
				input.browserSessionId,
				input.capabilities
			);

			if (!result?.success) {
				throw new Error(result?.error || "Failed to heartbeat browser session");
			}

			return {
				...result,
				currentRun: serializeRuntimeRun(result.currentRun),
			};
		}),

	updateRunState: publicProcedure
		.input(
			z.object({
				browserSessionId: z.string(),
				runId: z.string(),
				payload: runStateSchema,
			})
		)
		.mutation(async ({ ctx, input }) => {
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.updateAgentRunStateForOwner(
				ctx.userInfo.userId,
				input.browserSessionId,
				input.runId,
				input.payload
			);

			if (!result?.success) {
				throw new Error(result?.error || "Failed to update run state");
			}

			return result;
		}),

	completeRun: publicProcedure
		.input(
			z.object({
				browserSessionId: z.string(),
				runId: z.string(),
				payload: z.object({
					title: z.string().optional(),
					rawSteps: z.array(z.record(z.string(), z.unknown())),
					brandImageKey: z.string().nullable().optional(),
				}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const backend = ctx.env.BACKEND_SERVICE as any;
			const result = await backend.completeAgentRunForOwner(
				ctx.userInfo.userId,
				input.browserSessionId,
				input.runId,
				input.payload
			);

			if (!result?.success) {
				throw new Error(result?.error || "Failed to complete run");
			}

			return result;
		}),
});
