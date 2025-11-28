export const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || "nlcoadjbogjnmbikendanghkpmmhloab";

export const triggerExtensionSidePanel = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log("Attempting to trigger extension with ID:", EXTENSION_ID);

        if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(EXTENSION_ID, { type: "OPEN_SIDE_PANEL" }, (response: any) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message to extension:", chrome.runtime.lastError);
                    console.error("Target Extension ID:", EXTENSION_ID);
                    reject(new Error(`Failed to connect to Stepps.ai extension (${EXTENSION_ID}). Please ensure it is installed and the ID matches.`));
                } else {
                    console.log("Message sent successfully:", response);
                    resolve();
                }
            });
        } else {
            console.warn("Chrome runtime not available");
            reject(new Error("Chrome runtime not available. Are you running this in Chrome?"));
        }
    });
};
