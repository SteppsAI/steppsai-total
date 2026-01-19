export type RecordingState = 'idle' | 'recording' | 'paused' | 'finished';

export interface Step {
    id: string;
    type: 'click' | 'navigate' | 'manual';
    orderIndex: number;
    imageKey?: string;
    pageUrl: string;
    domSelector?: string;
    x?: number;
    y?: number;
    previewUrl?: string; // Data URL for immediate display
}
