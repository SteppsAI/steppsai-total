/// <reference types="chrome" />

const API_BASE_URL = 'http://localhost:8787';

// Listen for messages from SidePanel or Content Script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_RECORDING') {
        handleStartRecording().then(sendResponse);
        return true; // Keep channel open for async response
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
        // Clear previous recording data
        await chrome.storage.local.remove(['steps', 'recordingStartTime']);

        // Set recording state
        await chrome.storage.local.set({
            isRecording: true,
            recordingStartTime: Date.now(),
            steps: []
        });

        await chrome.action.setBadgeText({ text: 'REC' });
        await chrome.action.setBadgeBackgroundColor({ color: '#F43F5E' });

        return { success: true };
    } catch (error) {
        console.error('Failed to start recording:', error);
        return { success: false, error: String(error) };
    }
}

async function handleStopRecording() {
    try {
        const { steps, recordingStartTime } = await chrome.storage.local.get(['steps', 'recordingStartTime']);

        if (!steps || steps.length === 0) {
            await chrome.storage.local.set({ isRecording: false });
            await chrome.action.setBadgeText({ text: '' });
            return { success: true, message: "No steps recorded" };
        }

        // Construct Batch Payload
        const payload = {
            guide: {
                title: `Recording ${new Date(recordingStartTime).toLocaleString()}`,
                description: "Recorded via Chrome Extension"
            },
            steps: steps
        };

        // Send Batch to Ingestion Endpoint
        const response = await fetch(`${API_BASE_URL}/guides/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Ingestion failed: ${response.statusText}`);
        }

        // Cleanup
        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'isRecording']);
        await chrome.action.setBadgeText({ text: '' });

        return { success: true };
    } catch (error) {
        console.error('Failed to stop recording:', error);
        return { success: false, error: String(error) };
    }
}

async function handleDiscardRecording() {
    try {
        // Simply clear all recording data without sending to server
        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'isRecording']);
        await chrome.action.setBadgeText({ text: '' });

        console.log('Recording discarded');
        return { success: true };
    } catch (error) {
        console.error('Failed to discard recording:', error);
        return { success: false, error: String(error) };
    }
}

async function handleStepAction(payload: any, tabId?: number) {
    const { isRecording } = await chrome.storage.local.get('isRecording');
    if (!isRecording || !tabId) return;

    try {
        // 1. Capture Screenshot
        const dataUrl = await chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, { format: 'jpeg', quality: 80 });

        // 2. Generate ID and Key
        const stepId = crypto.randomUUID();
        const imageKey = `${stepId}.jpg`;

        // 3. Upload to R2 (Fire & Forget)
        // Convert Data URL to Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        // Upload to Data Service Proxy
        fetch(`${API_BASE_URL}/images/${imageKey}`, {
            method: 'PUT',
            body: blob
        }).catch(err => console.error('Failed to upload image:', err));

        // 4. Store Metadata Locally (with imageKey)
        const { steps = [] } = await chrome.storage.local.get('steps');

        const newStep = {
            stepId: stepId,
            orderIndex: steps.length,
            pageUrl: payload.url || 'unknown',
            domSelector: payload.selector,
            imageKey: imageKey, // Store key, not URL (construct URL in UI)
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
