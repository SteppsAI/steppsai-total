import { DocsToc, type DocsTocItem } from "@/components/docs/docs-toc";
import { DocsPreviewStep } from "@/components/docs/docs-preview-step";
import { ViewerCanvas } from "@/components/viewer-canvas";
import type {
  GuideDocumentationContent,
  GuideDocsGenerationInput,
} from "@repo/data-ops/zod-schema";
import type { Guide, Step } from "@/types/db";
import { cn } from "@/lib/utils";

interface DocumentationContentViewProps {
  guide: Guide;
  content: GuideDocumentationContent;
  generationInput?: GuideDocsGenerationInput | null;
  className?: string;
}

function renderParagraphs(value?: string, className?: string) {
  if (!value?.trim()) return null;
  return value
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className={cn("whitespace-pre-wrap", className)}>
        {paragraph.trim()}
      </p>
    ));
}

function buildSectionItems(content: GuideDocumentationContent): DocsTocItem[] {
  const steps = content.steps || [];
  const items: DocsTocItem[] = [
    { id: "overview", label: "Overview" },
    { id: "getting-started", label: "Get started" },
  ];

  if (content.requirements?.items?.length) {
    items.push({ id: "requirements", label: "Requirements" });
  }

  items.push({ id: "steps", label: "Detailed steps" });
  items.push(
    ...steps.map((step) => ({
      id: step.anchorId,
      label: step.title,
      level: 2 as const,
    }))
  );

  if (content.troubleshooting?.items?.length) {
    items.push({ id: "troubleshooting", label: "Troubleshooting" });
  }

  if (content.faq?.items?.length) {
    items.push({ id: "faq", label: "FAQ" });
  }

  return items;
}

export function DocumentationContentView({
  guide,
  content,
  generationInput,
  className,
}: DocumentationContentViewProps) {
  const steps = (guide.steps || []) as Step[];
  const docSteps = content.steps || [];
  const gettingStartedBullets = content.gettingStarted?.bullets || [];
  const heroStep = content.hero?.heroStepId
    ? steps.find((step) => step.id === content.hero.heroStepId)
    : steps.find((step) => step.imageKey);

  return (
    <div className={cn("space-y-12", className)}>
      <section className="space-y-6">
        <div className="space-y-3">
          {content.hero?.eyebrow ? (
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300/80">
              {content.hero.eyebrow}
            </div>
          ) : null}
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {content.hero.title}
          </h1>
          <div className="max-w-3xl space-y-3 text-lg leading-8 text-slate-300">
            {renderParagraphs(content.hero.subtitle)}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            {content.hero?.estimatedMinutes ? (
              <span>{content.hero.estimatedMinutes} min read</span>
            ) : null}
            <span>{docSteps.length} detailed steps</span>
            {generationInput?.supportContact ? (
              <span>Support: {generationInput.supportContact}</span>
            ) : null}
          </div>
        </div>

        {heroStep?.imageKey ? (
          <div className="rounded-[2rem] border border-white/10 bg-[#111827] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <ViewerCanvas
              screenshotUrl={heroStep.imageKey || undefined}
              overlays={heroStep.overlays as any[]}
            />
          </div>
        ) : null}
      </section>

      <section id="overview" className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Overview</h2>
        <div className="max-w-3xl space-y-3 text-base leading-7 text-slate-300">
          {renderParagraphs(content.overview.summaryMd, "text-base leading-7 text-slate-300")}
        </div>
      </section>

      <section id="getting-started" className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Get started</h2>
        <ol className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
          {gettingStartedBullets.map((bullet, index) => (
            <li key={index} className="flex gap-3 text-slate-200">
              <span className="mt-0.5 text-sm font-semibold text-orange-300">{index + 1}.</span>
              <span className="leading-7">{bullet.replace(/^\d+\.\s*/, "")}</span>
            </li>
          ))}
        </ol>
      </section>

      {content.requirements?.items?.length ? (
        <section id="requirements" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Requirements</h2>
          <ul className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
            {content.requirements.items.map((item, index) => (
              <li key={index} className="flex gap-3 text-slate-200">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-300" />
                <span className="leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section id="steps" className="scroll-mt-24 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Detailed steps</h2>
          <p className="text-slate-400">
            Use the screenshots and annotations as the source of truth for the exact UI.
          </p>
        </div>

        <div className="space-y-12">
          {docSteps.map((step, index) => (
            <DocsPreviewStep
              key={step.stepId}
              step={step}
              sourceStep={steps.find((candidate) => candidate.id === step.stepId)}
              index={index}
            />
          ))}
        </div>
      </section>

      {content.troubleshooting?.items?.length ? (
        <section id="troubleshooting" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Troubleshooting</h2>
          <div className="space-y-4">
            {content.troubleshooting.items.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-lg font-medium text-white">{item.problem}</h3>
                <div className="mt-3 space-y-3 text-slate-300">
                  {renderParagraphs(item.resolutionMd, "text-base leading-7 text-slate-300")}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {content.faq?.items?.length ? (
        <section id="faq" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-semibold text-white">FAQ</h2>
          <div className="space-y-4">
            {content.faq.items.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-lg font-medium text-white">{item.question}</h3>
                <div className="mt-3 space-y-3 text-slate-300">
                  {renderParagraphs(item.answerMd, "text-base leading-7 text-slate-300")}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

interface PublicDocsPageProps {
  guide: Guide;
  content: GuideDocumentationContent;
  generationInput?: GuideDocsGenerationInput | null;
}

export function PublicDocsPage({ guide, content, generationInput }: PublicDocsPageProps) {
  const tocItems = buildSectionItems(content);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0f1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {guide.brandImageKey ? (
              <img
                src={guide.brandImageKey}
                alt="Brand"
                className="h-9 w-9 rounded-lg border border-white/10 object-cover"
              />
            ) : null}
            <div>
              <div className="text-base font-semibold text-white">{generationInput?.productName || guide.title}</div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Documentation</div>
            </div>
          </div>
          <a
            href="https://stepps.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Powered by Stepps
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-white/10 bg-white/5 p-4">
            <DocsToc items={tocItems} />
          </div>
        </aside>

        <main>
          <DocumentationContentView
            guide={guide}
            content={content}
            generationInput={generationInput}
          />
        </main>
      </div>
    </div>
  );
}

export function buildDocsTocItems(content: GuideDocumentationContent) {
  return buildSectionItems(content);
}
