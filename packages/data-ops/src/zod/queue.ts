import { z } from "zod";
import { ingestGuideSchema } from "./guides";

export const recordingIngestMessageSchema = z.object({
    type: z.literal("RECORDING_INGEST"),
    userId: z.string().uuid(),
    data: ingestGuideSchema
});

export const queueMessageSchema = z.discriminatedUnion("type", [
    recordingIngestMessageSchema
]);

export type RecordingIngestMessageType = z.infer<typeof recordingIngestMessageSchema>;
export type QueueMessageType = z.infer<typeof queueMessageSchema>;
