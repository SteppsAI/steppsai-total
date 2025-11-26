import { createFileRoute } from "@tanstack/react-router";
import { RecentStepps } from "@/components/dashboard/recent-stepps";
import { TutorialsSection } from "@/components/dashboard/tutorials-section";
import { FoldersSection } from "@/components/dashboard/folders-section";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8">

      {/* Recents Section */}
      <RecentStepps />

      {/* Folders Section */}
      <FoldersSection />

      {/* Tutorials Section - Full Width */}
      <TutorialsSection />
    </div>
  );
}
