/// <reference types="chrome" />

import { trpc } from '../../lib/trpc';
import { convertToWebP } from '../../lib/helpers';
import { captureFrame, ensureActiveCaptureStream } from '../capture';

// Temporary storage for the screenshot being selected
let pendingScreenshot: string | null = null;

export function handleGetSelectionScreenshot() {
    return { dataUrl: pendingScreenshot };
}

export async function handleManualCaptureWithSelection() {
    const { isRecording, isPaused, guideId } = await chrome.storage.local.get([
        'isRecording', 'isPaused', 'guideId'
    ]);

    if (!isRecording || isPaused || !guideId) {
        return { success: false, error: 'No active recording' };
    }

    const streamCheck = await ensureActiveCaptureStream();
    if (!streamCheck.success) {
        return { success: false, error: streamCheck.error };
    }

    try {
        // Capture the current frame
        const { dataUrl: pngDataUrl } = await captureFrame();

        // Store it temporarily
        pendingScreenshot = pngDataUrl;

        // Open selection window
        const selectionUrl = chrome.runtime.getURL('selection.html');

        await chrome.windows.create({
            url: selectionUrl,
            type: 'popup',
            state: 'fullscreen'
        });

        return { success: true, awaitingSelection: true };

    } catch (error) {
        console.error('Failed to start selection capture:', error);
        return { success: false, error: String(error) };
    }
}

export async function handleSelectionConfirmed(payload: {
    dataUrl: string;
    cropped: boolean;
    selection?: { x: number; y: number; width: number; height: number };
}) {
    const { guideId, userId } = await chrome.storage.local.get(['guideId', 'userId']);

    if (!guideId) {
        console.error('No guide ID found');
        return { success: false, error: 'No active recording' };
    }

    try {
        // Convert to WebP
        const webpDataUrl = await convertToWebP(payload.dataUrl, 0.85);

        // Generate ID and Key
        const stepId = crypto.randomUUID();
        const imageKey = `screenshots/${guideId}/${userId}/${stepId}.webp`;

        // Get current steps
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

        // Save to local storage
        await chrome.storage.local.set({ steps: [...currentSteps, newStep] });
        console.log('Recorded Selection Step (Local):', newStep);

        // Upload via tRPC
        const uploadResult = await trpc.images.upload.mutate({
            key: imageKey,
            dataUrl: webpDataUrl
        });

        if (!uploadResult.success) {
            console.error('Upload failed');
            return { success: false, error: 'Upload failed' };
        }

        // Remove previewUrl to save space
        const { steps: updatedSteps } = await chrome.storage.local.get('steps');
        const stepIndex = updatedSteps.findIndex((s: any) => s.id === stepId);

        if (stepIndex !== -1) {
            delete updatedSteps[stepIndex].previewUrl;
            await chrome.storage.local.set({ steps: updatedSteps });
            console.log('Selection step synced to server:', stepId);
        }

        // Clear pending screenshot
        pendingScreenshot = null;

        return { success: true };

    } catch (error) {
        console.error('Failed to save selection:', error);
        return { success: false, error: String(error) };
    }
}

export function handleSelectionCancelled() {
    pendingScreenshot = null;
    console.log('Selection cancelled');
    return { success: true };
}
