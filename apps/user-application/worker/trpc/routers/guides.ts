import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    createGuide,
    deleteGuide,
    getGuideWithSteps,
    getUserGuides,
    updateGuide,
} from "@repo/data-ops/queries";
import {
    createGuideSchema,
    // UpdateGuideSchema,
} from "@repo/data-ops/zod-schema";

export const guidesRouter = router({
    getAll: publicProcedure.query(async () => {
        // TODO: Get userId from context (auth)
        const userId = "user_123"; // Mock user ID for now
        return await getUserGuides(userId);
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const rows = await getGuideWithSteps(input.id);
            if (!rows.length) return null;
            const guide = rows[0].guide;
            const steps = rows.map((r: any) => r.step).filter((s: any) => s !== null);
            return { ...guide, steps };
        }),

    create: publicProcedure
        .input(createGuideSchema)
        .mutation(async ({ input }) => {
            return await createGuide(input);
        }),

    update: publicProcedure
        .input(z.object({ id: z.string(), data: createGuideSchema.partial() }))
        .mutation(async ({ input }) => {
            return await updateGuide(input.id, input.data);
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await deleteGuide(input.id);
        }),
});
