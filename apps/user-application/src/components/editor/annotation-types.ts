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
        color: '#6366F1', // indigo-500
        strokeWidth: 3,
    },
    circle: {
        color: '#EAB308', // yellow-500
        strokeWidth: 4,
    },
    hide: {
        color: '#000000',
    },
} as const;
