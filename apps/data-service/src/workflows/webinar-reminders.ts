import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';
import { initDatabase } from '@repo/data-ops/database';
import { getWebinarRegistrations } from '@repo/data-ops/queries/webinar';
import { createLoopsClient } from '../helpers/loops-client';
import { formatWebinarDateTime } from '../helpers/calendar-link';

export interface WebinarReminderParams {
    webinarId: string;
    webinarTitle: string;
    webinarStartAt: string; // ISO 8601 UTC
    webinarTimezone: string;
    joinUrl: string;
    calendarUrl: string;
}

/**
 * Webinar Reminder Workflow
 *
 * This workflow is started once per webinar (when the first registration comes in).
 * It sleeps until the appropriate times and sends reminders to ALL registrants.
 *
 * Reminder schedule:
 * - 2 days before
 * - 1 day before
 * - 8 hours before
 */
export class WebinarReminderWorkflow extends WorkflowEntrypoint<Env, WebinarReminderParams> {
    async run(event: Readonly<WorkflowEvent<WebinarReminderParams>>, step: WorkflowStep) {
        const {
            webinarId,
            webinarTitle,
            webinarStartAt,
            webinarTimezone,
            joinUrl,
            calendarUrl,
        } = event.payload;

        console.log('[WebinarReminder] Workflow started for webinar:', webinarId);
        console.log('[WebinarReminder] Start time:', webinarStartAt);

        const startTime = new Date(webinarStartAt).getTime();
        const now = Date.now();

        // Calculate reminder times
        const twoDaysBefore = startTime - 2 * 24 * 60 * 60 * 1000;
        const oneDayBefore = startTime - 1 * 24 * 60 * 60 * 1000;
        const eightHoursBefore = startTime - 8 * 60 * 60 * 1000;

        const formattedStartAt = formatWebinarDateTime(webinarStartAt, webinarTimezone);

        // Helper to send reminders to all registrants
        const sendReminders = async (eventName: string, stepName: string) => {
            await step.do(stepName, async () => {
                initDatabase(this.env.DATABASE_URL);
                const loops = createLoopsClient(this.env.LOOPS_API_KEY);

                const registrations = await getWebinarRegistrations(webinarId);
                console.log(`[WebinarReminder] Sending ${eventName} to ${registrations.length} registrants`);

                for (const reg of registrations) {
                    try {
                        await loops.sendEvent({
                            email: reg.email,
                            eventName,
                            contactProperties: {
                                firstName: reg.name.split(' ')[0],
                            },
                            eventProperties: {
                                webinarId,
                                webinarTitle,
                                webinarStartAt: formattedStartAt,
                                webinarTimezone,
                                joinUrl,
                                calendarUrl,
                            },
                        });
                        console.log(`[WebinarReminder] Sent ${eventName} to ${reg.email}`);
                    } catch (error) {
                        console.error(`[WebinarReminder] Failed to send ${eventName} to ${reg.email}:`, error);
                    }
                }

                return { sent: registrations.length };
            });
        };

        // Step 1: Wait until 2 days before, then send reminder
        if (twoDaysBefore > now) {
            console.log('[WebinarReminder] Sleeping until 2 days before:', new Date(twoDaysBefore).toISOString());
            await step.sleepUntil('wait-2-days-before', new Date(twoDaysBefore));
            await sendReminders('webinar_reminder_2d', 'send-2-day-reminders');
        } else {
            console.log('[WebinarReminder] Skipping 2-day reminder (already passed)');
        }

        // Step 2: Wait until 1 day before, then send reminder
        if (oneDayBefore > now) {
            console.log('[WebinarReminder] Sleeping until 1 day before:', new Date(oneDayBefore).toISOString());
            await step.sleepUntil('wait-1-day-before', new Date(oneDayBefore));
            await sendReminders('webinar_reminder_1d', 'send-1-day-reminders');
        } else {
            console.log('[WebinarReminder] Skipping 1-day reminder (already passed)');
        }

        // Step 3: Wait until 8 hours before, then send reminder
        if (eightHoursBefore > now) {
            console.log('[WebinarReminder] Sleeping until 8 hours before:', new Date(eightHoursBefore).toISOString());
            await step.sleepUntil('wait-8-hours-before', new Date(eightHoursBefore));
            await sendReminders('webinar_reminder_8h', 'send-8-hour-reminders');
        } else {
            console.log('[WebinarReminder] Skipping 8-hour reminder (already passed)');
        }

        console.log('[WebinarReminder] Workflow completed for webinar:', webinarId);
    }
}
