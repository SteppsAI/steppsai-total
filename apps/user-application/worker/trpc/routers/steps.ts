import { z } from "zod";
import { router, publicProcedure } from "../trpc-instance";
import {
    createStep,
    deleteStep,
    reorderSteps,
    updateStep,
} from "@repo/data-ops/queries";
import { createStepSchema, updateStepSchema, CreateStepSchemaType } from "@repo/data-ops/zod-schema";


export const stepsRouter = router({
    create: publicProcedure.input(createStepSchema).mutation(async ({ input }) => {
        return await createStep(input as CreateStepSchemaType);
    }),

    update: publicProcedure
        .input(z.object({ id: z.string(), data: updateStepSchema }))
        .mutation(async ({ input }) => {
            return await updateStep(input.id, input.data);
        }),

    reorder: publicProcedure
        .input(
            z.object({
                guideId: z.string(),
                stepIds: z.array(z.string()),
            }),
        )
        .mutation(async ({ input }) => {
            return await reorderSteps(input.guideId, input.stepIds);
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            return await deleteStep(input.id);
        }),
});
