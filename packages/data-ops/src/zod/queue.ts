import { z } from "zod";
import { stepFromExtensionSchema } from "./steps";

// Steps insert message - extension sends steps to be added to guide
export const stepsInsertMessageSchema = z.object({
    type: z.literal("STEPS_INSERT"),
    guideId: z.string().uuid(),
    brandImageKey: z.string().optional(),
    steps: z.array(stepFromExtensionSchema)
});

export const queueMessageSchema = z.discriminatedUnion("type", [
    stepsInsertMessageSchema
]);

export type StepsInsertMessage = z.infer<typeof stepsInsertMessageSchema>;
export type QueueMessage = z.infer<typeof queueMessageSchema>;
