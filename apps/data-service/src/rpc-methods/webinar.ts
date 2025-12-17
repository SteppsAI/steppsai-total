import { initDatabase } from '@repo/data-ops/database';
import { addWebinarRegistration, findWebinarRegistration, getWebinarRegistrationCount } from '@repo/data-ops/queries/webinar';
import { createLoopsClient } from '../lib/loops-client';
import { generateWebinarCalendarLink, formatWebinarDateTime } from '../lib/calendar-link';

// Current webinar configuration
// TODO: Move to DB or config when you have multiple webinars
const CURRENT_WEBINAR = {
    webinarId: 'webinar-dec-2025',
    title: 'See Stepps.ai in Action - Live Demo',
    startAt: '2025-12-24T14:00:00Z', // Update this to your actual webinar date (UTC)
    timezone: 'Europe/Amsterdam',
    durationMinutes: 60,
    // Leave empty until you pick a webinar provider - calendar link will say "Link coming soon"
    joinUrl: '',
    // Optional: Loops mailing list ID for this webinar (create in Loops dashboard, copy ID)
    // This lets you export registrants from Loops dashboard if needed
    loopsMailingListId: '', // e.g., 'clx1234567890'
};

// Waitlist mailing list (optional)
const WAITLIST_MAILING_LIST_ID = ''; // Create in Loops dashboard if you want to track waitlist separately

export interface WebinarRegistrationInput {
    email: string;
    name: string;
    webinarId?: string;
    source?: string;
}

export interface WaitlistRegistrationInput {
    email: string;
    name: string;
    source?: string;
}

/**
 * Register for webinar
 * - Saves to DB
 * - Sends event to Loops (triggers confirmation email)
 * - Starts reminder workflow if first registration
 */
export async function registerForWebinar(
    env: Env,
    input: WebinarRegistrationInput
): Promise<{ success: boolean; message: string; isExisting: boolean }> {
    initDatabase(env.DATABASE_URL);

    const webinarId = input.webinarId || CURRENT_WEBINAR.webinarId;
    const webinar = CURRENT_WEBINAR; // TODO: fetch from DB when multiple webinars

    // Check if already registered
    const existing = await findWebinarRegistration(input.email, webinarId);
    if (existing) {
        console.log(`[Webinar] Already registered: ${input.email}`);
        return {
            success: true,
            message: 'You are already registered for this webinar!',
            isExisting: true,
        };
    }

    // Generate calendar link
    const calendarUrl = generateWebinarCalendarLink({
        title: webinar.title,
        startAt: webinar.startAt,
        durationMinutes: webinar.durationMinutes,
        joinUrl: webinar.joinUrl,
        timezone: webinar.timezone,
    });

    // Save registration to DB
    await addWebinarRegistration({
        email: input.email,
        name: input.name,
        webinarId,
        source: input.source,
    });
    console.log(`[Webinar] Registration saved: ${input.email}`);

    // Send event to Loops (triggers confirmation email)
    const loops = createLoopsClient(env.LOOPS_API_KEY);
    const formattedStartAt = formatWebinarDateTime(webinar.startAt, webinar.timezone);

    // Build mailing lists object if configured
    const mailingLists = webinar.loopsMailingListId
        ? { [webinar.loopsMailingListId]: true }
        : undefined;

    await loops.sendEvent({
        email: input.email,
        eventName: 'webinar_registered',
        contactProperties: {
            firstName: input.name.split(' ')[0],
            source: 'webinar_registration',
        },
        eventProperties: {
            webinarId,
            webinarTitle: webinar.title,
            webinarStartAt: formattedStartAt,
            webinarTimezone: webinar.timezone,
            joinUrl: webinar.joinUrl || 'Coming soon',
            calendarUrl,
        },
        mailingLists,
    });
    console.log(`[Webinar] Loops event sent: ${input.email}`);

    // Check if we need to start the reminder workflow
    // Only start once per webinar (when first registration comes in)
    const registrationCount = await getWebinarRegistrationCount(webinarId);
    if (registrationCount === 1) {
        console.log(`[Webinar] First registration - starting reminder workflow`);
        try {
            await env.WEBINAR_REMINDER_WORKFLOW.create({
                id: `webinar-reminders-${webinarId}`,
                params: {
                    webinarId,
                    webinarTitle: webinar.title,
                    webinarStartAt: webinar.startAt,
                    webinarTimezone: webinar.timezone,
                    joinUrl: webinar.joinUrl,
                    calendarUrl,
                },
            });
            console.log(`[Webinar] Reminder workflow started`);
        } catch (error) {
            // Workflow might already exist, that's OK
            console.log(`[Webinar] Reminder workflow already exists or failed to start:`, error);
        }
    }

    return {
        success: true,
        message: 'You are registered for the webinar! Check your email for confirmation.',
        isExisting: false,
    };
}

/**
 * Join waitlist
 * - Sends event to Loops (triggers waitlist confirmation email)
 */
export async function joinWaitlist(
    env: Env,
    input: WaitlistRegistrationInput
): Promise<{ success: boolean; message: string; isExisting: boolean }> {
    const loops = createLoopsClient(env.LOOPS_API_KEY);

    // Check if contact already exists in Loops
    const existingContacts = await loops.findContact(input.email);
    const isExisting = existingContacts.length > 0;

    // Build mailing lists object if configured
    const mailingLists = WAITLIST_MAILING_LIST_ID
        ? { [WAITLIST_MAILING_LIST_ID]: true }
        : undefined;

    // Send event to Loops (creates contact if doesn't exist)
    await loops.sendEvent({
        email: input.email,
        eventName: 'waitlist_joined',
        contactProperties: {
            firstName: input.name.split(' ')[0],
            source: 'waitlist',
        },
        eventProperties: {
            source: input.source || 'website',
        },
        mailingLists,
    });

    console.log(`[Waitlist] ${isExisting ? 'Existing contact' : 'New contact'} added: ${input.email}`);

    return {
        success: true,
        message: isExisting
            ? 'You are already on our waitlist!'
            : 'You have joined the waitlist! Check your email for confirmation.',
        isExisting,
    };
}
