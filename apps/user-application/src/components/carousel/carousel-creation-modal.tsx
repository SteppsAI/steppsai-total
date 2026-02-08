import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  FileText,
  Folder,
  ArrowRight,
  ArrowLeft,
  Clock,
  ChevronDown,
  ChevronRight,
  RectangleHorizontal,
  Square,
  PenLine,
  BookOpen,
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/router";
import type { AspectRatio, CarouselTemplate } from "@/lib/carousel-templates";
import { CAROUSEL_TEMPLATES } from "@/lib/carousel-templates";

interface ModalGuide {
  guideId: string;
  title?: string | null;
  folderId?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  steps?: { id: string; caption: string; imageKey?: string | null }[];
  brandImageKey?: string | null;
}

interface ModalFolder {
  folderId: string;
  name: string;
}

type Step = "source" | "stepp-picker" | "style-picker";

interface CarouselCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CarouselCreationModal({
  open,
  onOpenChange,
}: CarouselCreationModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("source");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("3:4");
  const [sourceType, setSourceType] = useState<"stepp" | "manual">("manual");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const { data: guidesData = [] } = useSuspenseQuery(
    trpc.guides.getAll.queryOptions()
  );
  const { data: foldersData = [] } = useSuspenseQuery(
    trpc.folders.getAll.queryOptions()
  );

  const guides = guidesData as ModalGuide[];
  const folders = foldersData as ModalFolder[];

  const recentGuides = [...guides]
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 4);

  const looseGuides = guides.filter((g) => !g.folderId);

  const guidesByFolder = folders.reduce(
    (acc, folder) => {
      acc[folder.folderId] = guides.filter(
        (g) => g.folderId === folder.folderId
      );
      return acc;
    },
    {} as Record<string, ModalGuide[]>
  );

  const filteredGuides = searchQuery
    ? guides.filter(
        (guide) =>
          guide.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          folders
            .find((f) => f.folderId === guide.folderId)
            ?.name?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleSelectSource = (type: "stepp" | "manual") => {
    setSourceType(type);
    if (type === "stepp") {
      setStep("stepp-picker");
    } else {
      setStep("style-picker");
    }
  };

  const handleSelectGuide = (guideId: string) => {
    setSelectedGuideId(guideId);
    setStep("style-picker");
  };

  const handleSelectStyle = (template?: CarouselTemplate) => {
    navigate({
      to: "/app/carousel/editor",
      search: {
        aspectRatio: selectedRatio,
        sourceType,
        sourceGuideId: selectedGuideId || undefined,
        templateId: template?.id,
      },
      replace: true,
    });
  };

  const handleBack = () => {
    if (step === "style-picker" && sourceType === "stepp") {
      setStep("stepp-picker");
    } else {
      setStep("source");
      setSelectedGuideId(null);
      setSearchQuery("");
    }
  };

  const getFolderName = (folderId: string | null | undefined) => {
    if (!folderId) return null;
    return folders.find((f) => f.folderId === folderId)?.name || null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[640px] p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-4">
          <div className="flex items-center gap-3">
            {step !== "source" && (
              <button
                onClick={handleBack}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div>
              <DialogTitle>
                {step === "source" && "Create Carousel"}
                {step === "stepp-picker" && "Choose a Stepp"}
                {step === "style-picker" && "Choose a Style"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {step === "source" &&
                  "Pick an aspect ratio and how you want to start."}
                {step === "stepp-picker" &&
                  "Select a stepp to generate slides from."}
                {step === "style-picker" &&
                  "Pick a template or start with custom styling."}
              </DialogDescription>
            </div>
          </div>

          {/* Aspect ratio picker - only on source step */}
          {step === "source" && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Ratio:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRatio("3:4")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                    selectedRatio === "3:4"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <RectangleHorizontal className="size-4 rotate-90" />
                  3:4
                </button>
                <button
                  onClick={() => setSelectedRatio("1:1")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                    selectedRatio === "1:1"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Square className="size-4" />
                  1:1
                </button>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* ── Step: Source Selection ── */}
        {step === "source" && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectSource("stepp")}
                className="group text-left rounded-xl border-2 border-border p-6 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base">From Stepps</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate slides from an existing stepp guide
                </p>
              </button>
              <button
                onClick={() => handleSelectSource("manual")}
                className="group text-left rounded-xl border-2 border-border p-6 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <PenLine className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base">From Scratch</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create slides manually with your own content
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Stepp Picker ── */}
        {step === "stepp-picker" && (
          <>
            <div className="px-6 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search stepps..."
                  className="pl-9 bg-muted/50 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <ScrollArea className="h-[340px]">
              <div className="p-2">
                {searchQuery ? (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Search Results
                    </div>
                    {filteredGuides.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {filteredGuides.map((guide) => (
                          <GuideItem
                            key={guide.guideId}
                            guide={guide}
                            folderName={getFolderName(guide.folderId)}
                            onClick={() => handleSelectGuide(guide.guideId)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <p>No stepps found matching &ldquo;{searchQuery}&rdquo;</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {recentGuides.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Clock className="size-3" />
                          Recent
                        </div>
                        <div className="flex flex-col gap-1">
                          {recentGuides.map((guide) => (
                            <GuideItem
                              key={`recent-${guide.guideId}`}
                              guide={guide}
                              folderName={getFolderName(guide.folderId)}
                              onClick={() => handleSelectGuide(guide.guideId)}
                              showDate
                            />
                          ))}
                        </div>
                        <Separator className="my-2" />
                      </div>
                    )}

                    {(() => {
                      const foldersWithGuides = folders.filter(
                        (folder) =>
                          (guidesByFolder[folder.folderId] || []).length > 0
                      );
                      return (
                        foldersWithGuides.length > 0 && (
                          <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Folders
                            </div>
                            <div className="flex flex-col gap-1">
                              {foldersWithGuides.map((folder) => {
                                const isExpanded = expandedFolders.has(
                                  folder.folderId
                                );
                                const folderGuides =
                                  guidesByFolder[folder.folderId] || [];
                                return (
                                  <div key={folder.folderId}>
                                    <button
                                      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                      onClick={() =>
                                        toggleFolder(folder.folderId)
                                      }
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                          <Folder className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {folder.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {folderGuides.length} stepp
                                            {folderGuides.length !== 1
                                              ? "s"
                                              : ""}
                                          </span>
                                        </div>
                                      </div>
                                      {isExpanded ? (
                                        <ChevronDown className="size-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                      )}
                                    </button>
                                    {isExpanded && (
                                      <div className="ml-6 pl-4 border-l border-border">
                                        {folderGuides.map((guide) => (
                                          <GuideItem
                                            key={guide.guideId}
                                            guide={guide}
                                            onClick={() =>
                                              handleSelectGuide(guide.guideId)
                                            }
                                            compact
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {looseGuides.length > 0 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        )
                      );
                    })()}

                    {looseGuides.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          All Stepps
                        </div>
                        <div className="flex flex-col gap-1">
                          {looseGuides.map((guide) => (
                            <GuideItem
                              key={guide.guideId}
                              guide={guide}
                              onClick={() => handleSelectGuide(guide.guideId)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {guides.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <p>No stepps found. Go back and start from scratch.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {/* ── Step: Style Picker ── */}
        {step === "style-picker" && (
          <ScrollArea className="h-[400px]">
            <div className="p-6 space-y-4">
              {/* Custom option */}
              <button
                onClick={() => handleSelectStyle(undefined)}
                className="w-full group text-left rounded-xl border-2 border-dashed border-border p-5 hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                  <Paintbrush className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Custom</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Start with default colors and style everything manually
                  </p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>

              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sparkles className="size-3" />
                  Templates
                </span>
                <Separator className="flex-1" />
              </div>

              {/* Template grid */}
              <div className="grid grid-cols-2 gap-3">
                {CAROUSEL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectStyle(template)}
                    className="group text-left rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div
                      className="h-24 flex items-end p-4"
                      style={{
                        backgroundColor: template.style.backgroundColor,
                      }}
                    >
                      <span
                        className="text-sm font-bold leading-tight"
                        style={{
                          color: template.style.headingColor,
                          fontFamily: template.style.fontFamily,
                        }}
                      >
                        {template.name}
                      </span>
                    </div>
                    <div className="px-3 py-2.5 bg-background flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-full border border-border"
                          style={{
                            backgroundColor: template.style.backgroundColor,
                          }}
                        />
                        <span className="text-xs font-medium">
                          {template.name}
                        </span>
                      </div>
                      <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="p-4 border-t bg-muted/20 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>{" "}
            to cancel
          </span>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GuideItemProps {
  guide: ModalGuide;
  folderName?: string | null;
  onClick: () => void;
  showDate?: boolean;
  compact?: boolean;
}

function GuideItem({
  guide,
  folderName,
  onClick,
  showDate,
  compact,
}: GuideItemProps) {
  return (
    <button
      className={`flex items-center justify-between w-full ${compact ? "p-2" : "p-3"} rounded-lg hover:bg-muted/50 transition-colors text-left group`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`flex-shrink-0 ${compact ? "size-8" : "size-10"} rounded-lg ${
            guide.brandImageKey
              ? "bg-white/95 shadow-sm ring-1 ring-black/5"
              : compact
                ? "bg-primary/5"
                : "bg-muted"
          } flex items-center justify-center text-muted-foreground ${!guide.brandImageKey && "group-hover:bg-primary/10 group-hover:text-primary"} transition-colors overflow-hidden`}
        >
          {guide.brandImageKey ? (
            <img
              src={guide.brandImageKey}
              alt=""
              className={`${compact ? "size-5" : "size-6"} object-contain`}
            />
          ) : (
            <FileText className={compact ? "size-4" : "size-5"} />
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span
            className={`font-medium truncate ${compact ? "text-sm" : ""}`}
          >
            {guide.title || "Untitled"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {folderName && (
              <>
                <span className="flex items-center gap-1">
                  <Folder className="size-3" />
                  {folderName}
                </span>
                <span>&middot;</span>
              </>
            )}
            {showDate && (
              <span>
                Last updated{" "}
                {guide.updatedAt
                  ? new Date(guide.updatedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            )}
            {!showDate && !compact && (
              <span>
                {guide.steps?.length || 0} step
                {(guide.steps?.length || 0) !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!compact && (
          <Badge
            variant="secondary"
            className="hidden sm:inline-flex capitalize"
          >
            {guide.status || "draft"}
          </Badge>
        )}
        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}
