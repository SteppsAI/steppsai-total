import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { Canvas } from "@/components/editor/canvas";
import { StepSidebar } from "@/components/editor/step-sidebar";
import { useState, useCallback, useEffect } from "react";
import { Annotation } from "@/components/editor/annotation-types";
import { useStepp } from "@/hooks/use-stepps";
import { ShareDialog } from "@/components/share-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_authed/editor/$guideId")({
  component: EditorPage,
});

function EditorPage() {
  const { guideId } = Route.useParams();
  const { data: fetchedGuide, isLoading, error } = useStepp(guideId);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) {
      toast.error("Editing is only available on desktop devices.");
      navigate({ to: "/app" });
    }
  }, [isMobile, navigate]);

  // Local state for editor (synced with fetched data initially)
  const [guide, setGuide] = useState<any | null>(null); // Using any for now to avoid strict type mismatch with mock data structure vs DB
  const [title, setTitle] = useState("Untitled Stepps");
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [activeStepId, setActiveStepId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<"pointer" | "arrow" | "highlight" | "hide">("pointer");
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Sync fetched guide to local state
  useEffect(() => {
    if (fetchedGuide) {
      setGuide(fetchedGuide);
      setTitle(fetchedGuide.title || "Untitled Stepps");
    }
  }, [fetchedGuide]);

  const handleUpdateStep = useCallback((id: string, title: string) => {
    setGuide((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map((step: any) =>
          step.id === id
            ? { ...step, title }
            : step
        )
      };
    });

    setStatus("saving");
    // Simulate save
    setTimeout(() => setStatus("saved"), 1000);
  }, []);

  const handleAnnotationsChange = useCallback((annotations: Annotation[]) => {
    if (!activeStepId) return;

    setGuide((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map((step: any) =>
          step.id === activeStepId
            ? { ...step, overlays: annotations }
            : step
        )
      };
    });

    setStatus("saving");
    setTimeout(() => setStatus("saved"), 1000);
  }, [activeStepId]);

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

  if (error || !guide) {
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
        onShare={() => setIsShareOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        <Canvas
          screenshotUrl={currentStep?.screenshotUrl || undefined}
          overlays={currentStep?.overlays as Annotation[] || []}
          activeTool={activeTool}
          onAnnotationsChange={handleAnnotationsChange}
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

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        guideTitle={title}
        guideId={guideId}
      />
    </div>
  );
}
