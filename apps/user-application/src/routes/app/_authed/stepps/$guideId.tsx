import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Edit, Download, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Annotation } from "@/components/editor/annotation-types";
import { ShareDialog } from "@/components/share-dialog";
import { useStepp } from "@/hooks/use-stepps";

export const Route = createFileRoute("/app/_authed/stepps/$guideId")({
  component: GuideViewPage,
});

function GuideViewPage() {
  const { guideId } = Route.useParams();
  const { data: fetchedGuide, isLoading, error } = useStepp(guideId);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col gap-4 items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
             <Skeleton className="h-4 w-[250px]" />
             <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !fetchedGuide) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Guide not found</div>
      </div>
    );
  }

  // Use fetched guide
  const guide = fetchedGuide;
  const steps = (guide as any).steps || []; // Cast to any to access steps if type definition is strict

  const activeStep = steps[activeStepIndex];
  const hasNext = activeStepIndex < steps.length - 1;
  const hasPrev = activeStepIndex > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Link to="/app/stepps" search={{ search: "" }} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {guide.title}
              <Badge variant="secondary" className="text-xs font-normal">
                {guide.status}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
              {guide.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsShareOpen(true)}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Export
          </Button>
           <Button variant="outline" size="sm" className="gap-2">
            <Printer className="size-4" />
            Print
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link to="/app/editor/$guideId" params={{ guideId: guide.id }}>
              <Edit className="size-4" />
              Edit Stepp
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Steps Navigation */}
        <aside className="w-80 border-r bg-muted/10 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium mb-1">Steps</h3>
            <p className="text-xs text-muted-foreground">
              {steps.length} steps in this guide
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {steps.map((step: any, index: number) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                    index === activeStepIndex
                      ? "bg-background border-primary shadow-sm ring-1 ring-primary/20"
                      : "bg-background/50 border-transparent hover:bg-background hover:border-border"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${index === activeStepIndex ? "text-primary" : "text-foreground"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {step.finalCaption}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content - Step Display */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
          <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
             {activeStep ? (
             <div className="w-full max-w-5xl bg-background rounded-xl shadow-sm border overflow-hidden flex flex-col h-[calc(100%-2rem)]">
                {/* Step Header inside view */}
                <div className="p-4 border-b bg-muted/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-semibold">
                         {activeStepIndex + 1}
                      </div>
                      <h2 className="text-lg font-medium">{activeStep.title}</h2>
                   </div>
                   <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                        disabled={!hasPrev}
                      >
                        <ChevronLeft className="size-5" />
                      </Button>
                       <span className="text-sm text-muted-foreground w-12 text-center">
                        {activeStepIndex + 1} / {steps.length}
                       </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                        disabled={!hasNext}
                      >
                         <ChevronRight className="size-5" />
                      </Button>
                   </div>
                </div>

                {/* Image/Canvas Area */}
                <div className="flex-1 relative bg-muted/10 overflow-hidden">
                   {activeStep.screenshotUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                         <div className="relative max-h-full max-w-full shadow-lg rounded-lg overflow-hidden">
                            <img
                              src={activeStep.screenshotUrl}
                              alt={activeStep.title}
                              className="max-h-full max-w-full object-contain"
                            />
                         </div>
                      </div>
                   ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                         No image available
                      </div>
                   )}
                </div>

                {/* Caption Footer */}
                <div className="p-6 border-t bg-background">
                   <h3 className="text-sm font-medium text-muted-foreground mb-2">Instruction</h3>
                   <p className="text-base leading-relaxed">
                      {activeStep.finalCaption}
                   </p>
                </div>
             </div>
             ) : (
               <div className="text-muted-foreground">No steps found</div>
             )}
          </div>
        </main>
      </div>

      <ShareDialog 
          open={isShareOpen} 
          onOpenChange={setIsShareOpen}
          guideTitle={guide.title || ""}
          guideId={guide.id}
      />
    </div>
  );
}
