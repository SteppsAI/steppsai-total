export type RecordingState = 'idle' | 'recording' | 'paused' | 'finished';

export interface Step {
    id: string;
    orderIndex: number;
    imageKey: string;
    pageUrl: string;
    domSelector: string;
    previewUrl?: string; // Data URL for immediate display
}
