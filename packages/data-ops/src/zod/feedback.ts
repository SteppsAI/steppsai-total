import { z } from "zod";

export const feedbackSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    type: z.enum(["bug", "feature", "general"], {
        required_error: "Please select a feedback type",
    }),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
