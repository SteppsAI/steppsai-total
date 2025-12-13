// Development ID (from your local machine)
const DEV_EXTENSION_ID = "hohppdhekklnpcddflglcdogkfnpohec";

export const EXTENSION_ID =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_EXTENSION_ID_PRODUCTION || DEV_EXTENSION_ID
    : import.meta.env.VITE_EXTENSION_ID_DEVELOPMENT || DEV_EXTENSION_ID;
// Actually user said: "Zet gewoon development id = VITE_EXTENSION_ID_DEVELOPMENT & production id = VITE_EXTENSION_ID_PRODUCTION"
// I will adhere to that, but keep the hardcoded dev fallback for convenience as agreed in plan.

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
