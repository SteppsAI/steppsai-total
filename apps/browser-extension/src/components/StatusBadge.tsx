interface StatusBadgeProps {
    status: 'recording' | 'paused';
    stepCount: number;
}

export function StatusBadge({ status, stepCount }: StatusBadgeProps) {
    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full bg-accent ${status === 'recording' ? 'animate-pulse' : ''}`}
                />
                <span className="font-medium text-lg text-foreground capitalize">
                    {status}
                </span>
            </div>
            <span className="text-muted-foreground text-sm">
                ({stepCount} steps captured)
            </span>
        </div>
    );
}
