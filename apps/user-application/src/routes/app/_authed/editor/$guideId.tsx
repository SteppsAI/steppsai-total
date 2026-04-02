import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorToolbar, EditorTool } from "@/components/editor/editor-toolbar";
import { Canvas } from "@/components/editor/canvas";
import { StepSidebar, SidebarWidth } from "@/components/editor/step-sidebar";
import { ImportExistingStepsDialog } from "@/components/editor/import-existing-steps-dialog";
import { DocsGenerationWizard } from "@/components/docs/docs-generation-wizard";
import { useState, useCallback, useEffect } from "react";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog } from "@/components/export-dialog";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { trpc } from "@/router";
import { useDeleteStep, useUploadImage, useUpdateGuide } from "@/hooks/use-api";
import { Step, Overlay, Guide } from "@/types/db";
import { useEditorSession } from "@/hooks/use-editor-session";
import type { GuideDocsGenerationInput } from "@repo/data-ops/zod-schema";

export const Route = createFileRoute("/app/_authed/editor/$guideId")({
  component: EditorPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.guides.getById.queryOptions({ id: params.guideId })
    );
  },
});

function mimeTypeToExtension(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/png":
    default:
      return "png";
  }
}

function buildImportedImageUrl(sourceImageUrl: string, newKey: string): string {
  try {
    const sourceUrl = new URL(sourceImageUrl);
    const markers = ["/screenshots/", "/brands/", "/brand-logos/"];
    const marker = markers.find((candidate) => sourceUrl.pathname.includes(candidate));
    const markerIndex = marker ? sourceUrl.pathname.indexOf(marker) : -1;
    const prefixPath = markerIndex >= 0 ? sourceUrl.pathname.slice(0, markerIndex) : "";
    const nextPath = `${prefixPath}/${newKey}`.replace(/\/{2,}/g, "/");

    sourceUrl.pathname = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
    sourceUrl.search = "";
    sourceUrl.hash = "";

    return sourceUrl.toString();
  } catch {
    return newKey;
  }
}

function EditorPage() {
  const { guideId } = Route.useParams();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: fetchedGuide, refetch } = useSuspenseQuery(trpc.guides.getById.queryOptions({ id: guideId }));
  const docsQuery = useQuery(trpc.guideDocs.getByGuideId.queryOptions({ guideId }));

  // Poll for data if guide is still processing (queue hasn't finished yet) or if not found yet (race condition)
  useEffect(() => {
    if (!fetchedGuide || (fetchedGuide as any)?.status === 'processing' || (fetchedGuide as any)?.status === 'recording') {
      const interval = setInterval(() => {
        refetch();
      }, 1000); // Poll every 1 second for faster response

      return () => clearInterval(interval);
    }
  }, [fetchedGuide, refetch]);

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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDocsWizardOpen, setIsDocsWizardOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<SidebarWidth>("medium");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const generateDocsMutation = useMutation({
    ...trpc.guideDocs.generate.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.guideDocs.getByGuideId.queryOptions({ guideId }).queryKey,
      });
      toast.success("Docs generation started");
      setIsDocsWizardOpen(false);
      navigate({ to: "/app/docs/$guideId", params: { guideId } });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate docs");
    },
  });

  // Cycle through sidebar widths: medium -> wide -> narrow -> collapsed -> medium
  const handleCycleWidth = useCallback(() => {
    setSidebarWidth((current) => {
      const cycle: SidebarWidth[] = ["medium", "wide", "narrow", "collapsed"];
      const currentIndex = cycle.indexOf(current);
      return cycle[(currentIndex + 1) % cycle.length];
    });
  }, []);

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
  const uploadImageMutation = useUploadImage();
  const updateGuideMutation = useUpdateGuide();

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

  const handleDeleteMultipleSteps = useCallback(async (ids: string[]) => {
    if (!session.guide?.steps || ids.length === 0) return;

    const stepsToDelete = session.guide.steps.filter((step) => ids.includes(step.id));
    const originalSteps = session.guide.steps;
    const updatedSteps = originalSteps.filter((step) => !ids.includes(step.id));
    const reindexedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));

    session.updateSteps(reindexedSteps);

    if (ids.includes(activeStepId)) {
      const nextActive = reindexedSteps.find((step) => step.imageKey) || reindexedSteps[0];
      setActiveStepId(nextActive?.id || "");
    }

    try {
      await Promise.all(
        stepsToDelete.map((step) =>
          deleteStepMutation.mutateAsync({
            guideId,
            stepId: step.id,
            imageKey: step.imageKey || undefined,
          })
        )
      );

      toast.success(`Deleted ${stepsToDelete.length} step${stepsToDelete.length === 1 ? "" : "s"}`, {
        duration: 1800,
      });
    } catch (error) {
      session.updateSteps(originalSteps);
      toast.error("Failed to delete selected steps");
      console.error(error);
    }
  }, [session, activeStepId, deleteStepMutation, guideId]);

  // Handle step reorder - syncs to DO
  const handleReorderSteps = useCallback((steps: Step[]) => {
    const reindexed = steps.map((step, idx) => ({
      ...step,
      orderIndex: idx,
    }));
    session.updateSteps(reindexed);
  }, [session]);

  // Handle add step with image - uploads to R2 via existing pipeline, then syncs to DO
  const handleAddStep = useCallback(async (stepData: { title: string; file: File; previewUrl: string }) => {
    const newStepId = crypto.randomUUID();
    const orderIndex = session.guide?.steps?.length || 0;

    // Create our own blob URL so the dialog's cleanup doesn't break the preview
    const localPreviewUrl = URL.createObjectURL(stepData.file);

    const newStep: Step = {
      id: newStepId,
      type: 'click',
      caption: stepData.title,
      imageKey: localPreviewUrl,
      orderIndex,
      overlays: [],
      pageUrl: "",
      domSelector: "",
    };

    const updatedSteps = [...(session.guide?.steps || []), newStep];
    session.updateSteps(updatedSteps);
    setActiveStepId(newStepId);

    // Upload to R2 via tRPC → BFF → data-service → base64toR2
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(stepData.file);
      });

      const ext = stepData.file.type.split('/')[1] || 'png';
      const r2Key = `screenshots/${guideId}/${Date.now()}-${newStepId}.${ext}`;

      const uploadResult = await uploadImageMutation.mutateAsync({ key: r2Key, dataUrl });
      if (uploadResult.success) {
        // Derive full URL from an existing step's imageKey (which already has ASSETS_URL prepended by tRPC)
        const referenceUrl = session.guide?.steps?.find(s => s.imageKey?.startsWith('http'))?.imageKey;
        const fullImageUrl = referenceUrl
          ? buildImportedImageUrl(referenceUrl, uploadResult.key)
          : uploadResult.key;
        session.updateStep(newStepId, { imageKey: fullImageUrl });
      }
    } catch (error) {
      console.error('Failed to upload step image:', error);
      toast.error('Failed to upload image');
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
    }
  }, [session, guideId, uploadImageMutation]);

  // Handle add text-only step - syncs to DO
  const handleAddTextStep = useCallback((title: string) => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      caption: title,
      type: 'navigate',
      orderIndex: (session.guide?.steps?.length || 0),
      overlays: [],
      pageUrl: "",
    };

    const updatedSteps = [...(session.guide?.steps || []), newStep];
    session.updateSteps(updatedSteps);
    setActiveStepId(newStep.id);
  }, [session]);

  const handleImportStepsFromExisting = useCallback(
    async ({ sourceGuideId, steps }: { sourceGuideId: string; steps: Step[] }) => {
      if (!steps.length) return;

      const existingSteps = session.guide?.steps || [];
      const importedSteps: Step[] = [];
      let fallbackReferenceCount = 0;

      for (const sourceStep of steps) {
        let importedImageKey = sourceStep.imageKey || undefined;

        if (sourceStep.imageKey?.startsWith("http")) {
          try {
            const dataUrl = await queryClient.fetchQuery(
              trpc.images.fetchAsDataUri.queryOptions({ url: sourceStep.imageKey })
            );
            const mimeMatch = dataUrl.match(/^data:(image\/[^;]+);base64,/i);
            const extension = mimeTypeToExtension(mimeMatch?.[1] || "image/png");
            const key = `screenshots/${guideId}/imported-${Date.now()}-${crypto.randomUUID()}.${extension}`;

            const uploadResult = await uploadImageMutation.mutateAsync({ key, dataUrl });
            importedImageKey = buildImportedImageUrl(sourceStep.imageKey, uploadResult.key);
          } catch (error) {
            fallbackReferenceCount++;
            importedImageKey = sourceStep.imageKey;
            console.warn("Failed to clone imported image, using source reference:", error);
          }
        }

        const nextOrderIndex = existingSteps.length + importedSteps.length;
        const newStep: Step = {
          id: crypto.randomUUID(),
          type: sourceStep.type === "navigate" ? "navigate" : "click",
          orderIndex: nextOrderIndex,
          imageKey: importedImageKey,
          pageUrl: sourceStep.pageUrl || "",
          domSelector: sourceStep.domSelector || "",
          x: sourceStep.x,
          y: sourceStep.y,
          caption: sourceStep.caption || sourceStep.aiCaption || `Step ${nextOrderIndex + 1}`,
          aiCaption: sourceStep.aiCaption,
          overlays: sourceStep.overlays
            ? (JSON.parse(JSON.stringify(sourceStep.overlays)) as Overlay[])
            : [],
          isExcluded: sourceStep.isExcluded,
        };

        importedSteps.push(newStep);
      }

      if (!importedSteps.length) return;

      session.updateSteps([...existingSteps, ...importedSteps]);
      setActiveStepId(importedSteps[0].id);

      toast.success(
        `Imported ${importedSteps.length} step${importedSteps.length === 1 ? "" : "s"}`
      );
      console.log(`Imported steps from source guide ${sourceGuideId}`);

      if (fallbackReferenceCount > 0) {
        toast.warning(
          `${fallbackReferenceCount} image${
            fallbackReferenceCount === 1 ? "" : "s"
          } could not be cloned and still reference the original guide`
        );
      }
    },
    [guideId, queryClient, session, uploadImageMutation]
  );

  // Handle save - persists to database
  const handleSave = useCallback(async () => {
    try {
      await session.save();
      toast.success("Changes saved", { duration: 2000 });
      // Invalidate guides queries - getAll for list, getById for this guide's cache
      queryClient.invalidateQueries({ queryKey: trpc.guides.getAll.queryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: trpc.guides.getById.queryOptions({ id: guideId }).queryKey });
    } catch (error) {
      toast.error("Failed to save changes");
    }
  }, [session, queryClient, guideId]);

  // Handle brand logo change
  const handleBrandLogoChange = useCallback(async (file: File) => {
    setIsUploadingLogo(true);
    try {
      // Convert file to base64 dataUrl
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Generate unique key for the brand logo
      const imageKey = `brand-logos/${guideId}/${Date.now()}.${file.type.split('/')[1] || 'png'}`;

      // Upload to R2
      const uploadResult = await uploadImageMutation.mutateAsync({ key: imageKey, dataUrl });
      if (!uploadResult.success) {
        throw new Error('Upload failed');
      }

      // Update guide with new brandImageKey
      await updateGuideMutation.mutateAsync({ id: guideId, data: { brandImageKey: imageKey } });

      // Invalidate cache to refresh the UI
      queryClient.invalidateQueries({ queryKey: trpc.guides.getById.queryOptions({ id: guideId }).queryKey });

      toast.success("Brand logo updated", { duration: 2000 });
    } catch (error) {
      console.error('Failed to update brand logo:', error);
      toast.error("Failed to update brand logo");
    } finally {
      setIsUploadingLogo(false);
    }
  }, [guideId, queryClient, uploadImageMutation, updateGuideMutation]);

  const handleGenerateDocs = useCallback(async (input: GuideDocsGenerationInput) => {
    await generateDocsMutation.mutateAsync({ guideId, input });
  }, [generateDocsMutation, guideId]);

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
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-muted-foreground">Guide not found</div>
        <div className="text-sm text-muted-foreground">Waiting for processing to complete...</div>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
        title={session.guide.title}
        brandLogoUrl={session.guide.brandImageKey}
        isDirty={session.isDirty}
        isSyncing={session.isSyncing}
        isSaving={session.isSaving}
        isUploadingLogo={isUploadingLogo}
        lastSaved={session.lastSaved}
        error={session.error}
        onTitleChange={handleTitleChange}
        onBrandLogoChange={handleBrandLogoChange}
        onSave={handleSave}
        onGenerateDocs={() => setIsDocsWizardOpen(true)}
        onShare={() => setIsShareOpen(true)}
        onExport={() => setIsExportOpen(true)}
        onBack={() => navigate({ to: "/app" })}
        isGeneratingDocs={generateDocsMutation.isPending}
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
          onDeleteMultipleSteps={handleDeleteMultipleSteps}
          onReorderSteps={handleReorderSteps}
          onAddStep={handleAddStep}
          onAddTextStep={handleAddTextStep}
          onImportFromExisting={() => setIsImportDialogOpen(true)}
          sidebarWidth={sidebarWidth}
          onCycleWidth={handleCycleWidth}
        />
      </div>

      <ImportExistingStepsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        currentGuideId={guideId}
        onImportSteps={handleImportStepsFromExisting}
      />

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        guideTitle={session.guide.title || "Untitled Guide"}
        guideId={guideId}
        guideStatus={(fetchedGuide as Guide)?.status as 'draft' | 'recording' | 'processing' | 'published'}
        guideVisibility={(fetchedGuide as Guide)?.visibility as 'public' | 'private' | null}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        guideTitle={session.guide.title || "Untitled Guide"}
        guideId={guideId}
      />

      <DocsGenerationWizard
        open={isDocsWizardOpen}
        onOpenChange={setIsDocsWizardOpen}
        guideTitle={session.guide.title || "Untitled Guide"}
        defaultValue={docsQuery.data?.page?.generationInput}
        onSubmit={handleGenerateDocs}
        isSubmitting={generateDocsMutation.isPending}
      />
    </div>
  );
}
