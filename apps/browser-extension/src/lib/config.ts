/**
 * Extension Configuration
 * 
 * URLs from environment variables with stage fallbacks
 */

// User Application (Frontend + tRPC API)
export const WEB_APP_URL = import.meta.env.VITE_USER_APP_URL
    || import.meta.env.VITE_USER_APP_URL_STAGE
    || 'https://user-application-stage.flat-dream-7a29.workers.dev';

// Data Service (Images only - direct access for serving)
export const IMAGES_URL = import.meta.env.VITE_DATA_SERVICE_URL
    || import.meta.env.VITE_DATA_SERVICE_URL_STAGE
    || 'https://data-service-stage.flat-dream-7a29.workers.dev';

// tRPC endpoint
export const TRPC_URL = `${WEB_APP_URL}/trpc`;










