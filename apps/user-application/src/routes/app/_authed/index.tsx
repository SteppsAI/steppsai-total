import { createFileRoute } from "@tanstack/react-router";
import { RecentStepps } from "@/components/dashboard/recent-stepps";
import { TutorialsSection } from "@/components/dashboard/tutorials-section";
import { FoldersSection } from "@/components/dashboard/folders-section";
import { useState, useEffect } from "react";
import { Guide, Folder } from "@/types/db";
import { TEST_RECENT_GUIDES, TEST_FOLDERS } from "@/types/test-data";

export const Route = createFileRoute("/app/_authed/")({
  component: Dashboard,
});

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentStepps, setRecentStepps] = useState<Guide[]>([]);
  const [folders, setFolders] = useState<(Folder & { guide_count?: number })[]>([]);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Use test data
      setRecentStepps(TEST_RECENT_GUIDES);
      setFolders(TEST_FOLDERS);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-8">

      {/* Recents Section */}
      <RecentStepps isLoading={isLoading} stepps={recentStepps} />

      {/* Folders Section */}
      <FoldersSection isLoading={isLoading} folders={folders} />

      {/* Tutorials Section - Full Width */}
      <TutorialsSection />
    </div>
  );
}
