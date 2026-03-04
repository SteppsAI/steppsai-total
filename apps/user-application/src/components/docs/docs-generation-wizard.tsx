import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type {
  DocsTone,
  GuideDocsGenerationInput,
} from "@repo/data-ops/zod-schema";

interface DocsGenerationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guideTitle?: string | null;
  defaultValue?: Partial<GuideDocsGenerationInput> | null;
  onSubmit: (input: GuideDocsGenerationInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

const toneOptions: DocsTone[] = ["friendly", "technical", "developer", "executive"];

const steps = [
  { id: "basics", title: "Basics" },
  { id: "outcome", title: "Outcome" },
  { id: "prerequisites", title: "Prerequisites" },
  { id: "support", title: "Support & edge cases" },
  { id: "review", title: "Review" },
] as const;

function buildInitialValue(
  guideTitle?: string | null,
  defaultValue?: Partial<GuideDocsGenerationInput> | null
): GuideDocsGenerationInput {
  return {
    productName: defaultValue?.productName || "",
    featureName: defaultValue?.featureName || guideTitle || "",
    audience: defaultValue?.audience || "new teammates",
    jobToBeDone: defaultValue?.jobToBeDone || guideTitle || "",
    prerequisites: defaultValue?.prerequisites || [],
    troubleshootingContext: defaultValue?.troubleshootingContext || "",
    faqContext: defaultValue?.faqContext || "",
    supportContact: defaultValue?.supportContact || "",
    brandVoice: defaultValue?.brandVoice || "",
    tone: defaultValue?.tone || "friendly",
    includeRequirements: defaultValue?.includeRequirements ?? true,
    includeTroubleshooting: defaultValue?.includeTroubleshooting ?? true,
    includeFaq: defaultValue?.includeFaq ?? false,
  };
}

export function DocsGenerationWizard({
  open,
  onOpenChange,
  guideTitle,
  defaultValue,
  onSubmit,
  isSubmitting = false,
}: DocsGenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<GuideDocsGenerationInput>(
    buildInitialValue(guideTitle, defaultValue)
  );

  useEffect(() => {
    if (!open) return;
    setCurrentStep(0);
    setForm(buildInitialValue(guideTitle, defaultValue));
  }, [open, guideTitle, defaultValue]);

  const prerequisitesValue = useMemo(
    () => form.prerequisites.join("\n"),
    [form.prerequisites]
  );

  function updateForm<K extends keyof GuideDocsGenerationInput>(
    key: K,
    value: GuideDocsGenerationInput[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const canContinue = (() => {
    if (currentStep === 0) {
      return Boolean(form.productName.trim() && form.audience.trim() && form.tone);
    }

    if (currentStep === 1) {
      return Boolean(form.jobToBeDone.trim());
    }

    return true;
  })();

  async function handleSubmit() {
    await onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden gap-0">
        <DialogHeader className="border-b px-6 py-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className={index === currentStep ? "text-primary" : ""}>{step.title}</span>
                {index < steps.length - 1 ? <span>•</span> : null}
              </div>
            ))}
          </div>
          <DialogTitle>Generate docs from this Stepp</DialogTitle>
          <DialogDescription>
            Capture stays the source of truth. This wizard adds the product context the docs page needs.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {currentStep === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productName">Product name</Label>
                <Input
                  id="productName"
                  value={form.productName}
                  onChange={(e) => updateForm("productName", e.target.value)}
                  placeholder="Stepps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featureName">Feature / workflow name</Label>
                <Input
                  id="featureName"
                  value={form.featureName || ""}
                  onChange={(e) => updateForm("featureName", e.target.value)}
                  placeholder="Getting started"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  value={form.audience}
                  onChange={(e) => updateForm("audience", e.target.value)}
                  placeholder="new team members"
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={(value) => updateForm("tone", value as DocsTone)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="brandVoice">Brand voice</Label>
                <Input
                  id="brandVoice"
                  value={form.brandVoice || ""}
                  onChange={(e) => updateForm("brandVoice", e.target.value)}
                  placeholder="Direct, pragmatic, product-led"
                />
              </div>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="jobToBeDone">What should the user accomplish?</Label>
                <Textarea
                  id="jobToBeDone"
                  value={form.jobToBeDone}
                  onChange={(e) => updateForm("jobToBeDone", e.target.value)}
                  placeholder="Set up the first workflow and invite teammates"
                  rows={5}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-1">
                  <div className="font-medium">Include requirements section</div>
                  <div className="text-sm text-muted-foreground">
                    Let the docs page show prerequisites separately.
                  </div>
                </div>
                <Switch
                  checked={form.includeRequirements}
                  onCheckedChange={(checked) => updateForm("includeRequirements", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={prerequisitesValue}
                  onChange={(e) =>
                    updateForm(
                      "prerequisites",
                      e.target.value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder={"Access to the workspace\nAdmin permissions\nDesktop browser"}
                  rows={6}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-1">
                  <div className="font-medium">Include troubleshooting</div>
                  <div className="text-sm text-muted-foreground">
                    Generate a troubleshooting section from the workflow and your notes.
                  </div>
                </div>
                <Switch
                  checked={form.includeTroubleshooting}
                  onCheckedChange={(checked) => updateForm("includeTroubleshooting", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="troubleshootingContext">Troubleshooting context</Label>
                <Textarea
                  id="troubleshootingContext"
                  value={form.troubleshootingContext || ""}
                  onChange={(e) => updateForm("troubleshootingContext", e.target.value)}
                  placeholder="Common issue: users are in the wrong workspace or lack admin rights."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-1">
                  <div className="font-medium">Include FAQ</div>
                  <div className="text-sm text-muted-foreground">
                    Add a short FAQ block at the bottom of the page.
                  </div>
                </div>
                <Switch
                  checked={form.includeFaq}
                  onCheckedChange={(checked) => updateForm("includeFaq", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faqContext">FAQ hints</Label>
                <Textarea
                  id="faqContext"
                  value={form.faqContext || ""}
                  onChange={(e) => updateForm("faqContext", e.target.value)}
                  placeholder="Mention that the UI may differ between staging and production."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportContact">Support contact</Label>
                <Input
                  id="supportContact"
                  value={form.supportContact || ""}
                  onChange={(e) => updateForm("supportContact", e.target.value)}
                  placeholder="support@company.com"
                />
              </div>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border bg-muted/30 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Product</div>
                    <div className="font-medium">{form.productName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Workflow</div>
                    <div className="font-medium">{form.featureName || "Use guide title"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Audience</div>
                    <div className="font-medium">{form.audience}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tone</div>
                    <div className="font-medium capitalize">{form.tone}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Goal</div>
                <div className="rounded-2xl border p-4 whitespace-pre-wrap">{form.jobToBeDone}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Prerequisites</div>
                <div className="rounded-2xl border p-4">
                  {form.prerequisites.length ? form.prerequisites.join(", ") : "No explicit prerequisites"}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t px-6 py-4 flex-row items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (currentStep === 0 ? onOpenChange(false) : setCurrentStep((current) => current - 1))}
            disabled={isSubmitting}
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep((current) => current + 1)} disabled={!canContinue}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate docs
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
