interface Step {
    id: number;
    title: string;
    image: string;
}

interface StepPreviewProps {
    step?: Step;
}

export function StepPreview({ step }: StepPreviewProps) {
    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center space-y-3 min-h-0">
            <p className="text-sm font-medium text-foreground text-center line-clamp-2 px-2">
                {step?.title || 'Ready to capture...'}
            </p>
            <div className="w-full aspect-video bg-muted rounded-lg border border-border shadow-sm overflow-hidden relative group">
                {step?.image ? (
                    <img
                        src={step.image}
                        alt="Step Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-50">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center">
                                <div className="w-8 h-1 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                )}
                {/* Overlay gradient/ring */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg pointer-events-none" />
            </div>
        </div>
    );
}
