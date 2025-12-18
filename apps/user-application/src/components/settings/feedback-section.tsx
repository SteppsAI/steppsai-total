import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/router";

const feedbackSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    type: z.enum(["bug", "feature", "general"], {
        required_error: "Please select a feedback type",
    }),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export function FeedbackSection() {
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

    const {
        register,
        handleSubmit: handleFeedbackSubmit,
        control,
        formState: { errors },
        reset: resetFeedback,
    } = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            subject: "",
            message: "",
        },
    });

    const feedbackMutation = useMutation({
        ...trpc.notifications.sendFeedback.mutationOptions(),
        onSuccess: () => {
            toast.success("Feedback sent successfully! We appreciate your input.");
            resetFeedback();
        },
        onError: (error) => {
            toast.error("Failed to send feedback. Please try again.");
            console.error(error);
        },
    });

    async function onFeedbackSubmit(data: FeedbackFormValues) {
        setFeedbackSubmitting(true);
        try {
            await feedbackMutation.mutateAsync(data);
        } finally {
            setFeedbackSubmitting(false);
        }
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-medium">Feedback</h2>
                <p className="text-sm text-muted-foreground">
                    Help us improve your experience.
                </p>
            </div>
            <Separator />

            <form onSubmit={handleFeedbackSubmit(onFeedbackSubmit)} className="space-y-4 md:space-y-6 max-w-2xl">
                <div className="space-y-2">
                    <Label htmlFor="feedback-type">
                        I want to...
                    </Label>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <SelectTrigger
                                    id="feedback-type"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bug">Report a bug</SelectItem>
                                    <SelectItem value="feature">Request a feature</SelectItem>
                                    <SelectItem value="general">Share general feedback</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.type && (
                        <p className="text-sm font-medium text-destructive">{errors.type.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="feedback-subject">
                        Subject
                    </Label>
                    <Input
                        id="feedback-subject"
                        placeholder="Summarize your feedback"
                        {...register("subject")}
                    />
                    {errors.subject && (
                        <p className="text-sm font-medium text-destructive">{errors.subject.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="feedback-message">
                        Message
                    </Label>
                    <Textarea
                        id="feedback-message"
                        placeholder="Tell us more details..."
                        className="min-h-[120px]"
                        {...register("message")}
                    />
                    {errors.message && (
                        <p className="text-sm font-medium text-destructive">{errors.message.message}</p>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={feedbackSubmitting}>
                        {feedbackSubmitting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                Submit Feedback
                                <Send className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
