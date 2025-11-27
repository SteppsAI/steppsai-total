import { z } from "zod";

// Step data from extension
const stepDataSchema = z.object({
    stepId: z.string(),
    orderIndex: z.number(),
    pageUrl: z.string(),
    domSelector: z.string(),
    imageKey: z.string(),
    timestamp: z.number()
});

// New: Steps insert message (guide already exists)
export const stepsInsertMessageSchema = z.object({
    type: z.literal("STEPS_INSERT"),
    guideId: z.string().uuid(),
    steps: z.array(stepDataSchema)
});

export const queueMessageSchema = z.discriminatedUnion("type", [
    stepsInsertMessageSchema
]);

export type StepsInsertMessageType = z.infer<typeof stepsInsertMessageSchema>;
export type QueueMessageType = z.infer<typeof queueMessageSchema>;
