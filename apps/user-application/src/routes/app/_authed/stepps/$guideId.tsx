import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Pencil, ChevronLeft } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { useStepp } from "@/hooks/use-stepps";
import { Guide, Step } from "@/types/db";

export const Route = createFileRoute("/app/_authed/stepps/$guideId")({
  component: GuideViewPage,
});

// Extend Guide to include steps for this view (handling mock data vs DB schema)
interface GuideWithSteps extends Guide {
  steps: (Step & { title?: string })[];
}

function GuideViewPage() {
  const { guideId } = Route.useParams();
  const { data: fetchedGuide, isLoading, error } = useStepp(guideId);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const guide = fetchedGuide as unknown as GuideWithSteps;
  const steps = guide?.steps || [];

  if (isLoading) {
    return <GuideLoadingSkeleton />;
  }

  if (error || !guide) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

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
            <span>Last updated {new Date(guide.updated_at || new Date()).toLocaleDateString()}</span>
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
                        {/* Prefer final_caption/ai_caption as the main instruction */}
                        {step.final_caption || step.ai_caption || step.title || `Step ${index + 1}`}
                      </h2>
                    </div>
                  </div>
                </div>
                
                {/* Screenshot */}
                <div className="rounded-xl border overflow-hidden shadow-sm bg-muted/10 ring-1 ring-black/5">
                   {step.screenshot_url ? (
                       <img
                           src={step.screenshot_url}
                           alt={`Step ${index + 1}`}
                           className="w-full h-auto object-contain bg-white"
                           loading="lazy"
                       />
                   ) : (
                       <div className="aspect-video flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/20">
                           <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                               <span className="text-2xl">?</span>
                           </div>
                           <p>No image available</p>
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

function GuideLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex-1 w-full max-w-3xl mx-auto p-6 py-12 space-y-12">
        <div className="space-y-4 text-center pb-8">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        {[1, 2, 3].map(i => (
           <div key={i} className="space-y-6">
              <div className="flex gap-4">
                   <Skeleton className="size-8 rounded-full" />
                   <Skeleton className="h-8 w-3/4" />
              </div>
              <Skeleton className="w-full aspect-video rounded-xl" />
           </div>
        ))}
      </div>
    </div>
  );
}
