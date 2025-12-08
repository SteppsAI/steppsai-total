interface Env extends Cloudflare.Env {
    DATABASE_URL: string;
    BUCKET_URL: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_API_TOKEN_BROWSER: string;
    RESEND_API_KEY: string;
    CREEM_API_KEY: string;
    BETTER_AUTH_SECRET: string;
    GUIDE_SESSION: DurableObjectNamespace<import('./src/durable-objects/GuideSession').GuideSession>;
}
