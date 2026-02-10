import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface CarouselEditorHeaderProps {
  title: string;
  isExporting?: boolean;
  onTitleChange: (title: string) => void;
  onExport: () => void;
  onBack?: () => void;
}

export function CarouselEditorHeader({
  title,
  isExporting = false,
  onTitleChange,
  onExport,
  onBack,
}: CarouselEditorHeaderProps) {
  const router = useRouter();
  const [localTitle, setLocalTitle] = useState(title);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocused) {
      setLocalTitle(title);
    }
  }, [title, isFocused]);

  const handleChange = (val: string) => {
    setLocalTitle(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onTitleChange(val), 300);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onTitleChange(localTitle);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header className="h-16 border-b border-[var(--color-200)] bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 flex items-center justify-between px-4 sticky top-0 z-50 transition-all duration-300">
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full btn-glass-secondary text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
          onClick={onBack ? onBack : () => router.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center flex-[2] gap-1">
        <Input
          value={isFocused ? localTitle : localTitle || title}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="Untitled Carousel"
          className={cn(
            "text-center font-display font-semibold text-lg bg-transparent border-transparent shadow-none",
            "w-[300px] md:w-[400px] h-8 px-2 transition-all duration-200",
            "hover:bg-white/40 focus:bg-white/60 focus:ring-1 focus:ring-[var(--primary)]/30 rounded-md",
            "placeholder:text-muted-foreground/60"
          )}
        />
      </div>

      <div className="flex items-center justify-end gap-2 flex-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 btn-glass-primary text-white shadow-md hover:shadow-lg hover:translate-y-[-1px] hover:text-white transition-all duration-300 rounded-lg"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-white" />
          )}
          <span className="font-medium">{isExporting ? "Exporting..." : "Export"}</span>
        </Button>
      </div>
    </header>
  );
}
