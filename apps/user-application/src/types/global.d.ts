export { };

declare global {
    interface Window {
        chrome?: {
            runtime?: {
                sendMessage: (
                    extensionId: string,
                    message: any,
                    options?: any,
                    responseCallback?: (response: any) => void
                ) => void;
                lastError?: {
                    message?: string;
                };
            };
        };
    }

    var chrome: {
        runtime: {
            sendMessage: (
                extensionId: string,
                message: any,
                options?: any,
                responseCallback?: (response: any) => void
            ) => void;
            lastError?: {
                message?: string;
            };
        };
    };
}
