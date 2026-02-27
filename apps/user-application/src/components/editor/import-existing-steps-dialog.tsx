import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Step } from "@/types/db";
import { trpc } from "@/router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, FileText, Image as ImageIcon, Loader2, Search } from "lucide-react";

interface GuideOption {
  guideId: string;
  title?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  steps?: Step[];
  brandImageKey?: string | null;
}

interface ImportExistingStepsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGuideId: string;
  onImportSteps: (payload: { sourceGuideId: string; steps: Step[] }) => Promise<void> | void;
}

export function ImportExistingStepsDialog({
  open,
  onOpenChange,
  currentGuideId,
  onImportSteps,
}: ImportExistingStepsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedGuideId(null);
      setSelectedStepIds(new Set());
      setIsImporting(false);
    }
  }, [open]);

  const { data: guidesData = [], isLoading: isGuidesLoading } = useQuery(
    trpc.guides.getAll.queryOptions()
  );

  const guides = guidesData as GuideOption[];

  const availableGuides = useMemo(() => {
    return guides
      .filter((guide) => guide.guideId !== currentGuideId)
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [guides, currentGuideId]);

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return availableGuides;
    const search = searchQuery.toLowerCase();
    return availableGuides.filter((guide) =>
      (guide.title || "Untitled").toLowerCase().includes(search)
    );
  }, [availableGuides, searchQuery]);

  const selectedGuideQueryOptions = trpc.guides.getById.queryOptions({
    id: selectedGuideId || "",
  }) as any;

  const { data: selectedGuideData, isLoading: isGuideLoading } = useQuery<GuideOption | null>({
    ...selectedGuideQueryOptions,
    enabled: open && !!selectedGuideId,
  });

  const selectedGuide = selectedGuideData || null;

  const sourceSteps = useMemo(() => {
    const steps = selectedGuide?.steps || [];
    return [...steps].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [selectedGuide?.steps]);

  const toggleStepSelection = (stepId: string, checked: boolean) => {
    setSelectedStepIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(stepId);
      } else {
        next.delete(stepId);
      }
      return next;
    });
  };

  const handleOpenGuide = (guideId: string) => {
    setSelectedGuideId(guideId);
    setSelectedStepIds(new Set());
  };

  const handleSelectAll = () => {
    setSelectedStepIds(new Set(sourceSteps.map((step) => step.id)));
  };

  const handleClearSelection = () => {
    setSelectedStepIds(new Set());
  };

  const handleImport = async () => {
    if (!selectedGuideId) return;

    const stepsToImport = sourceSteps.filter((step) => selectedStepIds.has(step.id));
    if (stepsToImport.length === 0) {
      toast.error("Select at least one step to import");
      return;
    }

    try {
      setIsImporting(true);
      await onImportSteps({
        sourceGuideId: selectedGuideId,
        steps: stepsToImport,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to import steps:", error);
      toast.error("Failed to import selected steps");
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = selectedStepIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b space-y-3">
          {selectedGuideId ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedGuideId(null);
                  setSelectedStepIds(new Set());
                }}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle>Import Steps</DialogTitle>
                <DialogDescription>
                  Select the steps from "{selectedGuide?.title || "Untitled Stepp"}" that you want to import.
                </DialogDescription>
              </div>
            </div>
          ) : (
            <>
              <DialogTitle>Import From Existing Stepp</DialogTitle>
              <DialogDescription>
                Choose a Stepp first, then select which steps you want to bring into this guide.
              </DialogDescription>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search stepps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </>
          )}
        </DialogHeader>

        <ScrollArea className="h-[440px]">
          <div className="p-4">
            {!selectedGuideId ? (
              <>
                {isGuidesLoading ? (
                  <div className="h-40 flex items-center justify-center text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading stepps...
                  </div>
                ) : filteredGuides.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                    No stepps found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredGuides.map((guide) => (
                      <button
                        key={guide.guideId}
                        onClick={() => handleOpenGuide(guide.guideId)}
                        className={cn(
                          "w-full rounded-xl border p-3 text-left transition-colors",
                          "hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                              {guide.brandImageKey ? (
                                <img
                                  src={guide.brandImageKey}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{guide.title || "Untitled Stepp"}</p>
                              <p className="text-xs text-muted-foreground">
                                {guide.steps?.length || 0} step
                                {(guide.steps?.length || 0) === 1 ? "" : "s"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {guide.status || "draft"}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : isGuideLoading ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading steps...
              </div>
            ) : sourceSteps.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                This Stepp has no steps to import.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} selected of {sourceSteps.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      Select all
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>

                {sourceSteps.map((step, index) => {
                  const checked = selectedStepIds.has(step.id);
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => toggleStepSelection(step.id, !checked)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition-colors",
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={checked}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(value) => toggleStepSelection(step.id, value === true)}
                          className="mt-1"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">
                              {index + 1}. {step.caption || step.aiCaption || `Step ${index + 1}`}
                            </p>
                            <Badge variant="secondary" className="shrink-0">
                              {step.imageKey ? "Image" : "Text"}
                            </Badge>
                          </div>

                          {step.imageKey ? (
                            <div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted max-w-[220px]">
                              <img
                                src={step.imageKey}
                                alt={step.caption || `Step ${index + 1}`}
                                className="w-full h-24 object-cover"
                              />
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              Text-only step
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedGuideId || selectedCount === 0 || isImporting}
          >
            {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Import Selected Steps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
