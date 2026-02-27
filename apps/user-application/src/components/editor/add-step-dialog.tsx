import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Type, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepType = "text" | "image";

interface AddStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTextStep: (title: string) => void;
  onAddImageStep: (step: { title: string; file: File; previewUrl: string }) => void;
  onImportFromExisting?: () => void;
  nextStepNumber: number;
}

export function AddStepDialog({
  open,
  onOpenChange,
  onAddTextStep,
  onAddImageStep,
  onImportFromExisting,
  nextStepNumber,
}: AddStepDialogProps) {
  const [selectedType, setSelectedType] = useState<StepType | null>(null);
  const [textStepTitle, setTextStepTitle] = useState("");
  const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl: string } | null>(null);
  const [imageStepTitle, setImageStepTitle] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const imageTitleInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setTextStepTitle("");
      setImageStepTitle("");
      if (pendingFile) {
        URL.revokeObjectURL(pendingFile.previewUrl);
        setPendingFile(null);
      }
    }
  }, [open]);

  // Focus appropriate input when type is selected
  useEffect(() => {
    if (selectedType === "text" && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [selectedType]);

  useEffect(() => {
    if (pendingFile && imageTitleInputRef.current) {
      imageTitleInputRef.current.focus();
    }
  }, [pendingFile]);

  const handleSelectType = (type: StepType) => {
    if (type === "image") {
      fileInputRef.current?.click();
    } else {
      setSelectedType(type);
      setTextStepTitle(`Step ${nextStepNumber}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPendingFile({ file, previewUrl });
      setImageStepTitle(`Step ${nextStepNumber}`);
      setSelectedType("image");
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTextStep = () => {
    if (textStepTitle.trim()) {
      onAddTextStep(textStepTitle.trim());
      onOpenChange(false);
    }
  };

  const handleAddImageStep = () => {
    if (pendingFile && imageStepTitle.trim()) {
      onAddImageStep({
        title: imageStepTitle.trim(),
        file: pendingFile.file,
        previewUrl: pendingFile.previewUrl,
      });
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handler();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (selectedType) {
        setSelectedType(null);
        if (pendingFile) {
          URL.revokeObjectURL(pendingFile.previewUrl);
          setPendingFile(null);
        }
      } else {
        onOpenChange(false);
      }
    }
  };

  const handleBack = () => {
    setSelectedType(null);
    if (pendingFile) {
      URL.revokeObjectURL(pendingFile.previewUrl);
      setPendingFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedType === null ? "Add New Step" : selectedType === "text" ? "Add Text Step" : "Add Image Step"}
          </DialogTitle>
          <DialogDescription>
            {selectedType === null
              ? "Choose the type of step you want to add."
              : selectedType === "text"
              ? "Add a text-only step to your guide."
              : "Add a step with an image to your guide."}
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {selectedType === null ? (
          <div className="grid gap-4 py-4 sm:grid-cols-3">
            <button
              onClick={() => handleSelectType("text")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed",
                "hover:border-primary hover:bg-primary/5 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              <div className="p-3 rounded-full bg-primary/10">
                <Type className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Text Step</p>
                <p className="text-xs text-muted-foreground mt-1">Add a navigation or instruction step</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectType("image")}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed",
                "hover:border-primary hover:bg-primary/5 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              <div className="p-3 rounded-full bg-primary/10">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Image Step</p>
                <p className="text-xs text-muted-foreground mt-1">Add a screenshot with caption</p>
              </div>
            </button>

            {onImportFromExisting && (
              <button
                onClick={() => {
                  onOpenChange(false);
                  onImportFromExisting();
                }}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed",
                  "hover:border-primary hover:bg-primary/5 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <Copy className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">From Existing Stepp</p>
                  <p className="text-xs text-muted-foreground mt-1">Import steps from another guide</p>
                </div>
              </button>
            )}
          </div>
        ) : selectedType === "text" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text-step-title">Step Text</Label>
              <Textarea
                id="text-step-title"
                ref={textInputRef}
                value={textStepTitle}
                onChange={(e) => setTextStepTitle(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleAddTextStep)}
                placeholder="e.g., Navigate to the settings page"
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleAddTextStep} disabled={!textStepTitle.trim()}>
                <Check className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {pendingFile && (
              <>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                  <img
                    src={pendingFile.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-step-title">Step Caption</Label>
                  <Input
                    id="image-step-title"
                    ref={imageTitleInputRef}
                    value={imageStepTitle}
                    onChange={(e) => setImageStepTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleAddImageStep)}
                    placeholder="Describe this step..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleAddImageStep} disabled={!imageStepTitle.trim()}>
                    <Check className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
