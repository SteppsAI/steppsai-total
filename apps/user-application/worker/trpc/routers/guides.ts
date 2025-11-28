import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    createGuide,
    deleteGuide,
    getGuide,
    getUserGuides,
    updateGuide,
} from "@repo/data-ops/queries";
import { createGuideSchema } from "@repo/data-ops/zod-schema";

export const guidesRouter = router({
    getAll: publicProcedure.query(async () => {
        // TODO: Get userId from context (auth)
        const userId = "f1d84914-ec7c-4b1a-9a89-eaeff6b2f366"; // Hardcoded for now
        return await getUserGuides(userId);
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            // Guide now includes steps as JSONB
            return await getGuide(input.id);
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
