interface Env extends Cloudflare.Env {
    DATABASE_URL: string;
    BUCKET_URL: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_API_TOKEN_BROWSER: string;
}
