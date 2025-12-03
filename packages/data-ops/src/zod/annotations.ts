import { z } from "zod";

// Annotation/Overlay schemas for step annotations
// These match the frontend Canvas component format (pixel-based when rendered)
// Stored as percentages in DB, converted to pixels in frontend

export const arrowAnnotationSchema = z.object({
    id: z.string(),
    type: z.literal("arrow"),
    points: z.tuple([z.number(), z.number(), z.number(), z.number()]), // [x1, y1, x2, y2]
    color: z.string(),
    strokeWidth: z.number(),
});

export const circleAnnotationSchema = z.object({
    id: z.string(),
    type: z.literal("circle"),
    x: z.number(),
    y: z.number(),
    radius: z.number(),
    color: z.string(),
    strokeWidth: z.number(),
});

export const hideAnnotationSchema = z.object({
    id: z.string(),
    type: z.literal("hide"),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    color: z.string(),
});

export const textAnnotationSchema = z.object({
    id: z.string(),
    type: z.literal("text"),
    x: z.number(),
    y: z.number(),
    text: z.string(),
    fontSize: z.number(),
    fontFamily: z.string().optional(),
    fill: z.string(),
    width: z.number().optional(),
    rotation: z.number().optional(),
});

export const annotationSchema = z.discriminatedUnion("type", [
    arrowAnnotationSchema,
    circleAnnotationSchema,
    hideAnnotationSchema,
    textAnnotationSchema,
]);

// Annotation defaults configuration
export const annotationDefaultsSchema = z.object({
    arrow: z.object({
        color: z.string(),
        strokeWidth: z.number(),
    }),
    circle: z.object({
        color: z.string(),
        strokeWidth: z.number(),
    }),
    hide: z.object({
        color: z.string(),
    }),
    text: z.object({
        fontSize: z.number(),
        fontFamily: z.string(),
        fill: z.string(),
    }),
});

// Type exports
export type Annotation = z.infer<typeof annotationSchema>;
export type ArrowAnnotation = z.infer<typeof arrowAnnotationSchema>;
export type CircleAnnotation = z.infer<typeof circleAnnotationSchema>;
export type HideAnnotation = z.infer<typeof hideAnnotationSchema>;
export type TextAnnotation = z.infer<typeof textAnnotationSchema>;
export type AnnotationDefaults = z.infer<typeof annotationDefaultsSchema>;

// Backwards compatibility with "overlay" terminology
export const overlaySchema = annotationSchema;
export const arrowOverlaySchema = arrowAnnotationSchema;
export const circleOverlaySchema = circleAnnotationSchema;
export const hideOverlaySchema = hideAnnotationSchema;
export const textOverlaySchema = textAnnotationSchema;

export type Overlay = Annotation;
export type ArrowOverlay = ArrowAnnotation;
export type CircleOverlay = CircleAnnotation;
export type HideOverlay = HideAnnotation;
export type TextOverlay = TextAnnotation;
