import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Pencil, ChevronLeft, Download, MoreVertical, Calendar, ExternalLink } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog, PdfIcon, HtmlIcon } from "@/components/export-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [isExportOpen, setIsExportOpen] = useState(false);

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
              <Link to="/app/editor/$guideId" params={{ guideId: guide.guideId }}>
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" onClick={() => setIsExportOpen(true)}>
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Previous Exports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {guide.exportedDocs && Object.keys(guide.exportedDocs).length > 0 ? (
                  <div className="p-2 space-y-2">
                    {/* Check for PDF */}
                    {(guide.exportedDocs as any)?.pdf?.status === 'COMPLETED' && (guide.exportedDocs as any)?.pdf?.url && (
                      <a
                        href={(guide.exportedDocs as any).pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-background group-hover:shadow-sm transition-all">
                          <PdfIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">PDF Document</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date((guide.exportedDocs as any).pdf.updatedAt || new Date()).toLocaleDateString()}
                          </p>
                        </div>
                        <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}

                    {/* Check for HTML */}
                    {(guide.exportedDocs as any)?.html?.status === 'COMPLETED' && (guide.exportedDocs as any)?.html?.url && (
                      <a
                        href={(guide.exportedDocs as any).html.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-background group-hover:shadow-sm transition-all">
                          <HtmlIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">HTML Document</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date((guide.exportedDocs as any).html.updatedAt || new Date()).toLocaleDateString()}
                          </p>
                        </div>
                        <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}

                    {/* Fallback if no valid exports found despite object existing */}
                    {(!((guide.exportedDocs as any)?.pdf?.status === 'COMPLETED') && !((guide.exportedDocs as any)?.html?.status === 'COMPLETED')) && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        No completed exports yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No exports generated yet.
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
                {step.imageKey && (
                  <div className="rounded-xl border overflow-hidden shadow-sm bg-muted/10 ring-1 ring-black/5">
                    <img
                      src={step.imageKey}
                      alt={`Step ${index + 1}`}
                      className="w-full h-auto object-contain bg-white"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            <p className="text-lg">No steps in this guide.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/app/editor/$guideId" params={{ guideId: guide.guideId }}>Add steps in Editor</Link>
            </Button>
          </div>
        )}
      </main>

      <ShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        guideTitle={guide.title || ""}
        guideId={guide.guideId}
      />

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        guideTitle={guide.title || ""}
        guideId={guide.guideId}
      />
    </div>
  );
}
