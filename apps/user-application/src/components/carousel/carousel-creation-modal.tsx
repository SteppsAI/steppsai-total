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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  FileText,
  Folder,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronRight,
  RectangleHorizontal,
  Square,
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

interface CarouselCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CarouselCreationModal({ open, onOpenChange }: CarouselCreationModalProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("3:4");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const { data: guidesData = [] } = useSuspenseQuery(trpc.guides.getAll.queryOptions());
  const { data: foldersData = [] } = useSuspenseQuery(trpc.folders.getAll.queryOptions());

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
      acc[folder.folderId] = guides.filter((g) => g.folderId === folder.folderId);
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

  const handleSelectGuide = (guideId: string) => {
    navigate({
      to: "/app/carousel/editor",
      search: {
        aspectRatio: selectedRatio,
        sourceType: "stepp",
        sourceGuideId: guideId,
      },
      replace: true,
    });
  };

  const handleSelectTemplate = (template: CarouselTemplate) => {
    navigate({
      to: "/app/carousel/editor",
      search: {
        aspectRatio: selectedRatio,
        sourceType: "template",
        templateId: template.id,
      },
      replace: true,
    });
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
          <div>
            <DialogTitle>Create Carousel</DialogTitle>
            <DialogDescription className="mt-1">
              Choose an aspect ratio and a source for your carousel slides.
            </DialogDescription>
          </div>

          {/* Aspect ratio picker */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Ratio:</span>
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
        </DialogHeader>

        <Tabs defaultValue="stepps" className="flex flex-col">
          <div className="px-6 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="stepps" className="flex-1">
                From Stepps
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-1">
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stepps" className="mt-0">
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
                        <p>No stepps found matching "{searchQuery}"</p>
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
                        (folder) => (guidesByFolder[folder.folderId] || []).length > 0
                      );
                      return (
                        foldersWithGuides.length > 0 && (
                          <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Folders
                            </div>
                            <div className="flex flex-col gap-1">
                              {foldersWithGuides.map((folder) => {
                                const isExpanded = expandedFolders.has(folder.folderId);
                                const folderGuides = guidesByFolder[folder.folderId] || [];
                                return (
                                  <div key={folder.folderId}>
                                    <button
                                      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                      onClick={() => toggleFolder(folder.folderId)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                          <Folder className="size-5" />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{folder.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {folderGuides.length} stepp
                                            {folderGuides.length !== 1 ? "s" : ""}
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
                                            onClick={() => handleSelectGuide(guide.guideId)}
                                            compact
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {looseGuides.length > 0 && <Separator className="my-2" />}
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
                        <p>No stepps found. Create a Stepp first or use a template.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <ScrollArea className="h-[390px]">
              <div className="grid grid-cols-2 gap-4 p-6">
                {CAROUSEL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="group text-left rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div
                      className="h-28 flex items-center justify-center p-4"
                      style={{ backgroundColor: template.style.backgroundColor }}
                    >
                      <span
                        className="text-lg font-bold leading-tight"
                        style={{
                          color: template.style.headingColor,
                          fontFamily: template.style.fontFamily,
                        }}
                      >
                        {template.name}
                      </span>
                    </div>
                    <div className="p-3 bg-background">
                      <span className="text-sm font-medium">{template.name}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.slides.length} slides
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

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

function GuideItem({ guide, folderName, onClick, showDate, compact }: GuideItemProps) {
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
          <span className={`font-medium truncate ${compact ? "text-sm" : ""}`}>
            {guide.title || "Untitled"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {folderName && (
              <>
                <span className="flex items-center gap-1">
                  <Folder className="size-3" />
                  {folderName}
                </span>
                <span>·</span>
              </>
            )}
            {showDate && (
              <span>
                Last updated{" "}
                {guide.updatedAt ? new Date(guide.updatedAt).toLocaleDateString() : "N/A"}
              </span>
            )}
            {!showDate && !compact && (
              <span>
                {guide.steps?.length || 0} step{(guide.steps?.length || 0) !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!compact && (
          <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
            {guide.status || "draft"}
          </Badge>
        )}
        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}
