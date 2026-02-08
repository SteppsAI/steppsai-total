import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CarouselStyle, ExportFormat } from "@/lib/carousel-templates";
import { BACKGROUND_COLORS, FONT_FAMILIES } from "@/lib/carousel-templates";

interface CarouselControlsProps {
  style: CarouselStyle;
  exportFormat: ExportFormat;
  onStyleChange: (style: Partial<CarouselStyle>) => void;
  onExportFormatChange: (format: ExportFormat) => void;
}

export function CarouselControls({
  style,
  exportFormat,
  onStyleChange,
  onExportFormatChange,
}: CarouselControlsProps) {
  return (
    <div className="w-[240px] flex flex-col h-full bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 border-r border-[var(--color-200)] overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Background
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onStyleChange({ backgroundColor: color })}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                  style.backgroundColor === color
                    ? "border-primary shadow-md scale-105"
                    : "border-transparent hover:border-border"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Label className="text-xs text-muted-foreground">Custom:</Label>
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border"
            />
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Font
          </Label>
          <Select
            value={style.fontFamily}
            onValueChange={(val) => onStyleChange({ fontFamily: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Heading Color */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Heading Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.headingColor}
              onChange={(e) => onStyleChange({ headingColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border"
            />
            <span className="text-xs text-muted-foreground font-mono">{style.headingColor}</span>
          </div>
        </div>

        {/* Font Color */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Text Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.fontColor}
              onChange={(e) => onStyleChange({ fontColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-border"
            />
            <span className="text-xs text-muted-foreground font-mono">{style.fontColor}</span>
          </div>
        </div>

        {/* Export Format */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Export Format
          </Label>
          <div className="flex gap-2">
            <button
              onClick={() => onExportFormatChange("png")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                exportFormat === "png"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              PNG
            </button>
            <button
              onClick={() => onExportFormatChange("jpg")}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                exportFormat === "jpg"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              JPG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
