import { createFileRoute } from "@tanstack/react-router";
import { RecentStepps } from "@/components/dashboard/recent-stepps";
import { TemplatesSection } from "@/components/dashboard/templates-section";
import { EmbedSteppsSection } from "@/components/dashboard/embed-stepps-section";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8 h-full">
      {/* Recents Section */}
      <RecentStepps />

      {/* Bottom Section: Templates & Embeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Templates */}
        <TemplatesSection />

        {/* Embed Stepps */}
        <EmbedSteppsSection />
      </div>
    </div>
  );
}
