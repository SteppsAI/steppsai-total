import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Pencil, ChevronLeft, Download, MoreVertical, ExternalLink, Check, X, Loader2 } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { ExportDialog, PdfIcon, HtmlIcon } from "@/components/export-dialog";
import { formatRelativeTime, cn } from "@/lib/utils";
import { ViewerCanvas } from "@/components/viewer-canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/router";
import { Step } from "@/types/db";
import { z } from "zod";

const searchSchema = z.object({
  exporting: z.enum(['pdf', 'html']).optional(),
});

export const Route = createFileRoute("/app/_authed/stepps/$guideId")({
  component: GuideViewPage,
  validateSearch: searchSchema,
  loader: async ({ context, params }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.guides.getById.queryOptions({ id: params.guideId })
    );
  },
});

function GuideViewPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { guideId } = Route.useParams();
  const { exporting } = Route.useSearch();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<'pdf' | 'html' | null>(null);
  const [failureAnimation, setFailureAnimation] = useState<'pdf' | 'html' | null>(null);
  const exportStartTime = useRef<string | null>(null);

  useEffect(() => {
    if (exporting) {
      setIsDropdownOpen(true);
      exportStartTime.current = new Date().toISOString();
    } else {
      exportStartTime.current = null;
    }
  }, [exporting]);

  const queryOptions = trpc.guides.getById.queryOptions({ id: guideId });
  const { data: guide } = useSuspenseQuery({
    ...queryOptions,
    refetchInterval: (query) => {
      if (!exporting) return false;

      const data = query.state.data;
      if (!data?.exportedDocs) return 2000;
      const docs = data.exportedDocs as Record<string, any>;
      const exportDoc = docs[exporting];

      if (!exportDoc) return 2000;

      // If last_updated is before we started exporting, data is stale - keep polling
      if (exportStartTime.current && exportDoc.last_updated < exportStartTime.current) {
        return 2000;
      }

      // Fresh data - stop polling if complete/failed
      if (exportDoc.status === 'COMPLETED' || exportDoc.status === 'FAILED') {
        return false;
      }
      return 2000;
    },
  });

  const lastDocsStr = useRef(JSON.stringify(guide?.exportedDocs || {}));

  // Detect status changes and trigger animations
  useEffect(() => {
    const currentDocsStr = JSON.stringify(guide?.exportedDocs || {});
    if (currentDocsStr !== lastDocsStr.current) {
      const currentDocs = guide?.exportedDocs as Record<string, any> || {};
      const prevDocs = JSON.parse(lastDocsStr.current) as Record<string, any>;

      Object.entries(currentDocs).forEach(([key, doc]) => {
        const prevDoc = prevDocs[key];
        const wasNotCompleted = !prevDoc || prevDoc.status !== 'COMPLETED';
        const wasNotFailed = !prevDoc || prevDoc.status !== 'FAILED';

        if (doc.status === 'COMPLETED' && wasNotCompleted) {
          setSuccessAnimation(key as 'pdf' | 'html');
          setIsDropdownOpen(true);
          setTimeout(() => setSuccessAnimation(null), 2000);
          if (exporting === key) {
            navigate({ to: '.', search: {}, replace: true });
          }
        } else if (doc.status === 'FAILED' && wasNotFailed) {
          setFailureAnimation(key as 'pdf' | 'html');
          setIsDropdownOpen(true);
          setTimeout(() => setFailureAnimation(null), 2000);
          if (exporting === key) {
            navigate({ to: '.', search: {}, replace: true });
          }
        }
      });

      lastDocsStr.current = currentDocsStr;
    }
  }, [guide?.exportedDocs, exporting, navigate]);

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
            <Button variant="ghost" size="icon" className="-ml-2 hover:bg-muted/50" onClick={() => router.history.back()}>
              <ChevronLeft className="size-5 text-muted-foreground" />
              <span className="sr-only">Back</span>
            </Button>
            <span className="font-medium text-sm hidden sm:inline-block truncate max-w-[300px]">
              {guide.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" asChild>
              <Link to="/app/editor/$guideId" params={{ guideId: guide.guideId }}>
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" onClick={() => setIsShareOpen(true)}>
              <Share2 className="size-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" onClick={() => setIsExportOpen(true)}>
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                <DropdownMenuLabel>Exports</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(guide.exportedDocs && Object.keys(guide.exportedDocs).length > 0) || exporting ? (
                  <div className="p-2 space-y-2">
                    {/* PDF Export Item */}
                    {((guide.exportedDocs as any)?.pdf || exporting === 'pdf') && (
                      <div
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-all group",
                          (guide.exportedDocs as any)?.pdf?.status === 'COMPLETED'
                            ? 'hover:bg-muted/50 cursor-pointer'
                            : 'cursor-default',
                          successAnimation === 'pdf' && 'animate-pulse bg-green-500/10 ring-1 ring-green-500/30',
                          failureAnimation === 'pdf' && 'animate-pulse bg-red-500/10 ring-1 ring-red-500/30'
                        )}
                        onClick={() => {
                          if ((guide.exportedDocs as any)?.pdf?.url) {
                            window.open((guide.exportedDocs as any).pdf.url, '_blank');
                          }
                        }}
                      >
                        <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-background group-hover:shadow-sm transition-all">
                          <PdfIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">PDF</p>
                            {exporting === 'pdf' ? (
                              <Loader2 className="size-3.5 text-primary animate-spin" />
                            ) : (guide.exportedDocs as any)?.pdf?.status === 'COMPLETED' ? (
                              <Check className="size-3.5 text-green-500" />
                            ) : (guide.exportedDocs as any)?.pdf?.status === 'FAILED' ? (
                              <X className="size-3.5 text-red-500" />
                            ) : ((guide.exportedDocs as any)?.pdf?.status === 'PENDING' || (guide.exportedDocs as any)?.pdf?.status === 'PROCESSING') ? (
                              <Loader2 className="size-3.5 text-primary animate-spin" />
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {exporting === 'pdf' ||
                              (guide.exportedDocs as any)?.pdf?.status === 'PENDING' ||
                              (guide.exportedDocs as any)?.pdf?.status === 'PROCESSING'
                              ? 'Exporting...'
                              : formatRelativeTime((guide.exportedDocs as any)?.pdf?.last_updated || new Date().toISOString())
                            }
                          </p>
                        </div>
                        {(guide.exportedDocs as any)?.pdf?.url && (
                          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    )}

                    {/* HTML Export Item */}
                    {((guide.exportedDocs as any)?.html || exporting === 'html') && (
                      <div
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-all group",
                          (guide.exportedDocs as any)?.html?.status === 'COMPLETED'
                            ? 'hover:bg-muted/50 cursor-pointer'
                            : 'cursor-default',
                          successAnimation === 'html' && 'animate-pulse bg-green-500/10 ring-1 ring-green-500/30',
                          failureAnimation === 'html' && 'animate-pulse bg-red-500/10 ring-1 ring-red-500/30'
                        )}
                        onClick={() => {
                          if ((guide.exportedDocs as any)?.html?.url) {
                            window.open((guide.exportedDocs as any).html.url, '_blank');
                          }
                        }}
                      >
                        <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-background group-hover:shadow-sm transition-all">
                          <HtmlIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">HTML</p>
                            {exporting === 'html' ? (
                              <Loader2 className="size-3.5 text-primary animate-spin" />
                            ) : (guide.exportedDocs as any)?.html?.status === 'COMPLETED' ? (
                              <Check className="size-3.5 text-green-500" />
                            ) : (guide.exportedDocs as any)?.html?.status === 'FAILED' ? (
                              <X className="size-3.5 text-red-500" />
                            ) : ((guide.exportedDocs as any)?.html?.status === 'PENDING' || (guide.exportedDocs as any)?.html?.status === 'PROCESSING') ? (
                              <Loader2 className="size-3.5 text-primary animate-spin" />
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {exporting === 'html' ||
                              (guide.exportedDocs as any)?.html?.status === 'PENDING' ||
                              (guide.exportedDocs as any)?.html?.status === 'PROCESSING'
                              ? 'Exporting...'
                              : formatRelativeTime((guide.exportedDocs as any)?.html?.last_updated || new Date().toISOString())
                            }
                          </p>
                        </div>
                        {(guide.exportedDocs as any)?.html?.url && (
                          <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    )}

                    {/* Fallback if no exports and not currently exporting */}
                    {!exporting &&
                      !((guide.exportedDocs as any)?.pdf) &&
                      !((guide.exportedDocs as any)?.html) && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                          No exports yet.
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
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{guide.title}</h1>
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
