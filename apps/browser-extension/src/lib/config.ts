/**
 * Extension Configuration
 * 
 * URLs for different environments
 */

// User Application (Frontend + tRPC API)
export const USER_APP_URL = {
    stage: 'https://user-application-stage.flat-dream-7a29.workers.dev',
    production: 'https://stepps.ai', // TODO: Update when ready
} as const;

// Data Service (Images only - direct access for serving)
export const DATA_SERVICE_URL = {
    stage: 'https://data-service-stage.flat-dream-7a29.workers.dev',
    production: 'https://api.stepps.ai', // TODO: Update when ready
} as const;

// Current environment
const ENV = 'stage' as const;

// Export active URLs
export const TRPC_URL = `${USER_APP_URL[ENV]}/trpc`;
export const WEB_APP_URL = USER_APP_URL[ENV];
export const IMAGES_URL = DATA_SERVICE_URL[ENV];



