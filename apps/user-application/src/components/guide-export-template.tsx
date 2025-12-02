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
            /* Reset & Base */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background: #ffffff;
              color: #000000;
              line-height: 1.5;
            }

            /* Container - mimics max-w-3xl mx-auto p-6 py-12 md:py-16 */
            .container {
              max-width: 768px;
              margin: 0 auto;
              padding: 48px 24px;
            }

            @media (min-width: 768px) {
              .container {
                padding: 64px 24px;
              }
            }

            /* Header - mimics space-y-6 text-center border-b pb-12 */
            .header {
              text-align: center;
              padding-bottom: 48px;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 64px;
            }

            .header-content {
              margin-bottom: 24px;
            }

            /* Badge - mimics uppercase tracking-wider text-[10px] */
            .badge {
              display: inline-block;
              padding: 2px 8px;
              background: #000;
              color: #fff;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 16px;
            }

            .badge-secondary {
              background: #6b7280;
            }

            /* Title - mimics text-3xl md:text-5xl font-bold tracking-tight */
            h1 {
              font-size: 1.875rem;
              font-weight: 700;
              letter-spacing: -0.025em;
              margin-bottom: 16px;
              color: #000;
            }

            @media (min-width: 768px) {
              h1 {
                font-size: 3rem;
              }
            }

            /* Description - mimics text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto */
            .description {
              font-size: 1.25rem;
              color: #6b7280;
              line-height: 1.75;
              max-width: 672px;
              margin: 0 auto 24px;
            }

            /* Meta - mimics flex items-center justify-center gap-4 text-sm text-muted-foreground */
            .meta {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 16px;
              font-size: 0.875rem;
              color: #6b7280;
            }

            /* Steps - mimics space-y-20 */
            .steps {
              display: flex;
              flex-direction: column;
              gap: 80px;
            }

            /* Step - mimics space-y-6 group */
            .step {
              display: flex;
              flex-direction: column;
              gap: 24px;
            }

            /* Step content - mimics flex flex-col gap-4 */
            .step-content {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }

            /* Step header - mimics flex items-start gap-4 */
            .step-header {
              display: flex;
              align-items: flex-start;
              gap: 16px;
            }

            /* Step number - mimics flex-none flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-bold text-sm mt-1 */
            .step-number {
              flex-shrink: 0;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(99, 102, 241, 0.1); /* #6366F1 with 10% opacity */
              color: #6366F1; /* Primary brand color */
              font-weight: 700;
              font-size: 0.875rem;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 4px;
            }

            /* Step title wrapper - mimics space-y-2 pt-1 */
            .step-title-wrapper {
              padding-top: 4px;
            }

            /* Step title - mimics text-xl md:text-2xl font-medium text-foreground leading-snug */
            .step h2 {
              font-size: 1.25rem;
              font-weight: 500;
              line-height: 1.4;
              color: #000;
            }

            @media (min-width: 768px) {
              .step h2 {
                font-size: 1.5rem;
              }
            }

            /* Screenshot container - mimics rounded-xl border overflow-hidden shadow-sm bg-muted/10 ring-1 ring-black/5 */
            .screenshot {
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              overflow: hidden;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              background: rgba(249, 250, 251, 0.1);
              position: relative;
            }

            /* Screenshot image - mimics w-full h-auto object-contain bg-white */
            .screenshot img {
              width: 100%;
              height: auto;
              display: block;
              object-fit: contain;
              background: #fff;
            }

            /* Overlays SVG */
            .overlays {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              pointer-events: none;
            }

            /* Print optimizations */
            @media print {
              .container {
                padding: 24px;
              }
              
              .step {
                page-break-inside: avoid;
              }
              
              .screenshot {
                page-break-inside: avoid;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="header-content">
              <h1>{guide.title}</h1>
              {guide.description && (
                <p className="description">{guide.description}</p>
              )}
            </div>
            <div className="meta">
              <span>{steps.length} steps</span>
            </div>
          </div>

          {/* Steps */}
          <div className="steps">
            {steps.map((step, index) => (
              <div key={step.id || index} className="step">
                <div className="step-content">
                  <div className="step-header">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-title-wrapper">
                      <h2>{step.caption || step.aiCaption || `Step ${index + 1}`}</h2>
                    </div>
                  </div>
                </div>

                {/* Screenshot */}
                {step.imageKey && (
                  <div className="screenshot">
                    <img
                      src={`${assetsUrl}/${step.imageKey}`}
                      alt={`Step ${index + 1}`}
                    />

                    {/* Overlays */}
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
                                stroke-width={overlay.strokeWidth || 3}
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
