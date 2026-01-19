/// <reference types="chrome" />

interface SelectionRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const screenshot = document.getElementById('screenshot') as HTMLImageElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
const selection = document.getElementById('selection') as HTMLDivElement;
const instructions = document.getElementById('instructions') as HTMLDivElement;
const buttons = document.getElementById('buttons') as HTMLDivElement;
const confirmBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
const fullScreenBtn = document.getElementById('fullScreenBtn') as HTMLButtonElement;

let isSelecting = false;
let startX = 0;
let startY = 0;
let currentSelection: SelectionRect | null = null;
let imageDataUrl: string | null = null;

// Get screenshot from URL params (passed by background script)
const urlParams = new URLSearchParams(window.location.search);
const screenshotParam = urlParams.get('screenshot');

if (screenshotParam) {
    imageDataUrl = decodeURIComponent(screenshotParam);
    screenshot.src = imageDataUrl;
    screenshot.onload = () => {
        overlay.style.display = 'block';
    };
} else {
    // Fallback: request screenshot from background
    chrome.runtime.sendMessage({ type: 'GET_SELECTION_SCREENSHOT' }, (response) => {
        if (response?.dataUrl) {
            imageDataUrl = response.dataUrl;
            screenshot.src = imageDataUrl;
            screenshot.onload = () => {
                overlay.style.display = 'block';
            };
        }
    });
}

// Mouse event handlers
document.addEventListener('mousedown', (e) => {
    if (e.target === confirmBtn || e.target === cancelBtn || e.target === fullScreenBtn) return;

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selection.style.display = 'block';
    selection.style.left = `${startX}px`;
    selection.style.top = `${startY}px`;
    selection.style.width = '0';
    selection.style.height = '0';

    instructions.style.display = 'none';
    buttons.style.display = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selection.style.left = `${left}px`;
    selection.style.top = `${top}px`;
    selection.style.width = `${width}px`;
    selection.style.height = `${height}px`;
});

document.addEventListener('mouseup', (e) => {
    if (!isSelecting) return;
    isSelecting = false;

    const rect = selection.getBoundingClientRect();

    if (rect.width > 10 && rect.height > 10) {
        currentSelection = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
        buttons.style.display = 'flex';
    } else {
        selection.style.display = 'none';
        instructions.style.display = 'block';
    }
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cancelSelection();
    } else if (e.key === 'Enter' && currentSelection) {
        confirmSelection();
    }
});

cancelBtn.addEventListener('click', cancelSelection);
confirmBtn.addEventListener('click', confirmSelection);
fullScreenBtn.addEventListener('click', captureFullScreen);

function cancelSelection() {
    chrome.runtime.sendMessage({ type: 'SELECTION_CANCELLED' });
    window.close();
}

function captureFullScreen() {
    if (!imageDataUrl) return;

    // Send full image without cropping
    chrome.runtime.sendMessage({
        type: 'SELECTION_CONFIRMED',
        payload: {
            dataUrl: imageDataUrl,
            cropped: false
        }
    });
    window.close();
}

function confirmSelection() {
    if (!currentSelection || !imageDataUrl) return;

    // Create canvas to crop the image
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate scale factor (image might be scaled to fit window)
        const scaleX = img.naturalWidth / screenshot.clientWidth;
        const scaleY = img.naturalHeight / screenshot.clientHeight;

        // Get screenshot position in window
        const imgRect = screenshot.getBoundingClientRect();

        // Adjust selection coordinates relative to the image
        const cropX = (currentSelection!.x - imgRect.left) * scaleX;
        const cropY = (currentSelection!.y - imgRect.top) * scaleY;
        const cropWidth = currentSelection!.width * scaleX;
        const cropHeight = currentSelection!.height * scaleY;

        // Set canvas size to crop dimensions
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw cropped portion
        ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );

        // Convert to data URL
        const croppedDataUrl = canvas.toDataURL('image/png');

        // Send back to background
        chrome.runtime.sendMessage({
            type: 'SELECTION_CONFIRMED',
            payload: {
                dataUrl: croppedDataUrl,
                cropped: true,
                selection: currentSelection
            }
        });
        window.close();
    };
    img.src = imageDataUrl;
}
