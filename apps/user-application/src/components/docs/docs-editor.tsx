import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocsToc } from "@/components/docs/docs-toc";
import { DocsShareDialog } from "@/components/docs/docs-share-dialog";
import {
  DocumentationContentView,
  buildDocsTocItems,
} from "@/components/docs/public-docs-page";
import { DocsExportTheme, downloadDocsReactExport } from "@/lib/docs-react-export";
import { cn } from "@/lib/utils";
import { ArrowLeft, Code2, Loader2, RefreshCw, Rocket, Save, Share2, Upload } from "lucide-react";
import { toast } from "sonner";
import type {
  GuideDocumentationContent,
  GuideDocumentationPage,
} from "@repo/data-ops/zod-schema";
import type { Guide } from "@/types/db";

type SelectedSection =
  | "hero"
  | "overview"
  | "getting-started"
  | "requirements"
  | "troubleshooting"
  | "faq"
  | `step:${string}`;

interface DocsEditorProps {
  guide: Guide;
  page: GuideDocumentationPage | null;
  stale: boolean;
  onBack: () => void;
  onOpenGenerateWizard: () => void;
  onSaveDraft: (content: GuideDocumentationContent) => Promise<void> | void;
  onRegenerate: (section: "all" | "intro" | "troubleshooting") => Promise<void> | void;
  onPublish: () => Promise<void> | void;
  onUnpublish: () => Promise<void> | void;
  isSavingDraft?: boolean;
  isRegenerating?: boolean;
  isPublishing?: boolean;
  isUnpublishing?: boolean;
}

function createFallbackContent(guide: Guide): GuideDocumentationContent {
  return {
    seo: {
      metaTitle: `${guide.title || "Guide"} | Documentation`,
      metaDescription: guide.description || "Generated documentation page",
    },
    hero: {
      eyebrow: "Documentation",
      title: guide.title || "Untitled guide",
      subtitle: guide.description || "Generate docs from this guide to start editing.",
    },
    overview: {
      summaryMd: guide.description || "Generate docs to create a structured documentation page.",
    },
    gettingStarted: {
      bullets: [],
      guideUrl: "",
      guideLabel: "",
    },
    requirements: {
      items: [],
    },
    steps: [],
    troubleshooting: {
      items: [],
    },
    faq: {
      items: [],
    },
  };
}

export function DocsEditor({
  guide,
  page,
  stale,
  onBack,
  onOpenGenerateWizard,
  onSaveDraft,
  onRegenerate,
  onPublish,
  onUnpublish,
  isSavingDraft = false,
  isRegenerating = false,
  isPublishing = false,
  isUnpublishing = false,
}: DocsEditorProps) {
  const baseContent = page?.draftContent || page?.generatedContent || null;
  const [draft, setDraft] = useState<GuideDocumentationContent | null>(baseContent);
  const [selectedSection, setSelectedSection] = useState<SelectedSection>("hero");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportThemeDialogOpen, setExportThemeDialogOpen] = useState(false);
  const [exportTheme, setExportTheme] = useState<DocsExportTheme>("dark");

  useEffect(() => {
    setDraft(baseContent);
  }, [baseContent]);

  useEffect(() => {
    if (!draft) return;
    if (selectedSection.startsWith("step:")) {
      const stepId = selectedSection.replace("step:", "");
      const exists = draft.steps.some((step) => step.stepId === stepId);
      if (!exists) setSelectedSection("hero");
    }
  }, [draft, selectedSection]);

  const content = draft || createFallbackContent(guide);
  const tocItems = useMemo(() => buildDocsTocItems(content), [content]);
  const isDirty = JSON.stringify(page?.draftContent || null) !== JSON.stringify(draft || null);
  const generatedContent = page?.generatedContent || null;
  const isPublished = page?.status === "published" && Boolean(page?.publishedContent);

  function handleExportReact(theme: DocsExportTheme) {
    try {
      const exported = downloadDocsReactExport({ guide, content, theme });
      toast.success(`Downloaded ${exported.fileName}`);
      setExportThemeDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export React file");
      setExportThemeDialogOpen(false);
    }
  }

  function updateContent(updater: (current: GuideDocumentationContent) => GuideDocumentationContent) {
    setDraft((current) => updater(current || createFallbackContent(guide)));
  }

  function resetSelectedSection() {
    if (!generatedContent) return;
    setDraft((current) => {
      const next = structuredClone(current || createFallbackContent(guide));
      if (selectedSection === "hero") next.hero = structuredClone(generatedContent.hero);
      else if (selectedSection === "overview") next.overview = structuredClone(generatedContent.overview);
      else if (selectedSection === "getting-started") {
        next.gettingStarted = {
          ...structuredClone(generatedContent.gettingStarted),
          guideUrl: next.gettingStarted.guideUrl || generatedContent.gettingStarted.guideUrl,
          guideLabel: next.gettingStarted.guideLabel || generatedContent.gettingStarted.guideLabel,
        };
      }
      else if (selectedSection === "requirements") next.requirements = structuredClone(generatedContent.requirements);
      else if (selectedSection === "troubleshooting") next.troubleshooting = structuredClone(generatedContent.troubleshooting);
      else if (selectedSection === "faq") next.faq = structuredClone(generatedContent.faq);
      else if (selectedSection.startsWith("step:")) {
        const stepId = selectedSection.replace("step:", "");
        const index = next.steps.findIndex((step) => step.stepId === stepId);
        const generatedStep = generatedContent.steps.find((step) => step.stepId === stepId);
        if (index >= 0 && generatedStep) {
          next.steps[index] = structuredClone(generatedStep);
        }
      }
      return next;
    });
  }

  const renderEditorPanel = () => {
    if (!draft) {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">No docs yet</h2>
          <p className="text-sm text-muted-foreground">
            Generate docs from this guide to start editing the documentation layer.
          </p>
          <Button onClick={onOpenGenerateWizard}>
            <Rocket className="mr-2 h-4 w-4" />
            Generate docs
          </Button>
        </div>
      );
    }

    if (selectedSection === "hero") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Page title</label>
            <Input
              value={draft.hero.title}
              onChange={(e) =>
                updateContent((current) => ({
                  ...current,
                  hero: { ...current.hero, title: e.target.value },
                  seo: { ...current.seo, metaTitle: e.target.value || current.seo.metaTitle },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subtitle</label>
            <Textarea
              rows={4}
              value={draft.hero.subtitle}
              onChange={(e) =>
                updateContent((current) => ({
                  ...current,
                  hero: { ...current.hero, subtitle: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta description</label>
            <Textarea
              rows={4}
              value={draft.seo.metaDescription}
              onChange={(e) =>
                updateContent((current) => ({
                  ...current,
                  seo: { ...current.seo, metaDescription: e.target.value },
                }))
              }
            />
          </div>
        </div>
      );
    }

    if (selectedSection === "overview") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Overview</label>
          <Textarea
            rows={10}
            value={draft.overview.summaryMd}
            onChange={(e) =>
              updateContent((current) => ({
                ...current,
                overview: { summaryMd: e.target.value },
              }))
            }
          />
        </div>
      );
    }

    if (selectedSection === "getting-started") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Get started guide URL</label>
          <Input
            value={draft.gettingStarted.guideUrl || ""}
            onChange={(e) =>
              updateContent((current) => ({
                ...current,
                gettingStarted: {
                  ...current.gettingStarted,
                  guideUrl: e.target.value,
                },
              }))
            }
            placeholder="https://..."
          />

          <label className="text-sm font-medium">Get started button label</label>
          <Input
            value={draft.gettingStarted.guideLabel || ""}
            onChange={(e) =>
              updateContent((current) => ({
                ...current,
                gettingStarted: {
                  ...current.gettingStarted,
                  guideLabel: e.target.value,
                },
              }))
            }
            placeholder="Open source guide"
          />

          <label className="text-sm font-medium">Getting started bullets</label>
          <Textarea
            rows={10}
            value={draft.gettingStarted.bullets.join("\n")}
            onChange={(e) =>
              updateContent((current) => ({
                ...current,
                gettingStarted: {
                  ...current.gettingStarted,
                  bullets: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                },
              }))
            }
          />
        </div>
      );
    }

    if (selectedSection === "requirements") {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Requirements</label>
          <Textarea
            rows={10}
            value={(draft.requirements?.items || []).join("\n")}
            onChange={(e) =>
              updateContent((current) => ({
                ...current,
                requirements: {
                  items: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                },
              }))
            }
          />
        </div>
      );
    }

    if (selectedSection === "troubleshooting") {
      return (
        <div className="space-y-4">
          {(draft.troubleshooting?.items || []).map((item, index) => (
            <div key={index} className="space-y-2 rounded-2xl border p-4">
              <Input
                value={item.problem}
                onChange={(e) =>
                  updateContent((current) => ({
                    ...current,
                    troubleshooting: {
                      items: (current.troubleshooting?.items || []).map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, problem: e.target.value }
                          : candidate
                      ),
                    },
                  }))
                }
              />
              <Textarea
                rows={5}
                value={item.resolutionMd}
                onChange={(e) =>
                  updateContent((current) => ({
                    ...current,
                    troubleshooting: {
                      items: (current.troubleshooting?.items || []).map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, resolutionMd: e.target.value }
                          : candidate
                      ),
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      );
    }

    if (selectedSection === "faq") {
      return (
        <div className="space-y-4">
          {(draft.faq?.items || []).map((item, index) => (
            <div key={index} className="space-y-2 rounded-2xl border p-4">
              <Input
                value={item.question}
                onChange={(e) =>
                  updateContent((current) => ({
                    ...current,
                    faq: {
                      items: (current.faq?.items || []).map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, question: e.target.value }
                          : candidate
                      ),
                    },
                  }))
                }
              />
              <Textarea
                rows={5}
                value={item.answerMd}
                onChange={(e) =>
                  updateContent((current) => ({
                    ...current,
                    faq: {
                      items: (current.faq?.items || []).map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, answerMd: e.target.value }
                          : candidate
                      ),
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      );
    }

    if (selectedSection.startsWith("step:")) {
      const stepId = selectedSection.replace("step:", "");
      const stepIndex = draft.steps.findIndex((step) => step.stepId === stepId);
      const step = draft.steps[stepIndex];
      if (!step) return null;

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Step title</label>
            <Input
              value={step.title}
              onChange={(e) =>
                updateContent((current) => ({
                  ...current,
                  steps: current.steps.map((candidate, candidateIndex) =>
                    candidateIndex === stepIndex ? { ...candidate, title: e.target.value } : candidate
                  ),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Step body</label>
            <Textarea
              rows={8}
              value={step.bodyMd}
              onChange={(e) =>
                updateContent((current) => ({
                  ...current,
                  steps: current.steps.map((candidate, candidateIndex) =>
                    candidateIndex === stepIndex ? { ...candidate, bodyMd: e.target.value } : candidate
                  ),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Callout</label>
            <Textarea
              rows={5}
              value={step.calloutMd || ""}
              onChange={(e) =>
                updateContent((current) => ({
                  ...current,
                  steps: current.steps.map((candidate, candidateIndex) =>
                    candidateIndex === stepIndex ? { ...candidate, calloutMd: e.target.value } : candidate
                  ),
                }))
              }
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const tocSelection = selectedSection.startsWith("step:")
    ? selectedSection.replace("step:", "")
    : selectedSection === "hero"
      ? "overview"
      : selectedSection;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-lg font-semibold">{guide.title || "Untitled guide"}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Docs editor</span>
                <Badge variant={page?.status === "published" ? "default" : "secondary"}>
                  {page?.status || "not_started"}
                </Badge>
                {stale ? <Badge variant="outline">Guide changed since generation</Badge> : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onOpenGenerateWizard}>
              <Rocket className="mr-2 h-4 w-4" />
              {page ? "Edit context" : "Generate docs"}
            </Button>
            <Button variant="outline" onClick={() => onRegenerate("all")} disabled={!page || isRegenerating}>
              {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Regenerate all
            </Button>
            <Button variant="outline" onClick={() => onRegenerate("intro")} disabled={!page || isRegenerating}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate intro
            </Button>
            <Button variant="outline" onClick={() => onRegenerate("troubleshooting")} disabled={!page || isRegenerating}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Troubleshooting
            </Button>
            <Button
              variant="outline"
              onClick={() => setExportThemeDialogOpen(true)}
              disabled={!draft}
            >
              <Code2 className="mr-2 h-4 w-4" />
              Export React
            </Button>
            <Button variant="outline" onClick={() => setShareDialogOpen(true)} disabled={!page}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={() => draft && onSaveDraft(draft)} disabled={!draft || !isDirty || isSavingDraft}>
              {isSavingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save draft
            </Button>
            {isPublished ? (
              <Button variant="outline" onClick={onUnpublish} disabled={isUnpublishing}>
                {isUnpublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Unpublish
              </Button>
            ) : (
              <Button variant="secondary" onClick={onPublish} disabled={!draft || isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Publish
              </Button>
            )}
          </div>
        </div>

        {page?.status === "generating" ? (
          <div className="border-t bg-amber-50 px-6 py-3 text-sm text-amber-800">
            Documentation generation is running in the background. This view refreshes automatically.
          </div>
        ) : null}

        {page?.status === "failed" && page.generationError ? (
          <div className="border-t bg-rose-50 px-6 py-3 text-sm text-rose-700">
            Generation failed: {page.generationError}
          </div>
        ) : null}
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)_360px]">
        <aside className="border-r bg-white/70 p-4 overflow-y-auto">
          <DocsToc
            items={tocItems}
            activeId={tocSelection}
            onSelect={(id) => {
              if (id === "overview") setSelectedSection("hero");
              else if (id === "getting-started") setSelectedSection("getting-started");
              else if (id === "requirements") setSelectedSection("requirements");
              else if (id === "troubleshooting") setSelectedSection("troubleshooting");
              else if (id === "faq") setSelectedSection("faq");
              else setSelectedSection(`step:${draft?.steps.find((step) => step.anchorId === id)?.stepId || id}`);
            }}
          />
        </aside>

        <main className="overflow-y-auto bg-[#0a0f1a]">
          <div className="mx-auto max-w-5xl px-8 py-10">
            <DocumentationContentView
              guide={guide}
              content={content}
              generationInput={page?.generationInput}
            />
          </div>
        </main>

        <aside className="border-l bg-white p-5 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Section editor</div>
              <div className="text-xs text-muted-foreground">
                Edit the docs layer without touching the original guide.
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSelectedSection}
              disabled={!generatedContent}
              className={cn(!generatedContent && "pointer-events-none opacity-50")}
            >
              Reset
            </Button>
          </div>
          {renderEditorPanel()}
        </aside>
      </div>

      <DocsShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        guideTitle={guide.title || "Untitled guide"}
        guideId={guide.guideId}
        isPublished={isPublished}
      />

      <Dialog open={exportThemeDialogOpen} onOpenChange={setExportThemeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export React component</DialogTitle>
            <DialogDescription>Select a theme for the downloaded file style.</DialogDescription>
          </DialogHeader>
          <Select value={exportTheme} onValueChange={(value) => setExportTheme(value as DocsExportTheme)}>
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setExportThemeDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => handleExportReact(exportTheme)}>
              Download React file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
