
/**
 * Converts an image URL to a Base64 data URL.
 * This is useful for pre-loading images to ensure they don't taint the canvas during export.
 * Note: The image server must support CORS (Access-Control-Allow-Origin).
 */
export async function urlToBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            method: "GET",
            mode: "cors", // This is crucial
            cache: "no-cache" // Helps avoid cached opaque responses
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result as string);
                } else {
                    reject(new Error("Failed to convert blob to base64"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("Image base64 conversion failed (likely CORS), falling back to original URL", error);
        // Fallback: just return the original URL if we can't base64 it. 
        // This allows the image to at least try to load normally, though export might still fail if strict.
        return url;
    }
}

/**
 * Pre-fetching font to base64 string
 * Useful if you need to manually construct @font-face styles
 */
export async function fontToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
