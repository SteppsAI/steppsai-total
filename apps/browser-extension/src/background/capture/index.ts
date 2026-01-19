export {
    ensureOffscreenDocument,
    closeOffscreenDocument,
    offscreenDocumentExists
} from './offscreen';

export {
    type CaptureType,
    type CaptureResult,
    isCaptureActive,
    setCaptureActive,
    startDesktopCapture,
    captureFrame,
    stopDesktopCapture,
    isStreamActuallyActive,
    ensureActiveCaptureStream
} from './desktop-capture';
