import type {
	Guide,
	GuideDocumentationContent,
	Step,
} from "@repo/data-ops/zod-schema";

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function renderGuideDocsHtml(
	guide: Guide,
	content: GuideDocumentationContent,
	imageMap: Record<string, string>
) {
	const steps = ((guide.steps || []) as Step[]).filter((step) => !step.isExcluded);
	const stepLookup = new Map(steps.map((step) => [step.id, step]));

	const tocItems = [
		["overview", "Overview"],
		["getting-started", "Get started"],
		content.requirements ? ["requirements", "Requirements"] : null,
		["steps", "Detailed steps"],
		content.troubleshooting ? ["troubleshooting", "Troubleshooting"] : null,
		content.faq ? ["faq", "FAQ"] : null,
	]
		.filter((item): item is [string, string] => Array.isArray(item))
		.map(([anchor, label]) => `<a href="#${anchor}">${label}</a>`)
		.join("");

	const stepSections = content.steps
		.map((step, index) => {
			const sourceStep = stepLookup.get(step.stepId);
			const imageUrl = sourceStep?.imageKey ? imageMap[step.stepId] : null;

			return `
				<section id="${step.anchorId}" class="docs-step">
					<div class="step-index">${index + 1}</div>
					<div class="step-body">
						<h3>${escapeHtml(step.title)}</h3>
						<p>${escapeHtml(step.bodyMd)}</p>
						${step.calloutMd ? `<div class="callout">${escapeHtml(step.calloutMd)}</div>` : ""}
						${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(step.title)}" />` : ""}
					</div>
				</section>
			`;
		})
		.join("");

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>${escapeHtml(content.seo.metaTitle)}</title>
	<meta name="description" content="${escapeHtml(content.seo.metaDescription)}" />
	<style>
		body { margin: 0; font-family: Inter, sans-serif; background: #111318; color: #f3f4f6; }
		.shell { display: grid; grid-template-columns: 260px minmax(0, 1fr); min-height: 100vh; }
		nav { padding: 32px 20px; position: sticky; top: 0; height: 100vh; border-right: 1px solid rgba(255,255,255,.08); }
		nav a { display: block; color: #9ca3af; text-decoration: none; margin-bottom: 12px; }
		main { max-width: 880px; padding: 48px 40px 96px; }
		.hero-image, .docs-step img { width: 100%; border-radius: 20px; border: 1px solid rgba(255,255,255,.08); background: #1f2937; }
		.docs-step { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 20px; margin: 40px 0; }
		.step-index { width: 40px; height: 40px; display:flex; align-items:center; justify-content:center; border-radius:9999px; background: rgba(99,102,241,.18); color:#c7d2fe; font-weight:700; }
		.callout { padding: 14px 16px; border-left: 3px solid #818cf8; background: rgba(99,102,241,.1); margin: 16px 0; border-radius: 8px; }
		section { margin-bottom: 40px; }
		h1,h2,h3 { line-height: 1.1; }
		p, li { color: #d1d5db; line-height: 1.7; }
	</style>
</head>
<body>
	<div class="shell">
		<nav>${tocItems}</nav>
		<main>
			<section>
				<p>${escapeHtml(content.hero.eyebrow || guide.title || "Documentation")}</p>
				<h1>${escapeHtml(content.hero.title)}</h1>
				<p>${escapeHtml(content.hero.subtitle)}</p>
			</section>
			<section id="overview">
				<h2>Overview</h2>
				<p>${escapeHtml(content.overview.summaryMd)}</p>
			</section>
			<section id="getting-started">
				<h2>Get started</h2>
				<ul>${content.gettingStarted.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
			</section>
			${content.requirements ? `<section id="requirements"><h2>Requirements</h2><ul>${content.requirements.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}
			<section id="steps">
				<h2>Detailed steps</h2>
				${stepSections}
			</section>
			${content.troubleshooting ? `<section id="troubleshooting"><h2>Troubleshooting</h2>${content.troubleshooting.items.map((item) => `<div><h3>${escapeHtml(item.problem)}</h3><p>${escapeHtml(item.resolutionMd)}</p></div>`).join("")}</section>` : ""}
			${content.faq ? `<section id="faq"><h2>FAQ</h2>${content.faq.items.map((item) => `<div><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answerMd)}</p></div>`).join("")}</section>` : ""}
		</main>
	</div>
</body>
</html>`;
}
