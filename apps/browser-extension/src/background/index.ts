/// <reference types="chrome" />

import { API_BASE_URL } from '../lib/constants';
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
        // 1. Create guide in database FIRST
        const response = await fetch(`${API_BASE_URL}/guides/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to create guide');
        }

        const { guideId, userId } = await response.json();

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

        // Send steps to complete the guide
        const response = await fetch(`${API_BASE_URL}/guides/${guideId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Recording ${new Date(recordingStartTime).toLocaleString()}`,
                steps: steps || []
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to complete guide');
        }

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
        
        // Delete guide from DB and R2 if guideId exists
        if (guideId) {
            const response = await fetch(`${API_BASE_URL}/guides/${guideId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                console.error('Failed to delete guide from server:', await response.text());
            } else {
                console.log(`Deleted guide: ${guideId}`);
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

        // Upload to data-service - WAIT for completion
        const uploadResponse = await fetch(`${API_BASE_URL}/images/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: imageKey,
                dataUrl: webpDataUrl
            })
        });

        if (!uploadResponse.ok) {
            console.error('Upload failed:', await uploadResponse.text());
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
