// Re-export annotation types from centralized Zod schemas
export type {
    Annotation,
    ArrowAnnotation,
    CircleAnnotation,
    HideAnnotation,
    TextAnnotation,
} from "@repo/data-ops/zod-schema";

// Configuration constants for annotations
export const ANNOTATION_DEFAULTS = {
    arrow: {
        color: '#4F46E5', // indigo-600 - better contrast
        strokeWidth: 4, // increased for better visibility
    },
    circle: {
        color: '#F59E0B', // amber-500 - better contrast than yellow
        strokeWidth: 3, // reduced for better aesthetics
    },
    hide: {
        color: '#000000',
    },
    text: {
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#000000',
    },
} as const;

