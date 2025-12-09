export const EXTENSION_ID =
  import.meta.env.VITE_EXTENSION_ID || "nlcoadjbogjnmbikendanghkpmmhloab";

export async function triggerExtensionSidePanel() {
  if (!window.chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
    throw new Error("Chrome runtime not available");
  }

  return chrome.runtime.sendMessage(EXTENSION_ID, { type: "OPEN_SIDE_PANEL" });
}

export async function notifyExtensionAuthChanged() {
  if (!window.chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
    return;
  }

  try {
    await chrome.runtime.sendMessage(EXTENSION_ID, { type: "AUTH_STATE_CHANGED" });
  } catch {
    // Extension might not be installed; fail silently
  }
}
