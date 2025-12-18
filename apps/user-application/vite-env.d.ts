interface ImportMetaEnv {
  readonly VITE_BACKEND_HOST: string;
  readonly VITE_BASE_HOST: string;
  readonly VITE_AUTH_URL: string;
  readonly VITE_EXTENSION_ID_DEVELOPMENT: string;
  readonly VITE_EXTENSION_ID_PRODUCTION: string;
  // Lifetime Product IDs
  readonly VITE_CREEM_LIFETIME_PRODUCT_EU_DEVELOPMENT: string;
  readonly VITE_CREEM_LIFETIME_PRODUCT_US_DEVELOPMENT: string;
  readonly VITE_CREEM_LIFETIME_PRODUCT_EU_PRODUCTION: string;
  readonly VITE_CREEM_LIFETIME_PRODUCT_US_PRODUCTION: string;
  // Team Product IDs
  readonly VITE_CREEM_TEAM_PRODUCT_EU_DEVELOPMENT: string;
  readonly VITE_CREEM_TEAM_PRODUCT_US_DEVELOPMENT: string;
  readonly VITE_CREEM_TEAM_PRODUCT_EU_PRODUCTION: string;
  readonly VITE_CREEM_TEAM_PRODUCT_US_PRODUCTION: string;
  // Fallback/Legacy
  readonly VITE_CREEM_LIFETIME_PRODUCT_EU: string;
  readonly VITE_CREEM_LIFETIME_PRODUCT_US: string;
  readonly VITE_CREEM_TEAM_PRODUCT_EU: string;
  readonly VITE_CREEM_TEAM_PRODUCT_US: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
