import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import {
  account,
  session,
  user,
  verification,
  creem_subscription,
} from "./drizzle-out/auth-schema";
import { creem } from "@creem_io/better-auth";

type CreemConfig = {
  apiKey: string;
  webhookSecret?: string;
  testMode?: boolean;
  defaultSuccessUrl?: string;
  persistSubscriptions?: boolean;
};

type EmailSender = {
  sendResetPassword?: (
    email: string,
    name: string,
    url: string,
  ) => Promise<void>;
  sendVerificationEmail?: (
    email: string,
    name: string,
    url: string,
  ) => Promise<void>;
};

export function getAuth(
  google: { clientId: string; clientSecret: string },
  creemConfig: CreemConfig,
  secret: string,
  emailSender?: EmailSender,
  baseURL?: string,
): ReturnType<typeof betterAuth> {
  // Fresh instance per request - no caching!
  return betterAuth({
    baseURL: baseURL || "https://stage.stepps.ai",
    trustedOrigins: [
      "https://stage.stepps.ai",
      "https://stepps.ai",
      "http://localhost:3000",
    ],
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user, session, account, verification, creem_subscription },
    }),
    secret,
    logger: {
      disabled: false,
      level: "debug",
      log: (level, message, ...args) => {
        console.log(`[BetterAuth][${level}]`, message, ...args);
      },
    },
    onAPIError: {
      throw: false,
      onError: (error, ctx) => {
        console.error("[BetterAuth][API Error]", { error, meta: ctx });
      },
    },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: emailSender?.sendResetPassword
        ? async ({ user, url }) => {
          await emailSender.sendResetPassword!(
            user.email,
            user.name ?? "",
            url,
          );
        }
        : undefined,
    },
    emailVerification: emailSender?.sendVerificationEmail
      ? {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          await emailSender.sendVerificationEmail!(
            user.email,
            user.name ?? "",
            url,
          );
        },
      }
      : undefined,
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: google.clientId,
        clientSecret: google.clientSecret,
      },
    },
    // Creem plugin - only used for checkout URL generation
    // Webhook handling is done in worker/hono/routes/subscriptions.ts
    plugins: [
      creem({
        apiKey: creemConfig.apiKey ?? "",
        webhookSecret: creemConfig.webhookSecret ?? "",
        testMode: creemConfig.testMode ?? true,
        defaultSuccessUrl: creemConfig.defaultSuccessUrl ?? "/success",
        persistSubscriptions: false, // We handle persistence ourselves
      }),
    ],
  });
}
