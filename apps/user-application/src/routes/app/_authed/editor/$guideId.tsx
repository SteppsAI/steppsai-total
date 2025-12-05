import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
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
import { useDeleteStep } from "@/hooks/use-api";
import { Step, Overlay, Guide } from "@/types/db";
import { useEditorSession } from "@/hooks/use-editor-session";

export const Route = createFileRoute("/app/_authed/editor/$guideId")({
  component: EditorPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.guides.getById.queryOptions({ id: params.guideId })
    );
  },
});

function EditorPage() {
  const { guideId } = Route.useParams();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (isMobile) {
      toast.error("Editing is only available on desktop devices.");
      navigate({ to: "/app" });
    }
  }, [isMobile, navigate]);

  // Use editor session hook for DO-backed state management
  const session = useEditorSession(guideId, fetchedGuide as Guide | null);

  // Local UI state
  const [activeStepId, setActiveStepId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<EditorTool>("pointer");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Set initial active step when guide loads
  useEffect(() => {
    if (session.guide?.steps && session.guide.steps.length > 0 && !activeStepId) {
      const sorted = [...session.guide.steps].sort((a, b) =>
        (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      );
      // Find first step with an image, or fall back to first step
      const firstStepWithImage = sorted.find(step => step.imageKey);
      setActiveStepId(firstStepWithImage?.id || sorted[0].id);
    }
  }, [session.guide?.steps, activeStepId]);

  // Auto-skip to next step with image if current step has no image
  useEffect(() => {
    if (!session.guide?.steps || !activeStepId) return;

    const currentStep = session.guide.steps.find(s => s.id === activeStepId);
    if (!currentStep || currentStep.imageKey) return; // Current step has image, no need to skip

    // Find next step with an image
    const sorted = [...session.guide.steps].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
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
  }, [activeStepId, session.guide?.steps]);

  // Handle title change - syncs to DO
  const handleTitleChange = useCallback((newTitle: string) => {
    session.updateTitle(newTitle);
  }, [session]);

  // Handle step caption update - syncs to DO
  const handleUpdateStep = useCallback((id: string, stepTitle: string) => {
    session.updateStep(id, { caption: stepTitle });
  }, [session]);

  // Handle annotations change - syncs to DO
  const handleAnnotationsChange = useCallback((annotations: Overlay[]) => {
    if (!activeStepId) return;
    session.updateStep(activeStepId, { overlays: annotations });
  }, [activeStepId, session]);

  // Delete step mutation (via Hono API to RPC for atomic R2 + DB delete)
  const deleteStepMutation = useDeleteStep();

  const handleDeleteStep = useCallback(async (id: string) => {
    if (!session.guide?.steps) return;

    const stepToDelete = session.guide.steps.find((s) => s.id === id);

    // Calculate updated steps BEFORE any state changes
    const updatedSteps = session.guide.steps.filter((step) => step.id !== id);
    const reindexedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));

    // Optimistic update via session
    session.updateSteps(reindexedSteps);

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
      session.updateSteps(session.guide.steps);
      console.error(error);
    }
  }, [session, deleteStepMutation, activeStepId, guideId]);

  // Handle step reorder - syncs to DO
  const handleReorderSteps = useCallback((steps: Step[]) => {
    const reindexed = steps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));
    session.updateSteps(reindexed);
  }, [session]);

  // Handle add step - syncs to DO
  const handleAddStep = useCallback((stepData: { title: string; file: File; previewUrl: string }) => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      caption: stepData.title,
      imageKey: stepData.previewUrl,
      orderIndex: (session.guide?.steps?.length || 0),
      overlays: [],
      pageUrl: "",
      domSelector: "",
    };

    const updatedSteps = [...(session.guide?.steps || []), newStep];
    session.updateSteps(updatedSteps);
    setActiveStepId(newStep.id);
  }, [session]);

  // Handle save - persists to database
  const handleSave = useCallback(async () => {
    try {
      await session.save();
      toast.success("Changes saved", { duration: 2000 });
      // Invalidate guides query to refresh list
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
    } catch (error) {
      toast.error("Failed to save changes");
    }
  }, [session, queryClient]);

  // Loading state
  if (session.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  if (!session.guide) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

  // Sort steps by orderIndex
  const sortedSteps = [...(session.guide.steps || [])].sort((a, b) =>
    (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  // Get the current active step
  const currentStep = sortedSteps.find((step) => step.id === activeStepId) || sortedSteps[0];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <EditorHeader
        title={session.guide.title || "Untitled Stepps"}
        isDirty={session.isDirty}
        isSyncing={session.isSyncing}
        isSaving={session.isSaving}
        lastSaved={session.lastSaved}
        error={session.error}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
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
        guideTitle={session.guide.title || "Untitled Stepps"}
        guideId={guideId}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        guideTitle={session.guide.title || "Untitled Stepps"}
        guideId={guideId}
      />
    </div>
  );
}
