import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ViewerCanvas } from "@/components/viewer-canvas";
import { trpc } from "@/router";
import { Step } from "@/types/db";
import { Footer } from "@/components/home-page/footer";
import { ArrowRight } from "lucide-react";

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
      {/* Refined Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="https://stepps.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <img src="/brand/logo.svg" alt="Stepps" className="h-8 w-auto" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://stepps.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-primary group inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-lg shadow-primary/20"
            >
              Create your own guide
              <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - Reset to original style */}
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

      {/* Footer */}
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
