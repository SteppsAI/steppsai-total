import { createFileRoute } from "@tanstack/react-router";
import { StepEditor } from "@/components/editor/step-editor";
import { Canvas } from "@/components/editor/canvas";
import { Button } from "@/components/ui/button";
import { Save, Share } from "lucide-react";

export const Route = createFileRoute("/app/_authed/editor/$guideId")({
  component: EditorPage,
});

import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/router";

// ...

function EditorPage() {
  const { guideId } = Route.useParams();
  const { data: guide, isLoading } = useQuery(trpc.guides.getById.queryOptions({ id: guideId }));

  const handleUpdateStep = (id: string, caption: string) => {
    console.log("Update step:", id, caption);
  };

  const handleDeleteStep = (id: string) => {
    console.log("Delete step:", id);
  };

  const handleSave = () => {
    console.log("Save guide");
  };

  const handleShare = () => {
    console.log("Share guide");
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!guide) {
    return <div className="h-screen flex items-center justify-center">Guide not found</div>;
  }

  // Sort steps by orderIndex
  const sortedSteps = guide.steps?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];
  const currentStep = sortedSteps[0]; // For now just show first step or handle selection state

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <StepEditor
          steps={sortedSteps}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
        />
        <Canvas
          screenshotUrl={currentStep?.screenshotUrl || undefined}
          overlays={currentStep?.overlays as any || []}
        />
      </div>

      <div className="border-t bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {sortedSteps.length} steps • Last edited {new Date(guide.updatedAt || "").toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}