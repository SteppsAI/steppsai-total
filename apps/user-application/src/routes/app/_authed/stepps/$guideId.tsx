import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Pencil, ChevronLeft } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { trpc } from "@/router";
import { Step } from "@/types/db";

export const Route = createFileRoute("/app/_authed/stepps/$guideId")({
  component: GuideViewPage,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.guides.getById.queryOptions({ id: params.guideId })
    );
  },
});

function GuideViewPage() {
  const { guideId } = Route.useParams();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { data: guide } = useSuspenseQuery(trpc.guides.getById.queryOptions({ id: guideId }));

  if (!guide) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

  const steps = (guide.steps ?? []) as Step[];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
        <div className="container max-w-5xl h-full mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="-ml-2 hover:bg-muted/50">
              <Link to="/app/stepps">
                <ChevronLeft className="size-5 text-muted-foreground" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <span className="font-medium text-sm hidden sm:inline-block truncate max-w-[300px]">
              {guide.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" onClick={() => setIsShareOpen(true)}>
              <Share2 className="size-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" asChild>
              <Link to="/app/editor/$guideId" params={{ guideId: guide.id }}>
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-6 py-12 md:py-16 space-y-16">
        {/* Guide Header */}
        <div className="space-y-6 text-center border-b pb-12">
          <div className="space-y-4">
            <Badge variant={guide.status === 'published' ? 'default' : 'secondary'} className="uppercase tracking-wider text-[10px]">
              {guide.status || 'Draft'}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{guide.title}</h1>
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
                <div className="rounded-xl border overflow-hidden shadow-sm bg-muted/10 ring-1 ring-black/5">
                  {step.imageKey ? (
                    <img
                      src={step.imageKey}
                      alt={`Step ${index + 1}`}
                      className="w-full h-auto object-contain bg-white"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-muted-foreground bg-muted/20">
                      <p className="text-xl md:text-2xl font-medium text-center px-6">
                        {step.caption || step.aiCaption || `Step ${index + 1}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            <p className="text-lg">No steps in this guide.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/app/editor/$guideId" params={{ guideId: guide.id }}>Add steps in Editor</Link>
            </Button>
          </div>
        )}
      </main>

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        guideTitle={guide.title || ""}
        guideId={guide.id}
      />
    </div>
  );
}
