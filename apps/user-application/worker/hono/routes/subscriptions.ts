import { Hono } from "hono";
import { initDatabase } from "@repo/data-ops/database";
import {
    ensureOneTimeOrder,
    ensureSubscription,
    updateSubscriptionStatus,
} from "@repo/data-ops/queries/subscriptions";

// ============================================================================
// Route
// ============================================================================

export const subscriptionsRoute = new Hono<{
    Bindings: ServiceBindings;
}>();

subscriptionsRoute.post("/webhooks/creem", async (c) => {
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

    let event: CreemEvent;
    try {
        event = JSON.parse(payload);
    } catch {
        console.error("[Webhook] Invalid JSON");
        return c.text("Invalid JSON", 400);
    }

    if (!event.eventType || !event.object) {
        console.error("[Webhook] Missing eventType or object");
        return c.text("Invalid payload", 400);
    }

    console.log(`[Webhook] Received: ${event.eventType}`);

    c.executionCtx.waitUntil(processEvent(event, c.env.DATABASE_URL));

    return c.json({ received: true });
});

// ============================================================================
// Types (matching Creem API docs)
// ============================================================================

interface CreemEvent {
    id: string;
    eventType: string;
    created_at: number;
    object: CreemCheckoutObject | CreemSubscriptionObject;
}

interface CreemCheckoutObject {
    id: string;
    object?: "checkout";
    order?: { id: string };
    product?: CreemProduct;
    customer?: CreemCustomer;
    subscription?: CreemSubscriptionObject;
    metadata?: Record<string, unknown>;
    status?: string;
}

interface CreemSubscriptionObject {
    id: string;
    object?: "subscription";
    product?: CreemProduct | string;
    customer?: CreemCustomer | string;
    status?: string;
    current_period_start_date?: string;
    current_period_end_date?: string;
    cancel_at_period_end?: boolean;
    canceled_at?: string | null;
    metadata?: Record<string, unknown>;
}

interface CreemProduct {
    id: string;
    name?: string;
}

interface CreemCustomer {
    id: string;
    email?: string;
    name?: string;
}

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

async function processEvent(event: CreemEvent, databaseUrl: string): Promise<void> {
    await initDatabase(databaseUrl);

    try {
        switch (event.eventType) {
            case "checkout.completed":
                await handleCheckoutCompleted(event.object as CreemCheckoutObject);
                break;

            case "subscription.active":
            case "subscription.paid":
            case "subscription.trialing":
            case "subscription.update":
                await handleSubscriptionUpdate(event.object as CreemSubscriptionObject);
                break;

            case "subscription.canceled":
                await handleSubscriptionCanceled(event.object.id);
                break;

            case "subscription.expired":
                await handleSubscriptionExpired(event.object.id);
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

function extractId(value: CreemProduct | CreemCustomer | string | undefined): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.id;
}

async function handleCheckoutCompleted(obj: CreemCheckoutObject): Promise<void> {
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

    await ensureOneTimeOrder({
        orderId,
        productId: extractId(obj.product),
        referenceId: String(referenceId),
        customerId: extractId(obj.customer),
    });

    console.log(`[Webhook] Checkout completed for user ${referenceId}`);
}

async function handleSubscriptionUpdate(obj: CreemSubscriptionObject): Promise<void> {
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

async function handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
    await updateSubscriptionStatus(subscriptionId, "canceled");
    console.log(`[Webhook] Subscription ${subscriptionId} canceled`);
}

async function handleSubscriptionExpired(subscriptionId: string): Promise<void> {
    await updateSubscriptionStatus(subscriptionId, "expired");
    console.log(`[Webhook] Subscription ${subscriptionId} expired`);
}
