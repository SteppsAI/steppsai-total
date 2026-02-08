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
  Paintbrush,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/router";
import type { AspectRatio, LayoutId } from "@/lib/carousel-templates";
import {
  CAROUSEL_TEMPLATES,
  LAYOUT_TEMPLATES,
} from "@/lib/carousel-templates";

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
  const [selectedLayoutId, setSelectedLayoutId] = useState<LayoutId>("classic");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

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

  const handleCreate = () => {
    navigate({
      to: "/app/carousel/editor",
      search: {
        aspectRatio: selectedRatio,
        sourceType,
        sourceGuideId: selectedGuideId || undefined,
        templateId: selectedTemplateId,
        layoutId: selectedLayoutId,
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
                  "Choose a layout and style for your slides."}
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
          <div className="p-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSelectSource("stepp")}
                className="group flex items-center justify-between w-full p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
              >
                <div>
                  <span className="font-medium text-sm">From Stepps</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Generate from an existing guide</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
              <button
                onClick={() => handleSelectSource("manual")}
                className="group flex items-center justify-between w-full p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
              >
                <div>
                  <span className="font-medium text-sm">From Scratch</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Start with blank slides</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
          <ScrollArea className="h-[440px]">
            <div className="p-6 space-y-5">
              {/* Layout section */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Layout
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUT_TEMPLATES.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayoutId(layout.id)}
                      title={layout.description}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all",
                        selectedLayoutId === layout.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <LayoutPreview layoutId={layout.id} active={selectedLayoutId === layout.id} />
                      <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
                        {layout.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Style section */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Style
                </span>

                {/* Custom option */}
                <button
                  onClick={() => setSelectedTemplateId(undefined)}
                  className={cn(
                    "w-full text-left rounded-lg border p-3 flex items-center gap-3 transition-all",
                    selectedTemplateId === undefined
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-dashed border-border hover:bg-muted/50"
                  )}
                >
                  <Paintbrush className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-sm font-medium">Custom</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Style everything manually
                    </span>
                  </div>
                </button>

                {/* Template grid */}
                <div className="grid grid-cols-3 gap-2">
                  {CAROUSEL_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={cn(
                        "text-left rounded-lg border overflow-hidden transition-all",
                        selectedTemplateId === template.id
                          ? "border-primary shadow-sm ring-1 ring-primary/30"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <div
                        className="h-14 flex items-end p-2.5"
                        style={{ backgroundColor: template.style.backgroundColor }}
                      >
                        <span
                          className="text-[10px] font-bold leading-tight truncate"
                          style={{
                            color: template.style.headingColor,
                            fontFamily: template.style.fontFamily,
                          }}
                        >
                          {template.name}
                        </span>
                      </div>
                      <div className="px-2 py-1.5 bg-background">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {template.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step === "style-picker" && (
              <Button onClick={handleCreate}>
                Create Carousel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LayoutPreview({ layoutId, active }: { layoutId: LayoutId; active: boolean }) {
  const bar = active ? "bg-primary/40" : "bg-muted-foreground/25";
  const barStrong = active ? "bg-primary/60" : "bg-muted-foreground/35";
  const base = "w-full aspect-[3/4] rounded-md border p-1.5 flex flex-col gap-0.5";
  const borderCls = active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30";

  switch (layoutId) {
    case "classic":
      return (
        <div className={cn(base, borderCls)}>
          <div className={cn("h-1.5 rounded-sm w-3/4", barStrong)} />
          <div className={cn("flex-1 rounded-sm", bar)} />
          <div className={cn("h-1 rounded-sm w-1/2", bar)} />
        </div>
      );
    case "centered":
      return (
        <div className={cn(base, borderCls)}>
          <div className="flex-1" />
          <div className={cn("h-1.5 rounded-sm w-3/4 self-center", barStrong)} />
          <div className={cn("h-3 rounded-sm w-1/2 self-center mt-0.5", bar)} />
          <div className="flex-1" />
          <div className={cn("h-1 rounded-sm w-1/2", bar)} />
        </div>
      );
    case "image-first":
      return (
        <div className={cn(base, borderCls)}>
          <div className={cn("flex-1 rounded-sm", bar)} />
          <div className={cn("h-1.5 rounded-sm w-3/4", barStrong)} />
          <div className={cn("h-1 rounded-sm w-1/2", bar)} />
        </div>
      );
    default:
      return null;
  }
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
