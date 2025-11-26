export function TutorialsSection() {
  const steps = [
    {
      number: 1,
      title: "Install Extension",
      description: "Add the browser extension to start recording your workflows",
    },
    {
      number: 2,
      title: "Record Your First Flow",
      description: "Click record and perform a task - we'll capture every step",
    },
    {
      number: 3,
      title: "Edit & Enhance",
      description: "Customize your guide in the editor with annotations",
    },
    {
      number: 4,
      title: "Share with Team",
      description: "Export or share your workflow instantly",
    },
  ];

  return (
    <section className="w-full">
      <h3 className="text-xl font-semibold text-foreground mb-4">Quick Start Guide</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {step.number}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-1 text-foreground">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
