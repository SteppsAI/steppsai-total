import { z } from "zod";

// Webinar configuration (can be stored in DB or as config)
export const webinarConfigSchema = z.object({
    webinarId: z.string(),
    title: z.string(),
    startAt: z.string().datetime(), // ISO 8601 UTC
    timezone: z.string().default("Europe/Amsterdam"),
    durationMinutes: z.number().default(60),
    joinUrl: z.string().url(),
    description: z.string().optional(),
});

export type WebinarConfig = z.infer<typeof webinarConfigSchema>;

// Registration input from frontend
export const webinarRegistrationInputSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    name: z.string().min(1, { message: "Please enter your name" }),
    webinarId: z.string().optional(), // Optional if single webinar
});

export type WebinarRegistrationInput = z.infer<typeof webinarRegistrationInputSchema>;

// Waitlist registration input
export const waitlistRegistrationInputSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    name: z.string().min(1, { message: "Please enter your name" }),
});

export type WaitlistRegistrationInput = z.infer<typeof waitlistRegistrationInputSchema>;

// Registration stored in DB
export const webinarRegistrationSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    webinarId: z.string(),
    registeredAt: z.string().datetime(),
    source: z.string().optional(),
    utmSource: z.string().optional(),
    utmCampaign: z.string().optional(),
});

export type WebinarRegistration = z.infer<typeof webinarRegistrationSchema>;

// Loops event properties for webinar registration
export const loopsWebinarEventSchema = z.object({
    email: z.string().email(),
    firstName: z.string(),
    webinarId: z.string(),
    webinarTitle: z.string(),
    webinarStartAt: z.string(), // Formatted for display
    webinarTimezone: z.string(),
    joinUrl: z.string(),
    calendarUrl: z.string(),
});

export type LoopsWebinarEvent = z.infer<typeof loopsWebinarEventSchema>;

// Loops event properties for waitlist
export const loopsWaitlistEventSchema = z.object({
    email: z.string().email(),
    firstName: z.string(),
    source: z.string().optional(),
});

export type LoopsWaitlistEvent = z.infer<typeof loopsWaitlistEventSchema>;

// Workflow params for webinar reminders
export const webinarReminderParamsSchema = z.object({
    webinarId: z.string(),
    webinarTitle: z.string(),
    webinarStartAt: z.string().datetime(),
    webinarTimezone: z.string(),
    joinUrl: z.string(),
    calendarUrl: z.string(),
});

export type WebinarReminderParams = z.infer<typeof webinarReminderParamsSchema>;

// Registration response
export const registrationResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    isExisting: z.boolean().optional(),
});

export type RegistrationResponse = z.infer<typeof registrationResponseSchema>;
