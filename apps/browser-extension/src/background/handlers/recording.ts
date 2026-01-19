/// <reference types="chrome" />

import { trpc } from '../../lib/trpc';
import { startDesktopCapture, stopDesktopCapture } from '../capture';
import { captureAndPersistBrandLogo } from '../helpers/favicon';
import { injectContentScript } from '../helpers/content-script';

export async function handleStartRecording() {
    try {
        const captureStarted = await startDesktopCapture();
        if (!captureStarted) {
            return { success: false, error: 'Screen capture permission denied or cancelled' };
        }

        const result = await trpc.recording.start.mutate();

        if (!result.success) {
            await stopDesktopCapture();
            throw new Error('Failed to create guide');
        }

        const { guideId, userId } = result;

        await captureAndPersistBrandLogo({ guideId, userId });

        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'guideId', 'userId']);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab?.id) {
            await injectContentScript(tab.id);
        }

        const initialSteps = [];

        if (tab?.url && !tab.url.startsWith('chrome://')) {
            initialSteps.push({
                id: crypto.randomUUID(),
                type: 'navigate',
                orderIndex: 0,
                pageUrl: tab.url,
            });
        }

        await chrome.storage.local.set({
            isRecording: true,
            isPaused: false,
            recordingStartTime: Date.now(),
            guideId,
            userId,
            steps: initialSteps
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

export async function handleStopRecording() {
    try {
        const { steps, guideId, recordingStartTime } = await chrome.storage.local.get([
            'steps', 'guideId', 'recordingStartTime'
        ]);

        if (!guideId) {
            await chrome.storage.local.set({ isRecording: false });
            await chrome.action.setBadgeText({ text: '' });
            return { success: false, error: 'No active recording' };
        }

        const { userId } = await chrome.storage.local.get(['userId']);
        await captureAndPersistBrandLogo({ guideId, userId: userId || 'unknown' });

        await trpc.recording.complete.mutate({
            guideId,
            title: `Recording ${new Date(recordingStartTime).toLocaleString()}`,
            steps: steps || []
        });

        await stopDesktopCapture();

        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'isRecording', 'guideId', 'userId']);
        await chrome.action.setBadgeText({ text: '' });

        console.log(`Completed recording - Guide: ${guideId}`);
        return { success: true, guideId };
    } catch (error) {
        await stopDesktopCapture();
        console.error('Failed to stop recording:', error);
        return { success: false, error: String(error) };
    }
}

export async function handleDiscardRecording() {
    try {
        const { guideId } = await chrome.storage.local.get(['guideId']);

        if (guideId) {
            try {
                await trpc.recording.discard.mutate({ guideId });
                console.log(`Deleted guide: ${guideId}`);
            } catch (error) {
                console.error('Failed to delete guide from server:', error);
            }
        }

        await stopDesktopCapture();

        await chrome.storage.local.remove(['steps', 'recordingStartTime', 'isRecording', 'guideId', 'userId']);
        await chrome.action.setBadgeText({ text: '' });

        return { success: true };
    } catch (error) {
        await stopDesktopCapture();
        console.error('Failed to discard recording:', error);
        return { success: false, error: String(error) };
    }
}
