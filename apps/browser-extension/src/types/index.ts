export type RecordingState = 'idle' | 'recording' | 'paused';

export interface Step {
    stepId: string;
    orderIndex: number;
    pageUrl: string;
    domSelector: string;
    imageKey: string;
    timestamp: number;
}

