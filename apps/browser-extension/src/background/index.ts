/// <reference types="chrome" />

import { trpc } from '../lib/trpc';
import { convertToWebP } from '../lib/helpers';

// Listen for messages from SidePanel or Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_RECORDING') {
        handleStartRecording().then(sendResponse);
        return true;
    } else if (message.type === 'STOP_RECORDING') {
        handleStopRecording().then(sendResponse);
        return true;
    } else if (message.type === 'DISCARD_RECORDING') {
        handleDiscardRecording().then(sendResponse);
        return true;
    } else if (message.type === 'STEP_ACTION') {
        handleStepAction(message.payload, sender.tab?.id);
    }
});

async function handleStartRecording() {
    try {
        // 1. Create guide via tRPC
        const result = await trpc.recording.start.mutate();

        if (!result.success) {
            throw new Error('Failed to create guide');
        }

        const { guideId, userId } = result;

        // 2. Clear previous data and store new recording state
        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'guideId', 'userId']);
        await chrome.storage.local.set({
            isRecording: true,
            recordingStartTime: Date.now(),
            guideId,
            userId,
            steps: []
        });

        await chrome.action.setBadgeText({ text: 'REC' });
        await chrome.action.setBadgeBackgroundColor({ color: '#F43F5E' });

        console.log(`Started recording - Guide: ${guideId}`);
        return { success: true, guideId };
    } catch (error) {
        console.error('Failed to start recording:', error);
        return { success: false, error: String(error) };
    }
}

async function handleStopRecording() {
    try {
        const { steps, guideId, recordingStartTime } = await chrome.storage.local.get([
            'steps', 'guideId', 'recordingStartTime'
        ]);

        if (!guideId) {
            await chrome.storage.local.set({ isRecording: false });
            await chrome.action.setBadgeText({ text: '' });
            return { success: false, error: 'No active recording' };
        }

        // Complete guide via tRPC
        await trpc.recording.complete.mutate({
            guideId,
            title: `Recording ${new Date(recordingStartTime).toLocaleString()}`,
            steps: steps || []
        });

        // Clear local storage
        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'isRecording', 'guideId', 'userId']);
        await chrome.action.setBadgeText({ text: '' });

        console.log(`Completed recording - Guide: ${guideId}`);
        return { success: true, guideId };
    } catch (error) {
        console.error('Failed to stop recording:', error);
        return { success: false, error: String(error) };
    }
}

async function handleDiscardRecording() {
    try {
        const { guideId } = await chrome.storage.local.get('guideId');
        
        // Delete guide via tRPC if guideId exists
        if (guideId) {
            try {
                await trpc.recording.discard.mutate({ guideId });
                console.log(`Deleted guide: ${guideId}`);
            } catch (error) {
                console.error('Failed to delete guide from server:', error);
            }
        }

        // Clear local storage
        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'isRecording', 'guideId', 'userId']);
        await chrome.action.setBadgeText({ text: '' });
        
        return { success: true };
    } catch (error) {
        console.error('Failed to discard recording:', error);
        return { success: false, error: String(error) };
    }
}

async function handleStepAction(payload: any, tabId?: number) {
    const { isRecording, guideId, userId } = await chrome.storage.local.get([
        'isRecording', 'guideId', 'userId'
    ]);
    
    if (!isRecording || !tabId || !guideId) return;

    try {
        // Capture Screenshot as PNG first
        const pngDataUrl = await chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { 
            format: 'png'
        });

        // Convert to WebP with 85% quality (good for text-heavy screenshots)
        const webpDataUrl = await convertToWebP(pngDataUrl, 0.85);

        // Generate ID and Key with new path structure
        const stepId = crypto.randomUUID();
        const imageKey = `screenshots/${guideId}/${userId}/${stepId}.webp`;

        // Upload via tRPC
        const uploadResult = await trpc.images.upload.mutate({
            key: imageKey,
            dataUrl: webpDataUrl
        });

        if (!uploadResult.success) {
            console.error('Upload failed');
            return;
        }

        // Store metadata locally AFTER upload confirmed
        const { steps = [] } = await chrome.storage.local.get('steps');

        const newStep = {
            stepId,
            orderIndex: steps.length,
            pageUrl: payload.url || '',
            domSelector: payload.selector || '',
            imageKey,
            timestamp: Date.now()
        };

        const updatedSteps = [...steps, newStep];
        await chrome.storage.local.set({ steps: updatedSteps });

        console.log('Recorded Step:', newStep);

    } catch (error) {
        console.error('Failed to capture step:', error);
    }
}

chrome.action.onClicked.addListener((tab) => {
    if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});
