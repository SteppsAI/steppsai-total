/**
 * Extension Configuration
 * 
 * URLs from environment variables with stage fallbacks
 */

// User Application (Frontend + tRPC API)
export const WEB_APP_URL = import.meta.env.VITE_USER_APP_URL
    || import.meta.env.VITE_USER_APP_URL_STAGE
    || 'https://stage.stepps.ai';

// Data Service (Images only - direct access for serving)
export const IMAGES_URL = import.meta.env.VITE_DATA_SERVICE_URL

    || import.meta.env.VITE_DATA_SERVICE_URL_STAGE
    || 'https://api.stage.stepps.ai';

// tRPC endpoint
export const TRPC_URL = `${WEB_APP_URL}/trpc`;














