interface ServiceBindings extends Env {
    DATABASE_URL: string;
    ASSETS_URL: string;
    BACKEND_SERVICE: Service;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    CREEM_API_KEY: string;
    CREEM_WEBHOOK_SECRET?: string;
    BETTER_AUTH_SECRET: string;
}
