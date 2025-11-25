import { createFileRoute } from "@tanstack/react-router";
import { RecentStepps } from "@/components/dashboard/recent-stepps";
import { TutorialsSection } from "@/components/dashboard/tutorials-section";
import { FeedbackSection } from "@/components/dashboard/feedback-section";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex flex-col gap-12 w-full max-w-[1400px] mx-auto pb-8">
      {/* Recents Section */}
      <RecentStepps />

      {/* Tutorials Section - Full Width */}
      <TutorialsSection />

      {/* Feedback Section - Compact Bottom */}
      <FeedbackSection />
    </div>
  );
}
