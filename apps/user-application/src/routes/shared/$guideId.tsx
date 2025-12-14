import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ViewerCanvas } from "@/components/viewer-canvas";
import { trpc } from "@/router";
import { Step } from "@/types/db";

export const Route = createFileRoute("/shared/$guideId")({
  component: PublicGuideViewPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.publicGuides.getPublished.queryOptions({ id: params.guideId })
    );
  },
});

function PublicGuideViewPage() {
  const navigate = useNavigate();
  const { guideId } = Route.useParams();

  const queryOptions = trpc.publicGuides.getPublished.queryOptions({ id: guideId });
  const { data: guide } = useSuspenseQuery(queryOptions);

  useEffect(() => {
    if (!guide) {
      navigate({ to: "/" });
    }
  }, [guide, navigate]);

  if (!guide) return null;

  const steps = (guide.steps ?? []) as Step[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content - No header with edit/share/export */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-6 py-12 md:py-16 space-y-16">
        {/* Guide Header */}
        <div className="space-y-6 text-center border-b pb-12">
          <div className="space-y-4">
            <Badge variant="default" className="uppercase tracking-wider text-[10px]">
              Published
            </Badge>
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                {guide.title}
              </h1>
              {guide.brandImageKey && (
                <img
                  src={guide.brandImageKey}
                  alt="Brand logo"
                  className="w-9 h-9 object-contain"
                  loading="lazy"
                />
              )}
            </div>
            {guide.description && (
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {guide.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{steps.length} steps</span>
            <span>•</span>
            <span>Last updated {new Date(guide.updatedAt || new Date()).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Steps List */}
        {steps.length > 0 ? (
          <div className="space-y-20">
            {steps.map((step, index) => (
              <div key={step.id || index} className="space-y-6 group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-none flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-bold text-sm mt-1">
                      {index + 1}
                    </div>
                    <div className="space-y-2 pt-1">
                      <h2 className="text-xl md:text-2xl font-medium text-foreground leading-snug">
                        {step.caption || step.aiCaption || `Step ${index + 1}`}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Screenshot */}
                {step.imageKey && (
                  <div className="flex justify-center w-full">
                    <ViewerCanvas
                      screenshotUrl={step.imageKey}
                      overlays={step.overlays as any[]}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            <p className="text-lg">No steps in this guide.</p>
          </div>
        )}
      </main>

      {/* Simple footer for branding */}
      <footer className="border-t py-6">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Created with{" "}
            <a
              href="https://stepps.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Stepps
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
