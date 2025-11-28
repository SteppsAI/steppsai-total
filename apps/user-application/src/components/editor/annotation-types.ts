export interface ArrowAnnotation {
    id: string;
    type: 'arrow';
    points: [number, number, number, number]; // x1, y1, x2, y2
    color: string;
    strokeWidth: number;
}

export interface CircleAnnotation {
    id: string;
    type: 'circle';
    x: number;
    y: number;
    radius: number;
    color: string;
    strokeWidth: number;
}

export interface HideAnnotation {
    id: string;
    type: 'hide';
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export type Annotation = ArrowAnnotation | CircleAnnotation | HideAnnotation;

// Configuration constants for annotations
export const ANNOTATION_DEFAULTS = {
    arrow: {
        color: '#4F46E5', // indigo-600 - better contrast
        strokeWidth: 4, // increased for better visibility
    },
    circle: {
        color: '#F59E0B', // amber-500 - better contrast than yellow
        strokeWidth: 5, // increased for better visibility
    },
    hide: {
        color: '#000000',
    },
} as const;
