import type { Guide, Step } from "@/types/db";

interface GuideExportTemplateProps {
  guide: Guide;
  assetsUrl: string;
}

export function GuideExportTemplate({ guide, assetsUrl }: GuideExportTemplateProps) {
  const steps = (guide.steps ?? []) as Step[];

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{guide.title}</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Space+Grotesk:wght@300..700&display=swap');

            /* Reset */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: "Inter", sans-serif;
              background: #ffffff;
              /* Matching the body gradient from globals.css */
              background: linear-gradient(to bottom right, #ffffff, #f8fafc, #f1f5f9);
              color: #0B0F19; /* --foreground */
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
              min-height: 100vh;
            }

            /* Container - max-w-3xl (768px content) mx-auto p-6 py-12 md:py-16 */
            .container {
              max-width: 48rem; /* 768px */
              margin: 0 auto;
              padding: 64px 24px;
            }

            /* Header - space-y-6 text-center border-b pb-12 */
            .header {
              text-align: center;
              border-bottom: 1px solid #E2E8F0; /* --border */
              padding-bottom: 48px; /* pb-12 */
              margin-bottom: 64px; /* space-y-16 spacer */
            }

            /* Title - text-3xl md:text-5xl font-bold tracking-tight text-foreground */
            h1 {
              font-family: "Space Grotesk", sans-serif;
              font-size: 3rem; /* md:text-5xl */
              font-weight: 700;
              letter-spacing: -0.025em; /* tracking-tight */
              color: #0B0F19; /* --foreground */
              margin-bottom: 16px; /* space-y-4 gap */
              line-height: 1.2;
            }

            /* Description - text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto */
            .description {
              font-size: 1.25rem; /* text-xl */
              color: #475569; /* --muted-foreground */
              line-height: 1.625; /* leading-relaxed */
              max-width: 42rem; /* max-w-2xl */
              margin: 0 auto 16px;
            }

            /* Meta - text-sm text-muted-foreground */
            .meta {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              font-size: 0.875rem; /* text-sm */
              color: #475569; /* --muted-foreground */
              margin-top: 24px; /* Adjust for space-y-4 in header group */
            }

            /* Steps List - space-y-20 */
            .steps {
              display: flex;
              flex-direction: column;
              gap: 80px; /* space-y-20 = 5rem = 80px */
            }

            /* Step Item - space-y-6 */
            .step {
              display: flex;
              flex-direction: column;
              gap: 24px; /* space-y-6 = 1.5rem = 24px */
              page-break-inside: avoid;
            }

            /* Step Header - flex items-start gap-4 */
            .step-header {
              display: flex;
              align-items: flex-start;
              gap: 16px; /* gap-4 */
            }

            /* Number - flex-none flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-bold text-sm mt-1 */
            .step-number {
              flex: none;
              width: 32px; /* size-8 */
              height: 32px;
              border-radius: 9999px; /* rounded-full */
              background: rgba(99, 102, 241, 0.1); /* bg-primary/10 */
              color: #6366F1; /* text-primary */
              font-weight: 700;
              font-size: 0.875rem; /* text-sm */
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 4px; /* mt-1 */
            }

            /* Title - text-xl md:text-2xl font-medium text-foreground leading-snug */
            .step-title {
              font-family: "Space Grotesk", sans-serif;
              font-size: 1.5rem; /* md:text-2xl */
              font-weight: 500; /* font-medium */
              color: #0B0F19; /* --foreground */
              line-height: 1.375; /* leading-snug */
              padding-top: 4px; /* pt-1 in wrapper */
            }

            /* Screenshot - rounded-xl border overflow-hidden shadow-sm bg-muted/10 ring-1 ring-black/5 */
            .screenshot-container {
              border-radius: 0.75rem; /* rounded-xl */
              border: 1px solid #E2E8F0; /* border */
              overflow: hidden;
              background: rgba(226, 232, 240, 0.1); /* bg-muted/10 (slate-200 @ 10%) */
              /* shadow-sm + ring-1 ring-black/5 */
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05);
              position: relative;
            }

            .screenshot-img {
              width: 100%;
              height: auto;
              display: block;
              object-fit: contain;
              background: #ffffff;
            }

            /* Overlays */
            .overlays {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
            }

            @media (max-width: 768px) {
              .container {
                padding: 48px 24px;
              }
              h1 {
                font-size: 1.875rem; /* text-3xl */
              }
              .step-title {
                font-size: 1.25rem; /* text-xl */
              }
            }

            @media print {
              body {
                background: white;
              }
              .container {
                padding: 0;
                max-width: 100%;
              }
              .step {
                break-inside: avoid;
              }
              .header {
                margin-bottom: 48px;
                padding-bottom: 32px;
              }
              /* Ensure background colors print */
              .step-number {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>{guide.title}</h1>
            {guide.description && (
              <p className="description">{guide.description}</p>
            )}
            <div className="meta">
              <span>{steps.length} steps</span>
              <span>•</span>
              <span>Last updated {new Date(guide.updatedAt || new Date()).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="steps">
            {steps.map((step, index) => (
              <div key={step.id || index} className="step">
                <div className="step-header">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-title">
                    {step.caption || step.aiCaption || `Step ${index + 1}`}
                  </div>
                </div>

                {step.imageKey && (
                  <div className="screenshot-container">
                    <img
                      src={`${assetsUrl}/${step.imageKey}`}
                      alt={`Step ${index + 1}`}
                      className="screenshot-img"
                    />

                    {step.overlays && step.overlays.length > 0 && (
                      <svg className="overlays" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {step.overlays.map((overlay: any) => {
                          if (overlay.type === 'circle') {
                            return (
                              <circle
                                key={overlay.id}
                                cx={overlay.x}
                                cy={overlay.y}
                                r={overlay.radius}
                                fill="none"
                                stroke={overlay.color}
                                strokeWidth={overlay.strokeWidth || 3}
                              />
                            );
                          }
                          return null;
                        })}
                      </svg>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}
