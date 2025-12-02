import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar, EditorTool } from "@/components/editor/editor-toolbar";
import { Canvas } from "@/components/editor/canvas";
import { StepSidebar } from "@/components/editor/step-sidebar";
import { useState, useCallback, useEffect } from "react";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { trpc } from "@/router";
import { Step, Overlay, Guide } from "@/types/db";

export const Route = createFileRoute("/app/_authed/editor/$guideId")({
  component: EditorPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.guides.getById.queryOptions({ id: params.guideId })
    );
  },
});

interface LocalGuide extends Omit<Guide, 'steps'> {
  steps?: Step[];
}

function EditorPage() {
  const { guideId } = Route.useParams();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const { data: fetchedGuide, refetch } = useSuspenseQuery(trpc.guides.getById.queryOptions({ id: guideId }));

  // Poll for data if guide is still processing (queue hasn't finished yet)
  useEffect(() => {
    if (fetchedGuide?.status === 'processing' || fetchedGuide?.status === 'recording') {
      const interval = setInterval(() => {
        refetch();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [fetchedGuide?.status, refetch]);

  // Mutation temporarily disabled - will be replaced with Durable Objects
  // const updateGuideMutation = useMutation({
  //   ...trpc.guides.update.mutationOptions(),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
  //   },
  // });

  useEffect(() => {
    if (isMobile) {
      toast.error("Editing is only available on desktop devices.");
      navigate({ to: "/app" });
    }
  }, [isMobile, navigate]);

  // Local state for editor (synced with fetched data initially)
  const [guide, setGuide] = useState<LocalGuide | null>(null);
  const [title, setTitle] = useState("Untitled Stepps");
  const [activeStepId, setActiveStepId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<EditorTool>("pointer");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync fetched guide to local state and set initial active step
  useEffect(() => {
    if (fetchedGuide) {
      // Cast to LocalGuide - overlays might have different format from backend
      const localGuide = fetchedGuide as unknown as LocalGuide;
      setGuide(localGuide);
      setTitle(fetchedGuide.title || "Untitled Stepps");

      // Set initial active step if not set - prioritize steps with images
      if (!activeStepId && localGuide.steps && localGuide.steps.length > 0) {
        const sorted = [...localGuide.steps].sort((a, b) =>
          (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );
        // Find first step with an image, or fall back to first step
        const firstStepWithImage = sorted.find(step => step.imageKey);
        setActiveStepId(firstStepWithImage?.id || sorted[0].id);
      }
    }
  }, [fetchedGuide, activeStepId]);

  // Auto-skip to next step with image if current step has no image
  useEffect(() => {
    if (!guide?.steps || !activeStepId) return;

    const currentStep = guide.steps.find(s => s.id === activeStepId);
    if (!currentStep || currentStep.imageKey) return; // Current step has image, no need to skip

    // Find next step with an image
    const sorted = [...guide.steps].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    const currentIndex = sorted.findIndex(s => s.id === activeStepId);

    // Look for next step with image (circular search)
    let foundStepWithImage = null;
    for (let i = 1; i < sorted.length; i++) {
      const nextIndex = (currentIndex + i) % sorted.length;
      if (sorted[nextIndex].imageKey) {
        foundStepWithImage = sorted[nextIndex];
        break;
      }
    }

    if (foundStepWithImage) {
      setActiveStepId(foundStepWithImage.id);
    }
  }, [activeStepId, guide?.steps]);

  // Save function removed - will be replaced with Durable Objects architecture
  // All changes are now local-only until explicitly saved

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    // Auto-save disabled - title changes are local only
  }, []);

  const handleUpdateStep = useCallback((id: string, stepTitle: string) => {
    setGuide((prev) => {
      if (!prev || !prev.steps) return prev;
      const updatedSteps = prev.steps.map((step) =>
        step.id === id ? { ...step, caption: stepTitle } : step
      );
      // Auto-save disabled - step updates are local only
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const handleAnnotationsChange = useCallback((annotations: Overlay[]) => {
    if (!activeStepId) return;

    setGuide((prev) => {
      if (!prev || !prev.steps) return prev;
      const updatedSteps = prev.steps.map((step) =>
        step.id === activeStepId ? { ...step, overlays: annotations } : step
      );
      // Auto-save disabled - annotations are local only
      return { ...prev, steps: updatedSteps };
    });
  }, [activeStepId]);

  const deleteStepMutation = useMutation(trpc.guides.deleteStep.mutationOptions());

  const handleDeleteStep = useCallback(async (id: string) => {
    if (!guide?.steps) return;

    const stepToDelete = guide.steps.find((s) => s.id === id);

    // Calculate updated steps BEFORE any state changes
    const updatedSteps = guide.steps.filter((step) => step.id !== id);
    const reindexedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));

    // Optimistic update
    setGuide((prev) => prev ? { ...prev, steps: reindexedSteps } : prev);

    try {
      // Call atomic deletion endpoint (R2 + DB)
      await deleteStepMutation.mutateAsync({
        guideId: guideId,
        stepId: id,
        imageKey: stepToDelete?.imageKey || undefined,
      });

      toast.success("Step deleted", { duration: 1500 });

      // Update active step if we deleted the current one
      if (activeStepId === id && reindexedSteps.length > 0) {
        setActiveStepId(reindexedSteps[0].id);
      }
    } catch (error) {
      toast.error("Failed to delete step");
      // Revert optimistic update
      setGuide((prev) => prev ? { ...prev, steps: guide.steps } : prev);
      console.error(error);
    }
  }, [guide?.steps, deleteStepMutation, activeStepId, guideId]);

  const handleReorderSteps = useCallback((steps: Step[]) => {
    const reindexed = steps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));
    setGuide((prev) => prev ? { ...prev, steps: reindexed } : prev);
    // Auto-save disabled - reordering is local only
  }, []);

  const handleAddStep = useCallback((stepData: { title: string; file: File; previewUrl: string }) => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      caption: stepData.title,
      imageKey: stepData.previewUrl,
      orderIndex: (guide?.steps?.length || 0),
      overlays: [],
      pageUrl: "",
      domSelector: "",
    };

    setGuide((prev) => {
      if (!prev) return prev;
      const updatedSteps = [...(prev.steps || []), newStep];
      // Auto-save disabled - new steps are local only
      return { ...prev, steps: updatedSteps };
    });

    setActiveStepId(newStep.id);
  }, [guide?.steps?.length]);

  if (!guide) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

  // Sort steps by orderIndex
  const sortedSteps = [...(guide.steps || [])].sort((a, b) =>
    (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  // Get the current active step
  const currentStep = sortedSteps.find((step) => step.id === activeStepId) || sortedSteps[0];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <EditorHeader
        title={title}
        onTitleChange={handleTitleChange}
        onShare={() => setIsShareOpen(true)}
        onExport={() => setIsExportOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        <Canvas
          screenshotUrl={currentStep?.imageKey || undefined}
          overlays={(currentStep?.overlays as Overlay[]) || []}
          activeTool={activeTool}
          onAnnotationsChange={handleAnnotationsChange}
          onDeleteStep={() => currentStep && handleDeleteStep(currentStep.id)}
          currentStepId={currentStep?.id}
        />

        <StepSidebar
          steps={sortedSteps}
          activeStepId={activeStepId}
          onStepSelect={setActiveStepId}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
          onReorderSteps={handleReorderSteps}
          onAddStep={handleAddStep}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        guideTitle={title}
        guideId={guideId}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        guideTitle={title}
        guideId={guideId}
      />
    </div>
  );
}
