export const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID || "nlcoadjbogjnmbikendanghkpmmhloab";

export const triggerExtensionSidePanel = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(EXTENSION_ID, { type: "OPEN_SIDE_PANEL" }, (response: any) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError);
                    reject(new Error("Please install the Stepps.ai extension to create a new Stepp."));
                } else {
                    console.log("Message sent successfully:", response);
                    resolve();
                }
            });
        } else {
            console.warn("Chrome runtime not available");
            reject(new Error("Please install the Stepps.ai extension to create a new Stepp."));
        }
    });
};
