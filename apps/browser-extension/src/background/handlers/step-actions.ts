/// <reference types="chrome" />

import { trpc } from '../../lib/trpc';
import { convertToWebP } from '../../lib/helpers';
import { captureFrame, ensureActiveCaptureStream, type CaptureType } from '../capture';

export async function handleManualCapture() {
    const { isRecording, isPaused, guideId, userId } = await chrome.storage.local.get([
        'isRecording', 'isPaused', 'guideId', 'userId'
    ]);

    if (!isRecording || isPaused || !guideId) {
        return { success: false, error: 'No active recording' };
    }

    const streamCheck = await ensureActiveCaptureStream();
    if (!streamCheck.success) {
        return { success: false, error: streamCheck.error };
    }

    try {
        const { dataUrl: pngDataUrl } = await captureFrame();
        const webpDataUrl = await convertToWebP(pngDataUrl, 0.85);

        const stepId = crypto.randomUUID();
        const imageKey = `screenshots/${guideId}/${userId}/${stepId}.webp`;

        const { steps: currentSteps = [] } = await chrome.storage.local.get('steps');

        const newStep = {
            id: stepId,
            type: 'manual',
            orderIndex: currentSteps.length,
            imageKey,
            pageUrl: '',
            domSelector: '',
            previewUrl: webpDataUrl
        };

        await chrome.storage.local.set({ steps: [...currentSteps, newStep] });
        console.log('Recorded Manual Step (Local):', newStep);

        const uploadResult = await trpc.images.upload.mutate({
            key: imageKey,
            dataUrl: webpDataUrl
        });

        if (!uploadResult.success) {
            console.error('Upload failed');
            return { success: false, error: 'Upload failed' };
        }

        const { steps: updatedSteps } = await chrome.storage.local.get('steps');
        const stepIndex = updatedSteps.findIndex((s: any) => s.id === stepId);

        if (stepIndex !== -1) {
            delete updatedSteps[stepIndex].previewUrl;
            await chrome.storage.local.set({ steps: updatedSteps });
            console.log('Manual step synced to server:', stepId);
        }

        return { success: true };

    } catch (error) {
        console.error('Failed to capture manual step:', error);
        return { success: false, error: String(error) };
    }
}

function getCoordinatesForCaptureType(payload: any, captureType: CaptureType): { x: number; y: number } {
    switch (captureType) {
        case 'screen':
            return { x: payload.screenX, y: payload.screenY };
        case 'window':
            return { x: payload.windowX, y: payload.windowY };
        case 'tab':
        default:
            return { x: payload.viewportX, y: payload.viewportY };
    }
}

export async function handleStepAction(payload: any, tabId?: number) {
    const { isRecording, isPaused, guideId, userId } = await chrome.storage.local.get([
        'isRecording', 'isPaused', 'guideId', 'userId'
    ]);

    if (!isRecording || isPaused || !tabId || !guideId) return;

    const streamCheck = await ensureActiveCaptureStream();
    if (!streamCheck.success) {
        console.error('Step capture failed: stream not active and could not recover');
        return;
    }

    try {
        const { dataUrl: pngDataUrl, captureType } = await captureFrame();
        const webpDataUrl = await convertToWebP(pngDataUrl, 0.85);

        const stepId = crypto.randomUUID();
        const imageKey = `screenshots/${guideId}/${userId}/${stepId}.webp`;

        const { steps: currentSteps = [] } = await chrome.storage.local.get('steps');
        const { x, y } = getCoordinatesForCaptureType(payload, captureType);

        const newStep = {
            id: stepId,
            type: 'click',
            orderIndex: currentSteps.length,
            imageKey,
            pageUrl: payload.url || '',
            domSelector: payload.selector || '',
            x,
            y,
            previewUrl: webpDataUrl
        };

        try {
            await chrome.storage.local.set({ steps: [...currentSteps, newStep] });
            console.log('Recorded Step (Local):', newStep);
        } catch (storageError) {
            console.warn('Failed to save local step (likely quota exceeded), proceeding with upload only:', storageError);
        }

        const uploadResult = await trpc.images.upload.mutate({
            key: imageKey,
            dataUrl: webpDataUrl
        });

        if (!uploadResult.success) {
            console.error('Upload failed');
            return;
        }

        const { steps: updatedSteps } = await chrome.storage.local.get('steps');
        const stepIndex = updatedSteps.findIndex((s: any) => s.id === stepId);

        if (stepIndex !== -1) {
            delete updatedSteps[stepIndex].previewUrl;
            await chrome.storage.local.set({ steps: updatedSteps });
            console.log('Step synced to server:', stepId);
        }

    } catch (error) {
        console.error('Failed to capture step:', error);
    }
}

export async function handleDeleteStep(payload: { stepId: string }) {
    try {
        const { steps } = await chrome.storage.local.get('steps');
        const stepIndex = steps.findIndex((s: any) => s.id === payload.stepId);

        if (stepIndex === -1) return { success: false, error: 'Step not found' };

        const stepToDelete = steps[stepIndex];

        if (stepToDelete.imageKey) {
            try {
                await trpc.images.delete.mutate({ key: stepToDelete.imageKey });
                console.log(`Deleted image from R2: ${stepToDelete.imageKey}`);
            } catch (error) {
                console.error('Failed to delete image from R2:', error);
            }
        }

        const updatedSteps = steps.filter((s: any) => s.id !== payload.stepId);
        const reindexedSteps = updatedSteps.map((s: any, idx: number) => ({
            ...s,
            orderIndex: idx
        }));

        await chrome.storage.local.set({ steps: reindexedSteps });
        return { success: true };

    } catch (error) {
        console.error('Failed to delete step:', error);
        return { success: false, error: String(error) };
    }
}
