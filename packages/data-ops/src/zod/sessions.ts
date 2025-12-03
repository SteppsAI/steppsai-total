import { z } from "zod";
import { stepSchema } from "./steps";
import { annotationSchema } from "./annotations";

/**
 * Guide Session State
 * Used by Durable Objects to track editor session state
 */
export const guideStateSchema = z.object({
    title: z.string(),
    steps: z.array(stepSchema),
    lastModified: z.number(),
});

/**
 * Session Response
 * Response format from GuideSession Durable Object
 */
export const sessionResponseSchema = z.object({
    source: z.enum(["draft", "none"]),
    data: guideStateSchema.nullable(),
});

/**
 * Annotation History State
 * Used by use-annotation-history hook for undo/redo functionality
 */
export const historyStateSchema = z.object({
    past: z.array(z.array(annotationSchema)),
    present: z.array(annotationSchema),
    future: z.array(z.array(annotationSchema)),
});

// Type exports
export type GuideState = z.infer<typeof guideStateSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type HistoryState = z.infer<typeof historyStateSchema>;
