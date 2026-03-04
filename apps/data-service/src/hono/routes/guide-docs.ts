import { Hono } from "hono";
import { guideDocsGenerateParamsSchema } from "@repo/data-ops/zod-schema";

export const guideDocsRouter = new Hono<{ Bindings: Env }>();

guideDocsRouter.post("/generate", async (c) => {
	try {
		const payload = await c.req.json();
		const parsed = guideDocsGenerateParamsSchema.safeParse(payload);
		if (!parsed.success) {
			return c.json({ error: parsed.error.flatten() }, 400);
		}

		await c.env.GUIDE_DOCS_WORKFLOW.create({
			params: parsed.data,
		});

		return c.json({ success: true, status: "PENDING" });
	} catch (error) {
		return c.json(
			{
				error: "Failed to trigger docs generation",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500
		);
	}
});

