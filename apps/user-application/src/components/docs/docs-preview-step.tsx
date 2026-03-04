import { ViewerCanvas } from "@/components/viewer-canvas";
import type { GuideDocsStep } from "@repo/data-ops/zod-schema";
import type { Step } from "@/types/db";

interface DocsPreviewStepProps {
  step: GuideDocsStep;
  sourceStep?: Step | null;
  index: number;
}

function renderParagraphs(value?: string) {
  if (!value?.trim()) return null;
  return value
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="text-base leading-7 text-slate-300 whitespace-pre-wrap">
        {paragraph.trim()}
      </p>
    ));
}

export function DocsPreviewStep({ step, sourceStep, index }: DocsPreviewStepProps) {
  return (
    <section id={step.anchorId} className="scroll-mt-24 space-y-5">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
          {index + 1}
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
          <div className="space-y-3">{renderParagraphs(step.bodyMd)}</div>
        </div>
      </div>

      {step.imageMode === "full" && sourceStep?.imageKey ? (
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <ViewerCanvas
            screenshotUrl={sourceStep.imageKey || undefined}
            overlays={sourceStep.overlays as any[]}
          />
        </div>
      ) : null}

      {step.calloutMd ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="space-y-2">{renderParagraphs(step.calloutMd)}</div>
        </div>
      ) : null}
    </section>
  );
}
