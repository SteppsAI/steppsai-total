export type RecordingState = 'idle' | 'recording' | 'paused';

export interface Step {
    id: string;
    orderIndex: number;
    imageKey: string;
    pageUrl: string;
    domSelector: string;
    previewUrl?: string; // Data URL for immediate display
}
