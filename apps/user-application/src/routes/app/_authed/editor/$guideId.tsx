import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
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
  const queryClient = useQueryClient();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const { data: fetchedGuide } = useSuspenseQuery(trpc.guides.getById.queryOptions({ id: guideId }));

  const updateGuideMutation = useMutation({
    ...trpc.guides.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.guides.getById.queryOptions({ id: guideId }).queryKey });
    },
  });

  useEffect(() => {
    if (isMobile) {
      toast.error("Editing is only available on desktop devices.");
      navigate({ to: "/app" });
    }
  }, [isMobile, navigate]);

  // Local state for editor (synced with fetched data initially)
  const [guide, setGuide] = useState<LocalGuide | null>(null);
  const [title, setTitle] = useState("Untitled Stepps");
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [activeStepId, setActiveStepId] = useState<string>("");
  const [activeTool, setActiveTool] = useState<"pointer" | "arrow" | "highlight" | "hide">("pointer");
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
      
      // Set initial active step if not set
      if (!activeStepId && localGuide.steps && localGuide.steps.length > 0) {
        const sorted = [...localGuide.steps].sort((a, b) => 
          (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );
        setActiveStepId(sorted[0].id);
      }
    }
  }, [fetchedGuide, activeStepId]);

  const saveGuide = useCallback(async (updates: { title?: string; steps?: Step[] }) => {
    if (!guide) return;
    
    setStatus("saving");
    try {
      await updateGuideMutation.mutateAsync({
        id: guideId,
        data: updates as any, // Backend accepts the Step[] format
      });
      setStatus("saved");
    } catch (error) {
      setStatus("unsaved");
      toast.error("Failed to save changes");
    }
  }, [guide, guideId, updateGuideMutation]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    saveGuide({ title: newTitle });
  }, [saveGuide]);

  const handleUpdateStep = useCallback((id: string, stepTitle: string) => {
    setGuide((prev) => {
      if (!prev || !prev.steps) return prev;
      const updatedSteps = prev.steps.map((step) =>
        step.id === id ? { ...step, caption: stepTitle } : step
      );
      saveGuide({ steps: updatedSteps });
      return { ...prev, steps: updatedSteps };
    });
  }, [saveGuide]);

  const handleAnnotationsChange = useCallback((annotations: Overlay[]) => {
    if (!activeStepId) return;

    setGuide((prev) => {
      if (!prev || !prev.steps) return prev;
      const updatedSteps = prev.steps.map((step) =>
        step.id === activeStepId ? { ...step, overlays: annotations } : step
      );
      saveGuide({ steps: updatedSteps });
      return { ...prev, steps: updatedSteps };
    });
  }, [activeStepId, saveGuide]);

  const handleDeleteStep = useCallback((id: string) => {
    setGuide((prev) => {
      if (!prev || !prev.steps) return prev;
      const updatedSteps = prev.steps.filter((step) => step.id !== id);
      const reindexed = updatedSteps.map((step, idx) => ({
        ...step,
        orderIndex: idx,
      }));
      saveGuide({ steps: reindexed });
      return { ...prev, steps: reindexed };
    });
  }, [saveGuide]);

  const handleReorderSteps = useCallback((steps: Step[]) => {
    const reindexed = steps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));
    setGuide((prev) => prev ? { ...prev, steps: reindexed } : prev);
    saveGuide({ steps: reindexed });
  }, [saveGuide]);

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
      saveGuide({ steps: updatedSteps });
      return { ...prev, steps: updatedSteps };
    });

    setActiveStepId(newStep.id);
  }, [guide?.steps?.length, saveGuide]);

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
        status={status}
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
