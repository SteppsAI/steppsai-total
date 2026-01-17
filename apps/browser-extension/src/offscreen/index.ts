/// <reference types="chrome" />

type Message =
    | { type: 'START_CAPTURE' }
    | { type: 'CAPTURE_FRAME' }
    | { type: 'STOP_STREAM' };

type CaptureType = 'screen' | 'window' | 'tab';

type Response = {
    success: true;
    dataUrl?: string;
    captureType?: CaptureType;
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
    sendResponse: (response: Response) => void
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

    // Detect capture type by comparing video dimensions
    // Account for device pixel ratio (Retina displays capture at higher resolution)
    const dpr = window.devicePixelRatio || 1;
    const screenWidth = window.screen.width * dpr;
    const screenHeight = window.screen.height * dpr;
    const windowWidth = window.outerWidth * dpr;
    const windowHeight = window.outerHeight * dpr;
    const viewportWidth = window.innerWidth * dpr;
    const viewportHeight = window.innerHeight * dpr;

    // Helper to check if dimensions match within 5% tolerance
    const dimensionsMatch = (w1: number, h1: number, w2: number, h2: number) => {
        const widthMatch = Math.abs(w1 - w2) / w2 < 0.05;
        const heightMatch = Math.abs(h1 - h2) / h2 < 0.05;
        return widthMatch && heightMatch;
    };

    // Detect capture type (check in order: screen, window, tab)
    if (dimensionsMatch(video.videoWidth, video.videoHeight, screenWidth, screenHeight)) {
        captureType = 'screen';
    } else if (dimensionsMatch(video.videoWidth, video.videoHeight, windowWidth, windowHeight)) {
        captureType = 'window';
    } else {
        captureType = 'tab';
    }

    console.log(`Capture type: ${captureType} (video: ${video.videoWidth}x${video.videoHeight}, screen: ${screenWidth}x${screenHeight}, window: ${windowWidth}x${windowHeight}, viewport: ${viewportWidth}x${viewportHeight})`);
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
