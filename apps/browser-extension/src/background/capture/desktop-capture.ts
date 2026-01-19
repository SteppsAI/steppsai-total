/// <reference types="chrome" />

import { ensureOffscreenDocument, closeOffscreenDocument, offscreenDocumentExists } from './offscreen';

export type CaptureType = 'screen' | 'window' | 'tab';

export type CaptureResult = {
    dataUrl: string;
    captureType: CaptureType;
};

let captureActive = false;

export function isCaptureActive(): boolean {
    return captureActive;
}

export function setCaptureActive(active: boolean): void {
    captureActive = active;
}

export async function startDesktopCapture(): Promise<boolean> {
    try {
        await closeOffscreenDocument();
        captureActive = false;

        await ensureOffscreenDocument();
        await new Promise(resolve => setTimeout(resolve, 200));

        const response = await chrome.runtime.sendMessage({
            type: 'START_CAPTURE'
        });

        if (response.success) {
            captureActive = true;
            return true;
        } else {
            console.error('Failed to start capture:', response.error);
            await closeOffscreenDocument();
            return false;
        }
    } catch (error) {
        console.error('Failed to start desktop capture:', error);
        await closeOffscreenDocument();
        return false;
    }
}

export async function captureFrame(): Promise<CaptureResult> {
    if (!captureActive) {
        throw new Error('No active capture stream. Start recording first.');
    }

    const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_FRAME'
    });

    if (response.success) {
        return {
            dataUrl: response.dataUrl,
            captureType: response.captureType ?? 'tab'
        };
    } else {
        throw new Error(response.error || 'Frame capture failed');
    }
}

export async function stopDesktopCapture(): Promise<void> {
    if (captureActive) {
        try {
            await chrome.runtime.sendMessage({ type: 'STOP_STREAM' });
        } catch (error) {
            console.warn('Error stopping stream:', error);
        }
        captureActive = false;
    }

    await closeOffscreenDocument();
}

export async function isStreamActuallyActive(): Promise<boolean> {
    if (!captureActive) return false;

    try {
        const exists = await offscreenDocumentExists();
        if (!exists) {
            console.warn('Offscreen document no longer exists');
            captureActive = false;
            return false;
        }

        const response = await chrome.runtime.sendMessage({ type: 'CHECK_STREAM_STATUS' });
        if (response?.success && response.isActive) {
            return true;
        }

        console.warn('Stream is no longer active in offscreen document');
        captureActive = false;
        return false;
    } catch (error) {
        console.warn('Failed to check stream status:', error);
        captureActive = false;
        return false;
    }
}

export async function ensureActiveCaptureStream(): Promise<{ success: boolean; error?: string }> {
    const isActive = await isStreamActuallyActive();

    if (isActive) {
        return { success: true };
    }

    console.log('Stream lost, attempting to restart capture...');

    const restarted = await startDesktopCapture();
    if (restarted) {
        console.log('Successfully restarted capture stream');
        return { success: true };
    }

    return {
        success: false,
        error: 'Screen capture stream was lost. Please click "Capture Now" again and select your screen when prompted.'
    };
}
