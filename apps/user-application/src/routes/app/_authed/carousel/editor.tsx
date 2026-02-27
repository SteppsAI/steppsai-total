import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useCallback, createRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CarouselEditorHeader } from "@/components/carousel/carousel-editor-header";
import { CarouselControls } from "@/components/carousel/carousel-controls";
import { CarouselSlideEditor } from "@/components/carousel/carousel-slide-editor";
import { CarouselSlideSidebar } from "@/components/carousel/carousel-slide-sidebar";
import { useCarouselState } from "@/hooks/use-carousel-state";
import { exportCarouselSlides } from "@/lib/carousel-export";
import { CAROUSEL_TEMPLATES } from "@/lib/carousel-templates";
import type { AspectRatio, CarouselTemplate, LayoutId } from "@/lib/carousel-templates";
import type { Overlay } from "@/types/db";
import { trpc } from "@/router";
import { useSidebar } from "@/components/ui/sidebar";

const searchSchema = z.object({
  aspectRatio: z.enum(["3:4", "1:1"]).default("3:4"),
  sourceType: z.enum(["stepp", "manual"]).default("manual"),
  sourceGuideId: z.string().optional(),
  templateId: z.string().optional(),
  layoutId: z.string().optional(),
});

export const Route = createFileRoute("/app/_authed/carousel/editor")({
  component: CarouselEditorPage,
  validateSearch: searchSchema,
});

function CarouselEditorPage() {
  const search = Route.useSearch();
  const { isMobile } = useSidebar();

  const { data: userData } = useQuery(trpc.users.getMe.queryOptions());
  const authorName = (userData as any)?.name || "Author";

  const { data: guideData, isLoading: isGuideLoading } = useQuery({
    ...trpc.guides.getById.queryOptions({ id: search.sourceGuideId! }),
    enabled: !!search.sourceGuideId,
  });

  const guide = guideData as any;

  if (search.sourceGuideId && isGuideLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading stepp data...</span>
        </div>
      </div>
    );
  }

  // Pass CDN URLs directly — export handles fetching + compression at export time
  const guideSteps = guide
    ? (guide.steps || [])
        .filter((s: any) => !s.isExcluded)
        .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((s: any) => ({
          caption: s.caption || s.aiCaption || "",
          imageKey: s.imageKey || null,
          overlays: (s.overlays as Overlay[]) || [],
        }))
    : undefined;

  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-8 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">Desktop Only</p>
          <p className="text-sm mt-2">The carousel editor is only available on desktop devices.</p>
        </div>
      </div>
    );
  }

  const template = search.templateId
    ? CAROUSEL_TEMPLATES.find((t) => t.id === search.templateId)
    : undefined;

  return (
    <CarouselEditorInner
      search={search}
      authorName={authorName}
      template={template}
      guideTitle={guide?.title}
      guideSteps={guideSteps}
    />
  );
}

interface CarouselEditorInnerProps {
  search: z.infer<typeof searchSchema>;
  authorName: string;
  template?: CarouselTemplate;
  guideTitle?: string;
  guideSteps?: Array<{ caption: string; imageKey?: string | null; overlays?: Overlay[] }>;
}

function CarouselEditorInner({
  search,
  authorName,
  template,
  guideTitle,
  guideSteps,
}: CarouselEditorInnerProps) {
  const navigate = useNavigate();

  const {
    state,
    setTitle,
    selectSlide,
    updateSlide,
    addSlide,
    deleteSlide,
    reorderSlides,
    setStyle,
    setExportFormat,
    setAuthorName,
    setSlideNumberFormat,
    setSlideNumberPosition,
    setLayout,
  } = useCarouselState({
    aspectRatio: search.aspectRatio as AspectRatio,
    authorName,
    showWatermark: true,
    template,
    layoutId: (search.layoutId as LayoutId) || "classic",
    guideTitle,
    guideSteps,
  });

  const slideRefs = useRef<Map<string, React.RefObject<HTMLDivElement | null>>>(new Map());

  const [isExporting, setIsExporting] = useState(false);

  const currentSlide = state.slides.find((s) => s.id === state.selectedSlideId) || state.slides[0];

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const refs = state.slides.map((s) => {
        let ref = slideRefs.current.get(s.id);
        if (!ref) {
          ref = createRef<HTMLDivElement>();
          slideRefs.current.set(s.id, ref);
        }
        return ref;
      });

      await exportCarouselSlides(refs, state.title, state.exportFormat, (current, total) => {
        toast.info(`Exporting slide ${current}/${total}...`, {
          id: "carousel-export",
          duration: 2000,
        });
      });

      toast.success(`Exported ${state.slides.length} slides`, {
        id: "carousel-export",
        duration: 3000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export slides");
    } finally {
      setIsExporting(false);
    }
  }, [state.slides, state.title, state.exportFormat]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      <CarouselEditorHeader
        title={state.title}
        isExporting={isExporting}
        onTitleChange={setTitle}
        onExport={handleExport}
        onBack={() => navigate({ to: "/app/carousel" })}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <CarouselControls
          style={state.style}
          exportFormat={state.exportFormat}
          currentSlide={currentSlide}
          authorName={state.authorName}
          slideNumberFormat={state.slideNumberFormat}
          slideNumberPosition={state.slideNumberPosition}
          layout={state.layout}
          onStyleChange={setStyle}
          onExportFormatChange={setExportFormat}
          onUpdateSlide={updateSlide}
          onAuthorNameChange={setAuthorName}
          onSlideNumberFormatChange={setSlideNumberFormat}
          onSlideNumberPositionChange={setSlideNumberPosition}
          onLayoutChange={setLayout}
        />

        <CarouselSlideEditor
          slide={currentSlide}
          style={state.style}
          aspectRatio={state.aspectRatio}
          authorName={state.authorName}
          showWatermark={state.showWatermark}
          slideNumberFormat={state.slideNumberFormat}
          slideNumberPosition={state.slideNumberPosition}
          layout={state.layout}
          slideRefs={slideRefs}
          allSlides={state.slides}
          onUpdateSlide={updateSlide}
        />

        <CarouselSlideSidebar
          slides={state.slides}
          selectedSlideId={state.selectedSlideId}
          style={state.style}
          aspectRatio={state.aspectRatio}
          onSlideSelect={selectSlide}
          onDeleteSlide={deleteSlide}
          onReorderSlides={reorderSlides}
          onAddSlide={() => addSlide(state.selectedSlideId)}
        />
      </div>
    </div>
  );
}
