/// <reference types="chrome" />

import {
    handleStartRecording,
    handleStopRecording,
    handleDiscardRecording,
    handleManualCapture,
    handleStepAction,
    handleDeleteStep,
    handleNavigation
} from './handlers';

// ===== MESSAGE LISTENERS =====
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
    } else if (message.type === 'DELETE_STEP') {
        handleDeleteStep(message.payload).then(sendResponse);
        return true;
    } else if (message.type === 'MANUAL_CAPTURE') {
        handleManualCapture().then(sendResponse);
        return true;
    }
});

// ===== NAVIGATION LISTENER =====
chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0) {
        handleNavigation(details);
    }
});

// ===== ACTION CLICK =====
chrome.action.onClicked.addListener((tab) => {
    if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

// ===== EXTERNAL MESSAGES =====
chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
    if (message.type === 'OPEN_SIDE_PANEL') {
        chrome.tabs.create({ url: 'https://google.com' }, (tab) => {
            if (tab.windowId) {
                chrome.sidePanel.open({ windowId: tab.windowId })
                    .catch((error) => console.error('Failed to open side panel:', error));
            }
        });
        sendResponse({ success: true });
    } else if (message.type === 'AUTH_STATE_CHANGED') {
        chrome.storage.local.set({ authStateVersion: Date.now() });
        sendResponse({ success: true });
    }
});
