import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface StepEditorProps {
  steps: Array<{
    id: string;
    screenshotUrl?: string;
    finalCaption?: string;
    orderIndex: number;
  }>;
  onUpdateStep: (id: string, caption: string) => void;
  onDeleteStep: (id: string) => void;
}

export function StepEditor({ steps, onUpdateStep, onDeleteStep }: StepEditorProps) {
  return (
    <div className="w-80 border-r bg-muted/50 overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Steps</h2>
      </div>
      <div className="p-2 space-y-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
            <div className="flex-shrink-0 mt-1">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                {step.screenshotUrl ? (
                  <img src={step.screenshotUrl} alt={`Step ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Step {index + 1}
                  </div>
                )}
              </div>
              <textarea
                value={step.finalCaption || ""}
                onChange={(e) => onUpdateStep(step.id, e.target.value)}
                placeholder="Describe this step..."
                className="w-full min-h-[80px] text-sm p-2 rounded-md border border-input bg-background"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteStep(step.id)}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}