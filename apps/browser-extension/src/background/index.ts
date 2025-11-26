/// <reference types="chrome" />

chrome.action.onClicked.addListener((tab) => {
    if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

chrome.runtime.onMessageExternal.addListener((message) => {
    if (message.type === 'OPEN_SIDE_PANEL') {
        chrome.windows.create({ url: 'https://www.google.com' }, (window) => {
            if (window && window.id) {
                chrome.sidePanel.open({ windowId: window.id });
            }
        });
    }
});
