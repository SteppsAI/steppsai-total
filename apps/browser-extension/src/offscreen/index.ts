/// <reference types="chrome" />

type Message =
    | { type: 'START_CAPTURE' }
    | { type: 'CAPTURE_FRAME' }
    | { type: 'STOP_STREAM' }
    | { type: 'CHECK_STREAM_STATUS' };

type CaptureType = 'screen' | 'window' | 'tab';

type CaptureResponse = {
    success: true;
    dataUrl?: string;
    captureType?: CaptureType;
    isActive?: boolean;
} | {
    success: false;
    error: string;
};

// Persistent stream for the recording session
let activeStream: MediaStream | null = null;
// Track capture type: 'screen' (full screen), 'window' (browser window), 'tab' (just the tab content)
let captureType: CaptureType = 'tab';

chrome.runtime.onMessage.addListener((
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: CaptureResponse) => void
) => {
    if (message.type === 'START_CAPTURE') {
        startCapture()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: String(error) }));
        return true;
    }

    if (message.type === 'CAPTURE_FRAME') {
        captureFrame()
            .then(dataUrl => sendResponse({ success: true, dataUrl, captureType }))
            .catch(error => sendResponse({ success: false, error: String(error) }));
        return true;
    }

    if (message.type === 'STOP_STREAM') {
        stopStream();
        sendResponse({ success: true });
        return false;
    }

    if (message.type === 'CHECK_STREAM_STATUS') {
        const isActive = activeStream !== null && activeStream.active;
        sendResponse({ success: true, isActive, captureType });
        return false;
    }
});

async function startCapture(): Promise<void> {
    const video = document.getElementById('video') as HTMLVideoElement;

    if (!video) {
        throw new Error('Video element not found');
    }

    // Stop any existing stream
    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
    }

    // Use getDisplayMedia - shows Chrome's native picker for screen/window/tab
    activeStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            displaySurface: 'monitor', // Prefer full screen, but user can choose
        },
        audio: false,
    });

    video.srcObject = activeStream;

    // Wait for video to be ready
    await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
            video.play()
                .then(() => resolve())
                .catch(reject);
        };
        video.onerror = () => reject(new Error('Video failed to load'));
    });

    // Detect capture type from MediaStreamTrack settings (the correct way!)
    // The displaySurface property tells us exactly what was selected
    const videoTrack = activeStream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings() as MediaTrackSettings & { displaySurface?: string };
    const displaySurface = settings?.displaySurface;

    // Map Chrome's displaySurface values to our capture types
    // 'monitor' = full screen, 'window' = specific window, 'browser' = browser tab
    if (displaySurface === 'monitor') {
        captureType = 'screen';
    } else if (displaySurface === 'window') {
        captureType = 'window';
    } else {
        // 'browser' or undefined defaults to tab
        captureType = 'tab';
    }

}

async function captureFrame(): Promise<string> {
    const video = document.getElementById('video') as HTMLVideoElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    if (!video || !canvas) {
        throw new Error('Video or canvas element not found');
    }

    if (!activeStream) {
        throw new Error('No active stream. Initialize first.');
    }

    // Ensure video is playing
    if (video.paused) {
        await video.play();
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to PNG data URL
    return canvas.toDataURL('image/png');
}

function stopStream(): void {
    const video = document.getElementById('video') as HTMLVideoElement;

    if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
        activeStream = null;
    }

    if (video) {
        video.srcObject = null;
    }

    captureType = 'tab';
}
