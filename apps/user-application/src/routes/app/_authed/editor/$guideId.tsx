import { createFileRoute } from "@tanstack/react-router";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { Canvas } from "@/components/editor/canvas";
import { StepSidebar } from "@/components/editor/step-sidebar";
import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { trpc } from "@/router";

export const Route = createFileRoute("/app/_authed/editor/$guideId")({
  component: EditorPage,
});

// Mock data for development
const MOCK_GUIDE = {
  id: "test-guide-1",
  title: "How to Create a New Project",
  updatedAt: new Date().toISOString(),
  steps: [
    {
      id: "step-1",
      title: "Click on 'Create New'",
      orderIndex: 0,
      screenshotUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
      finalCaption: "Start by clicking the 'Create New' button in the top right corner.",
      overlays: [
        {
          type: "arrow",
          from: [20, 20],
          to: [40, 40]
        }
      ]
    },
    {
      id: "step-2",
      title: "Select Project Type",
      orderIndex: 1,
      screenshotUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1974&auto=format&fit=crop",
      finalCaption: "Choose 'Web Application' from the dropdown menu.",
      overlays: []
    },
    {
      id: "step-3",
      title: "Configure Settings",
      orderIndex: 2,
      screenshotUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?q=80&w=1974&auto=format&fit=crop",
      finalCaption: "Fill in the project details and click 'Next'.",
      overlays: []
    }
  ]
};

function EditorPage() {
  // const { guideId } = Route.useParams();
  // const { data: guide, isLoading } = useQuery(trpc.guides.getById.queryOptions({ id: guideId }));

  // Use mock data instead of real data for now
  const guide = MOCK_GUIDE;
  const isLoading = false;

  const [title, setTitle] = useState(guide.title || "Untitled Stepps");
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [activeStepId, setActiveStepId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<"pointer" | "arrow" | "highlight" | "blur">("pointer");

  const handleUpdateStep = (id: string, caption: string) => {
    console.log("Update step:", id, caption);
    setStatus("saving");
    // Simulate save
    setTimeout(() => setStatus("saved"), 1000);
  };

  const handleAddOverlay = (overlay: any) => {
    console.log("Add overlay:", overlay);
    // In a real app, we would update the step's overlays here
    // For now, we'll just log it
    setStatus("saving");
    setTimeout(() => setStatus("saved"), 1000);
  };

  const handleDeleteStep = (id: string) => {
    console.log("Delete step:", id);
  };

  const handleReorderSteps = (steps: any[]) => {
    console.log("Reorder steps:", steps);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

  // Sort steps by orderIndex
  const sortedSteps = guide.steps?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];

  // Set initial active step if not set
  if (!activeStepId && sortedSteps.length > 0) {
    setActiveStepId(sortedSteps[0].id);
  }

  // Get the current active step
  const currentStep = sortedSteps.find((step: any) => step.id === activeStepId) || sortedSteps[0];

  // Update title from guide if not already set
  if (guide.title && title === "Untitled Stepps") {
    setTitle(guide.title);
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <EditorHeader
        title={title}
        status={status}
        onTitleChange={(newTitle: string) => {
          setTitle(newTitle);
          setStatus("saving");
          setTimeout(() => setStatus("saved"), 1000);
        }}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        <Canvas
          screenshotUrl={currentStep?.screenshotUrl || undefined}
          overlays={currentStep?.overlays as any || []}
          activeTool={activeTool}
          onAddOverlay={handleAddOverlay}
        />

        <StepSidebar
          steps={sortedSteps}
          activeStepId={activeStepId}
          onStepSelect={setActiveStepId}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onReorderSteps={handleReorderSteps}
        />
      </div>
    </div>
  );
}