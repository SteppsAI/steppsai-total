import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/app/_authed/feedback")({
  component: FeedbackPage,
});

const feedbackSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  type: z.enum(["bug", "feature", "general"], {
    required_error: "Please select a feedback type",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: FeedbackFormValues) {
    setIsSubmitting(true);
    
    // TODO: Implement API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Feedback submitted:", data);
    
    toast.success("Feedback sent successfully! We appreciate your input.");
    reset();
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Help us improve your experience.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-6 pb-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-base font-medium text-muted-foreground">
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
                  id="type" 
                  className="w-full border-0 border-b rounded-none shadow-none focus:ring-0 px-0 h-10 text-lg font-medium bg-transparent hover:bg-transparent data-[placeholder]:text-muted-foreground/50"
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
          <Label htmlFor="subject" className="text-base font-medium text-muted-foreground">
            Regarding...
          </Label>
          <Input 
            id="subject" 
            placeholder="Summarize your feedback" 
            className="border-0 border-b rounded-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-lg h-10 placeholder:text-muted-foreground/50"
            {...register("subject")} 
          />
          {errors.subject && (
            <p className="text-sm font-medium text-destructive">{errors.subject.message}</p>
          )}
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          <Label htmlFor="message" className="text-base font-medium text-muted-foreground">
            The details...
          </Label>
          <Textarea 
            id="message"
            placeholder="Tell us more about what you're thinking..." 
            className="flex-1 resize-none border-0 border-b rounded-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-base leading-relaxed placeholder:text-muted-foreground/50 p-0"
            {...register("message")} 
          />
          {errors.message && (
            <p className="text-sm font-medium text-destructive">{errors.message.message}</p>
          )}
        </div>
        
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
            {isSubmitting ? (
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
