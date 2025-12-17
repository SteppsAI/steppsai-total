/**
 * Google Calendar Link Generator
 *
 * Generates "Add to Calendar" links for Google Calendar
 * Format: https://calendar.google.com/calendar/render?action=TEMPLATE&...
 */

export interface CalendarEventParams {
    title: string;
    startAt: string; // ISO 8601 UTC datetime
    durationMinutes: number;
    description?: string;
    location?: string; // Can be the join URL
    timezone?: string;
}

/**
 * Format date for Google Calendar URL
 * Format: YYYYMMDDTHHmmssZ (UTC)
 */
function formatDateForGoogleCalendar(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Calculate end time from start time and duration
 */
function calculateEndTime(startAt: string, durationMinutes: number): string {
    const start = new Date(startAt);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return end.toISOString();
}

/**
 * Generate a Google Calendar link
 *
 * @example
 * const link = generateGoogleCalendarLink({
 *   title: "Stepps.ai Live Demo",
 *   startAt: "2025-01-20T14:00:00Z",
 *   durationMinutes: 60,
 *   description: "Join us for a live demo of Stepps.ai",
 *   location: "https://meet.google.com/abc-defg-hij"
 * });
 */
export function generateGoogleCalendarLink(params: CalendarEventParams): string {
    const {
        title,
        startAt,
        durationMinutes,
        description = '',
        location = '',
        timezone,
    } = params;

    const endAt = calculateEndTime(startAt, durationMinutes);

    const startFormatted = formatDateForGoogleCalendar(startAt);
    const endFormatted = formatDateForGoogleCalendar(endAt);

    // Build the Google Calendar URL
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const queryParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startFormatted}/${endFormatted}`,
    });

    if (description) {
        queryParams.set('details', description);
    }

    if (location) {
        queryParams.set('location', location);
    }

    if (timezone) {
        queryParams.set('ctz', timezone);
    }

    return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Generate calendar link with webinar-specific defaults
 */
export function generateWebinarCalendarLink(params: {
    title: string;
    startAt: string;
    durationMinutes?: number;
    joinUrl?: string;
    timezone?: string;
}): string {
    const hasJoinUrl = params.joinUrl && params.joinUrl.length > 0;
    const joinUrlText = hasJoinUrl
        ? `Join URL: ${params.joinUrl}`
        : 'Join link will be sent before the webinar';

    const description = `Join the Stepps.ai webinar!\n\n${joinUrlText}\n\nWe'll show you how to turn any web workflow into professional documentation in minutes.`;

    return generateGoogleCalendarLink({
        title: params.title,
        startAt: params.startAt,
        durationMinutes: params.durationMinutes || 60,
        description,
        location: hasJoinUrl ? params.joinUrl : undefined,
        timezone: params.timezone || 'Europe/Amsterdam',
    });
}

/**
 * Format a datetime for display in emails
 * Example: "Tuesday, January 21, 2025 at 3:00 PM CET"
 */
export function formatWebinarDateTime(
    isoDate: string,
    timezone: string = 'Europe/Amsterdam'
): string {
    const date = new Date(isoDate);

    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: timezone,
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone,
        timeZoneName: 'short',
    };
    
    const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
    
    return `${formattedDate}, ${formattedTime}`;
}
