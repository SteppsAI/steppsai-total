import { Hono } from "hono";
import {
    creemWebhookEventSchema,
} from "@repo/data-ops/zod-schema/subscriptions";
import {
    ensureOneTimeOrder,
    ensureSubscription,
    updateSubscriptionStatus,
    getSubscriptionByUserId,
} from "@repo/data-ops/queries/subscriptions";
import { getUser } from "@repo/data-ops/queries";
import { sendWelcomeEmail } from "../../helpers/mail";

export const webhooksRouter = new Hono<{ Bindings: Env }>();

// ============================================================================
// Creem Webhook Route
// ============================================================================

webhooksRouter.post("/creem", async (c) => {
    const payload = await c.req.text();
    const signature = c.req.header("creem-signature") ?? "";

    if (!c.env.CREEM_WEBHOOK_SECRET) {
        console.error("[Webhook] CREEM_WEBHOOK_SECRET is not configured");
        return c.text("Server configuration error", 500);
    }

    const isValid = await verifySignature(
        payload,
        signature,
        c.env.CREEM_WEBHOOK_SECRET
    );

    if (!isValid) {
        console.error("[Webhook] Signature verification failed");
        return c.text("Invalid signature", 401);
    }

    // Parse with Zod
    let event;
    try {
        const parsed = JSON.parse(payload);
        const result = creemWebhookEventSchema.safeParse(parsed);
        if (!result.success) {
            console.error("[Webhook] Zod validation failed:", result.error.message);
            return c.text("Invalid payload", 400);
        }
        event = result.data;
    } catch {
        console.error("[Webhook] Invalid JSON");
        return c.text("Invalid JSON", 400);
    }

    console.log(`[Webhook] Received: ${event.eventType}`);

    // Process event (no waitUntil needed in data-service since we're not in SPA worker)
    await processEvent(event, c.env);

    return c.json({ received: true });
});

// ============================================================================
// Signature Verification (HMAC-SHA256)
// ============================================================================

async function verifySignature(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(payload)
        );
        const expectedSignature = bufferToHex(signatureBuffer);
        return timingSafeEqual(expectedSignature, signature);
    } catch (error) {
        console.error("[Webhook] Signature verification error:", error);
        return false;
    }
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

// ============================================================================
// Event Processing
// ============================================================================

type CreemWebhookEvent = ReturnType<typeof creemWebhookEventSchema.parse>;

async function processEvent(event: CreemWebhookEvent, env: Env): Promise<void> {
    try {
        switch (event.eventType) {
            case "checkout.completed":
                await handleCheckoutCompleted(event.object, env);
                break;

            case "subscription.active":
            case "subscription.paid":
            case "subscription.trialing":
            case "subscription.update":
                await handleSubscriptionUpdate(event.object);
                break;

            case "subscription.canceled":
                await updateSubscriptionStatus(event.object.id, "canceled");
                console.log(`[Webhook] Subscription ${event.object.id} canceled`);
                break;

            case "subscription.expired":
                await updateSubscriptionStatus(event.object.id, "expired");
                console.log(`[Webhook] Subscription ${event.object.id} expired`);
                break;

            default:
                console.log(`[Webhook] Unhandled event type: ${event.eventType}`);
        }
    } catch (error) {
        console.error(`[Webhook] Error processing ${event.eventType}:`, error);
    }
}

// ============================================================================
// Event Handlers
// ============================================================================

function extractId(value: { id: string } | string | undefined): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.id;
}

async function handleCheckoutCompleted(obj: any, env: Env): Promise<void> {
    const referenceId = obj.metadata?.referenceId;
    const orderId = obj.order?.id;

    if (!referenceId) {
        console.error("[Webhook] checkout.completed: Missing referenceId");
        return;
    }
    if (!orderId) {
        console.error("[Webhook] checkout.completed: Missing orderId");
        return;
    }

    console.log(`[Webhook] Processing checkout for user ${referenceId}, order ${orderId}`);

    // Check if this is a new user (no existing subscription)
    const existingSubscription = await getSubscriptionByUserId(String(referenceId));
    const isNewUser = !existingSubscription;

    await ensureOneTimeOrder({
        orderId,
        productId: extractId(obj.product),
        referenceId: String(referenceId),
        customerId: extractId(obj.customer),
    });

    console.log(`[Webhook] Checkout completed for user ${referenceId}`);

    // Send welcome email only for new users
    if (isNewUser) {
        try {
            const user = await getUser(String(referenceId));
            if (user?.email) {
                await sendWelcomeEmail(env, user.email, user.name ?? "");
                console.log(`[Webhook] Welcome email sent to ${user.email}`);
            }
        } catch (emailError) {
            console.error("[Webhook] Failed to send welcome email:", emailError);
            // Don't throw - email failure shouldn't fail the webhook
        }
    }
}

async function handleSubscriptionUpdate(obj: any): Promise<void> {
    const referenceId = obj.metadata?.referenceId;

    if (!referenceId) {
        console.error("[Webhook] subscription update: Missing referenceId");
        return;
    }

    const periodStart = obj.current_period_start_date;
    const periodEnd = obj.current_period_end_date;

    await ensureSubscription({
        subscriptionId: obj.id,
        productId: extractId(obj.product),
        referenceId: String(referenceId),
        customerId: extractId(obj.customer),
        status: obj.status ?? "active",
        currentPeriodStart: periodStart
            ? Math.floor(new Date(periodStart).getTime() / 1000)
            : undefined,
        currentPeriodEnd: periodEnd
            ? Math.floor(new Date(periodEnd).getTime() / 1000)
            : undefined,
        cancelAtPeriodEnd: obj.cancel_at_period_end ?? false,
    });

    console.log(`[Webhook] Subscription updated for user ${referenceId}`);
}
