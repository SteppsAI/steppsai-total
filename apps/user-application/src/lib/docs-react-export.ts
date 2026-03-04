import type { GuideDocumentationContent } from "@repo/data-ops/zod-schema";
import type { Guide, Overlay, Step } from "@/types/db";

interface ExportableGuideStep {
	id: string;
	imageKey?: string | null;
	overlays?: Overlay[];
}

interface BuildDocsReactExportOptions {
	guide: Guide;
	content: GuideDocumentationContent;
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

function toPascalCase(value: string) {
	const cleaned = value
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.join("");

	return cleaned || "DocumentationExport";
}

function getExportFileBaseName(guide: Guide, content: GuideDocumentationContent) {
	return slugify(content.hero.title || guide.title || "documentation") || "documentation";
}

function getExportComponentName(guide: Guide, content: GuideDocumentationContent) {
	const pascal = toPascalCase(content.hero.title || guide.title || "DocumentationExport");
	return pascal.startsWith("Guide") ? `${pascal}Docs` : `Guide${pascal}Docs`;
}

function buildExportableGuide(guide: Guide) {
	return {
		title: guide.title || "Documentation",
		brandImageKey: guide.brandImageKey || null,
		steps: ((guide.steps || []) as Step[]).map(
			(step): ExportableGuideStep => ({
				id: step.id,
				imageKey: step.imageKey || null,
				overlays: Array.isArray(step.overlays) ? step.overlays : [],
			})
		),
	};
}

export function buildDocsReactExportSource({
	guide,
	content,
}: BuildDocsReactExportOptions) {
	const componentName = getExportComponentName(guide, content);
	const exportableGuide = buildExportableGuide(guide);
	const serializedGuide = JSON.stringify(exportableGuide, null, 2);
	const serializedContent = JSON.stringify(content, null, 2);

	return `import * as React from "react";

type Overlay =
  | {
      id: string;
      type: "arrow";
      points: [number, number, number, number];
      color: string;
      strokeWidth: number;
    }
  | {
      id: string;
      type: "circle";
      x: number;
      y: number;
      radius: number;
      color: string;
      strokeWidth: number;
    }
  | {
      id: string;
      type: "hide";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      text: string;
      fontSize: number;
      fontFamily?: string;
      fill: string;
      width?: number;
      rotation?: number;
    };

type SourceStep = {
  id: string;
  imageKey?: string | null;
  overlays?: Overlay[];
};

type DocsStep = {
  stepId: string;
  anchorId: string;
  title: string;
  bodyMd: string;
  calloutMd?: string;
  imageMode: "full" | "none";
};

type DocsContent = {
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  hero: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    estimatedMinutes?: number;
    heroStepId?: string;
  };
  overview: {
    summaryMd: string;
  };
  gettingStarted: {
    bullets: string[];
  };
  requirements?: {
    items: string[];
  };
  steps: DocsStep[];
  troubleshooting?: {
    items: Array<{
      problem: string;
      resolutionMd: string;
    }>;
  };
  faq?: {
    items: Array<{
      question: string;
      answerMd: string;
    }>;
  };
};

const GUIDE = ${serializedGuide} as const;
const CONTENT = ${serializedContent} as DocsContent;
const STEP_LOOKUP = Object.fromEntries(GUIDE.steps.map((step) => [step.id, step])) as Record<string, SourceStep>;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1a",
    color: "#ffffff",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(14px)",
    background: "rgba(10, 15, 26, 0.9)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  headerInner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "18px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    objectFit: "cover" as const,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  brandEyebrow: {
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "#94a3b8",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#ffffff",
  },
  headerBadge: {
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    color: "#cbd5e1",
    textDecoration: "none",
  },
  layout: {
    maxWidth: 1280,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "260px minmax(0, 1fr)",
    gap: 40,
    padding: "40px 24px 64px",
  },
  aside: {
    position: "sticky" as const,
    top: 100,
    alignSelf: "start" as const,
    borderRadius: 28,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    padding: 16,
  },
  tocList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  tocLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: 15,
    lineHeight: 1.45,
    display: "block",
    padding: "8px 10px",
    borderRadius: 12,
  },
  tocLinkNested: {
    paddingLeft: 22,
    fontSize: 14,
    color: "#94a3b8",
  },
  main: {
    minWidth: 0,
  },
  section: {
    marginBottom: 56,
    scrollMarginTop: 96,
  },
  heroTitle: {
    fontSize: "clamp(2.4rem, 6vw, 4rem)",
    lineHeight: 1.02,
    margin: "0 0 16px",
    fontWeight: 700,
    letterSpacing: "-0.04em",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.24em",
    textTransform: "uppercase" as const,
    color: "#fdba74",
    marginBottom: 16,
  },
  subtitle: {
    maxWidth: 780,
    fontSize: 18,
    lineHeight: 1.7,
    color: "#cbd5e1",
  },
  heroMeta: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 16,
    marginTop: 18,
    fontSize: 14,
    color: "#94a3b8",
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 650,
    margin: "0 0 16px",
    letterSpacing: "-0.03em",
  },
  paragraphWrap: {
    display: "grid",
    gap: 14,
    maxWidth: 820,
  },
  paragraph: {
    margin: 0,
    whiteSpace: "pre-wrap" as const,
    color: "#cbd5e1",
    lineHeight: 1.75,
    fontSize: 16,
  },
  panel: {
    borderRadius: 28,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    padding: 24,
  },
  list: {
    margin: 0,
    paddingLeft: 20,
    display: "grid",
    gap: 12,
    color: "#e2e8f0",
  },
  listItem: {
    lineHeight: 1.7,
  },
  stepsWrap: {
    display: "grid",
    gap: 48,
  },
  stepHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  },
  stepNumber: {
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#ffffff",
  },
  stepTitle: {
    fontSize: 28,
    lineHeight: 1.15,
    fontWeight: 650,
    margin: "0 0 12px",
    letterSpacing: "-0.03em",
  },
  screenshotCard: {
    position: "relative" as const,
    borderRadius: 28,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#111827",
    padding: 16,
    marginTop: 18,
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.35)",
  },
  screenshotViewport: {
    position: "relative" as const,
    overflow: "hidden" as const,
    borderRadius: 18,
    background: "#0f172a",
  },
  screenshotImage: {
    display: "block",
    width: "100%",
    height: "auto",
  },
  screenshotSvg: {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    overflow: "visible" as const,
    pointerEvents: "none" as const,
  },
  callout: {
    marginTop: 18,
    borderRadius: 20,
    border: "1px solid rgba(16, 185, 129, 0.24)",
    background: "rgba(16, 185, 129, 0.08)",
    padding: 18,
  },
  issueCard: {
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    padding: 24,
    marginTop: 16,
  },
  issueTitle: {
    margin: "0 0 12px",
    fontSize: 20,
    fontWeight: 600,
  },
} as const;

function renderParagraphs(value?: string, style?: React.CSSProperties) {
  if (!value || !value.trim()) return null;

  return value
    .split(/\\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} style={{ ...styles.paragraph, ...style }}>
        {paragraph.trim()}
      </p>
    ));
}

function renderOverlay(overlay: Overlay, index: number) {
  if (overlay.type === "arrow") {
    const markerId = \`arrowhead-\${overlay.id || index}\`;
    return (
      <g key={overlay.id || \`arrow-\${index}\`}>
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,8 L8,4 z" fill={overlay.color || "#4f46e5"} />
          </marker>
        </defs>
        <line
          x1={overlay.points[0]}
          y1={overlay.points[1]}
          x2={overlay.points[2]}
          y2={overlay.points[3]}
          stroke={overlay.color || "#4f46e5"}
          strokeWidth={overlay.strokeWidth || 4}
          strokeLinecap="round"
          markerEnd={\`url(#\${markerId})\`}
        />
      </g>
    );
  }

  if (overlay.type === "circle") {
    return (
      <circle
        key={overlay.id || \`circle-\${index}\`}
        cx={overlay.x}
        cy={overlay.y}
        r={overlay.radius}
        fill="none"
        stroke={overlay.color || "#f59e0b"}
        strokeWidth={overlay.strokeWidth || 3}
      />
    );
  }

  if (overlay.type === "hide") {
    return (
      <rect
        key={overlay.id || \`hide-\${index}\`}
        x={overlay.width < 0 ? overlay.x + overlay.width : overlay.x}
        y={overlay.height < 0 ? overlay.y + overlay.height : overlay.y}
        width={Math.abs(overlay.width)}
        height={Math.abs(overlay.height)}
        rx="2"
        fill={overlay.color || "#000000"}
        opacity="0.92"
      />
    );
  }

  if (overlay.type === "text") {
    return (
      <text
        key={overlay.id || \`text-\${index}\`}
        x={overlay.x}
        y={overlay.y}
        fill={overlay.fill || "#ffffff"}
        fontSize={overlay.fontSize || 20}
        fontFamily={overlay.fontFamily || "Arial"}
        transform={overlay.rotation ? \`rotate(\${overlay.rotation} \${overlay.x} \${overlay.y})\` : undefined}
      >
        {overlay.text}
      </text>
    );
  }

  return null;
}

function DocsScreenshot({ step, alt }: { step?: SourceStep; alt: string }) {
  if (!step?.imageKey) return null;

  return (
    <div style={styles.screenshotCard}>
      <div style={styles.screenshotViewport}>
        <img src={step.imageKey} alt={alt} style={styles.screenshotImage} />
        {Array.isArray(step.overlays) && step.overlays.length > 0 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={styles.screenshotSvg}>
            {step.overlays.map((overlay, index) => renderOverlay(overlay, index))}
          </svg>
        ) : null}
      </div>
    </div>
  );
}

function DocsHero() {
  const heroStep =
    (CONTENT.hero.heroStepId ? STEP_LOOKUP[CONTENT.hero.heroStepId] : undefined) ||
    GUIDE.steps.find((step) => Boolean(step.imageKey));

  return (
    <section style={styles.section}>
      {CONTENT.hero.eyebrow ? <div style={styles.eyebrow}>{CONTENT.hero.eyebrow}</div> : null}
      <h1 style={styles.heroTitle}>{CONTENT.hero.title}</h1>
      <div style={styles.subtitle}>{renderParagraphs(CONTENT.hero.subtitle, { color: "#cbd5e1", fontSize: 18 })}</div>
      <div style={styles.heroMeta}>
        {CONTENT.hero.estimatedMinutes ? <span>{CONTENT.hero.estimatedMinutes} min read</span> : null}
        <span>{CONTENT.steps.length} detailed steps</span>
      </div>
      <DocsScreenshot step={heroStep} alt={CONTENT.hero.title} />
    </section>
  );
}

function DocsOverview() {
  return (
    <section id="overview" style={styles.section}>
      <h2 style={styles.sectionTitle}>Overview</h2>
      <div style={styles.paragraphWrap}>{renderParagraphs(CONTENT.overview.summaryMd)}</div>
    </section>
  );
}

function DocsGettingStarted() {
  if (!CONTENT.gettingStarted.bullets.length) return null;

  return (
    <section id="getting-started" style={styles.section}>
      <h2 style={styles.sectionTitle}>Get started</h2>
      <div style={styles.panel}>
        <ol style={styles.list}>
          {CONTENT.gettingStarted.bullets.map((bullet, index) => (
            <li key={index} style={styles.listItem}>
              {bullet.replace(/^\\d+\\.\\s*/, "")}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function DocsRequirements() {
  if (!CONTENT.requirements?.items?.length) return null;

  return (
    <section id="requirements" style={styles.section}>
      <h2 style={styles.sectionTitle}>Requirements</h2>
      <div style={styles.panel}>
        <ul style={styles.list}>
          {CONTENT.requirements.items.map((item, index) => (
            <li key={index} style={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DocsSteps() {
  return (
    <section id="steps" style={styles.section}>
      <h2 style={styles.sectionTitle}>Detailed steps</h2>
      <div style={styles.stepsWrap}>
        {CONTENT.steps.map((step, index) => {
          const sourceStep = STEP_LOOKUP[step.stepId];
          return (
            <section key={step.stepId} id={step.anchorId} style={{ scrollMarginTop: 96 }}>
              <div style={styles.stepHeader}>
                <div style={styles.stepNumber}>{index + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <div style={styles.paragraphWrap}>{renderParagraphs(step.bodyMd)}</div>
                </div>
              </div>
              {step.imageMode === "full" ? <DocsScreenshot step={sourceStep} alt={step.title} /> : null}
              {step.calloutMd ? (
                <div style={styles.callout}>
                  <div style={styles.paragraphWrap}>{renderParagraphs(step.calloutMd, { color: "#d1fae5" })}</div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function DocsTroubleshooting() {
  if (!CONTENT.troubleshooting?.items?.length) return null;

  return (
    <section id="troubleshooting" style={styles.section}>
      <h2 style={styles.sectionTitle}>Troubleshooting</h2>
      {CONTENT.troubleshooting.items.map((item, index) => (
        <div key={index} style={styles.issueCard}>
          <h3 style={styles.issueTitle}>{item.problem}</h3>
          <div style={styles.paragraphWrap}>{renderParagraphs(item.resolutionMd)}</div>
        </div>
      ))}
    </section>
  );
}

function DocsFaq() {
  if (!CONTENT.faq?.items?.length) return null;

  return (
    <section id="faq" style={styles.section}>
      <h2 style={styles.sectionTitle}>FAQ</h2>
      {CONTENT.faq.items.map((item, index) => (
        <div key={index} style={styles.issueCard}>
          <h3 style={styles.issueTitle}>{item.question}</h3>
          <div style={styles.paragraphWrap}>{renderParagraphs(item.answerMd)}</div>
        </div>
      ))}
    </section>
  );
}

export default function ${componentName}() {
  const tocItems = React.useMemo(
    () => [
      { id: "overview", label: "Overview", nested: false },
      { id: "getting-started", label: "Get started", nested: false },
      ...(CONTENT.requirements?.items?.length ? [{ id: "requirements", label: "Requirements", nested: false }] : []),
      { id: "steps", label: "Detailed steps", nested: false },
      ...CONTENT.steps.map((step) => ({ id: step.anchorId, label: step.title, nested: true })),
      ...(CONTENT.troubleshooting?.items?.length ? [{ id: "troubleshooting", label: "Troubleshooting", nested: false }] : []),
      ...(CONTENT.faq?.items?.length ? [{ id: "faq", label: "FAQ", nested: false }] : []),
    ],
    []
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            {GUIDE.brandImageKey ? (
              <img src={GUIDE.brandImageKey} alt="Brand" style={styles.brandImage} />
            ) : null}
            <div>
              <div style={styles.headerTitle}>{GUIDE.title}</div>
              <div style={styles.brandEyebrow}>Documentation</div>
            </div>
          </div>
          <a href="https://stepps.ai" target="_blank" rel="noreferrer" style={styles.headerBadge}>
            Powered by Stepps
          </a>
        </div>
      </header>

      <div style={styles.layout}>
        <aside style={styles.aside}>
          <ul style={styles.tocList}>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={\`#\${item.id}\`}
                  style={{
                    ...styles.tocLink,
                    ...(item.nested ? styles.tocLinkNested : {}),
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main style={styles.main}>
          <DocsHero />
          <DocsOverview />
          <DocsGettingStarted />
          <DocsRequirements />
          <DocsSteps />
          <DocsTroubleshooting />
          <DocsFaq />
        </main>
      </div>
    </div>
  );
}
`;
}

export function downloadDocsReactExport({
	guide,
	content,
}: BuildDocsReactExportOptions) {
	const source = buildDocsReactExportSource({ guide, content });
	const fileName = `guide-${getExportFileBaseName(guide, content)}.tsx`;
	const blob = new Blob([source], { type: "text/tsx;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);

	return { fileName };
}
