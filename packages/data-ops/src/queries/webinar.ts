import { eq, and } from "drizzle-orm";
import { getDb } from "../db/database";
import { webinarRegistrations } from "../drizzle-out/schema";

export interface WebinarRegistrationInsert {
    email: string;
    name: string;
    webinarId: string;
    source?: string;
}

/**
 * Add a webinar registration
 */
export async function addWebinarRegistration(data: WebinarRegistrationInsert) {
    const db = getDb();
    const [registration] = await db
        .insert(webinarRegistrations)
        .values({
            email: data.email,
            name: data.name,
            webinarId: data.webinarId,
            source: data.source,
        })
        .returning();

    return registration;
}

/**
 * Check if a registration already exists for this email + webinar
 */
export async function findWebinarRegistration(email: string, webinarId: string) {
    const db = getDb();
    const [registration] = await db
        .select()
        .from(webinarRegistrations)
        .where(
            and(
                eq(webinarRegistrations.email, email),
                eq(webinarRegistrations.webinarId, webinarId)
            )
        )
        .limit(1);

    return registration;
}

/**
 * Get all registrations for a webinar
 */
export async function getWebinarRegistrations(webinarId: string) {
    const db = getDb();
    return db
        .select()
        .from(webinarRegistrations)
        .where(eq(webinarRegistrations.webinarId, webinarId));
}

/**
 * Get registration count for a webinar
 */
export async function getWebinarRegistrationCount(webinarId: string): Promise<number> {
    const registrations = await getWebinarRegistrations(webinarId);
    return registrations.length;
}
