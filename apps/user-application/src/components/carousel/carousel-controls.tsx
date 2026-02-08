import { useCallback, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  CarouselSlide,
  CarouselStyle,
  ExportFormat,
  SlideNumberFormat,
  SlideNumberPosition,
} from "@/lib/carousel-templates";
import {
  BACKGROUND_COLORS,
  FONT_FAMILIES,
  FONT_SIZE_PRESETS,
  DEFAULT_HEADING_FONT_SIZE,
  SLIDE_NUMBER_FORMATS,
} from "@/lib/carousel-templates";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Trash2,
  Upload,
  User,
  Type,
  Move,
  RotateCw,
  Hash,
  Minus,
  Plus,
  ZoomIn,
  Palette,
  Download,
  RotateCcw,
} from "lucide-react";

interface CarouselControlsProps {
  style: CarouselStyle;
  exportFormat: ExportFormat;
  currentSlide: CarouselSlide;
  authorName: string;
  slideNumberFormat: SlideNumberFormat;
  slideNumberPosition: SlideNumberPosition;
  onStyleChange: (style: Partial<CarouselStyle>) => void;
  onExportFormatChange: (format: ExportFormat) => void;
  onUpdateSlide: (slideId: string, data: Partial<CarouselSlide>) => void;
  onAuthorNameChange: (name: string) => void;
  onSlideNumberFormatChange: (format: SlideNumberFormat) => void;
  onSlideNumberPositionChange: (position: SlideNumberPosition) => void;
}

export function CarouselControls({
  style,
  exportFormat,
  currentSlide,
  authorName,
  slideNumberFormat,
  slideNumberPosition,
  onStyleChange,
  onExportFormatChange,
  onUpdateSlide,
  onAuthorNameChange,
  onSlideNumberFormatChange,
  onSlideNumberPositionChange,
}: CarouselControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          onUpdateSlide(currentSlide.id, {
            imageUrl: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [currentSlide.id, onUpdateSlide]
  );

  const currentFontSize =
    currentSlide.headingFontSize || DEFAULT_HEADING_FONT_SIZE;
  const currentAlign = currentSlide.headingAlign || "left";

  const updateField = (data: Partial<CarouselSlide>) =>
    onUpdateSlide(currentSlide.id, data);

  return (
    <div className="w-[268px] flex flex-col h-full bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 border-r border-[var(--color-200)]">
      <ScrollArea className="flex-1">
        <div className="p-4 pb-8">
          {/* ━━━━━━━━━━ CONTENT ━━━━━━━━━━ */}
          <Section
            icon={<Type className="w-3.5 h-3.5" />}
            title="Content"
          >
            <div className="space-y-3">
              {/* Heading */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Heading
                </Label>
                <Textarea
                  value={currentSlide.heading}
                  onChange={(e) => updateField({ heading: e.target.value })}
                  placeholder="Enter heading..."
                  className="min-h-[72px] text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {currentSlide.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
                      <img
                        src={currentSlide.imageUrl}
                        alt=""
                        className="w-full h-20 object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3 mr-1.5" />
                        Replace
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => updateField({ imageUrl: null })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-16 border-dashed text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs">Upload image</span>
                    </div>
                  </Button>
                )}
              </div>

              {/* Author */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  <User className="w-3 h-3 inline mr-1" />
                  Author
                </Label>
                <Input
                  value={authorName}
                  onChange={(e) => onAuthorNameChange(e.target.value)}
                  placeholder="Author name"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ━━━━━━━━━━ IMAGE OPTIONS ━━━━━━━━━━ */}
          {currentSlide.imageUrl && (
            <>
              <Section
                icon={<ImageIcon className="w-3.5 h-3.5" />}
                title="Image"
              >
                <div className="space-y-3">
                  {/* Scale */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      <ZoomIn className="w-3 h-3 inline mr-1" />
                      Scale
                    </Label>
                    <NudgeControl
                      value={currentSlide.imageScale || 1}
                      onChange={(v) =>
                        updateField({
                          imageScale: Math.round(v * 100) / 100,
                        })
                      }
                      step={0.05}
                      min={0.2}
                      max={3}
                      format={(v) => `${Math.round(v * 100)}%`}
                      parse={(s) => {
                        const n = parseFloat(s.replace("%", ""));
                        return isNaN(n) ? null : n / 100;
                      }}
                    />
                  </div>

                  {/* Position */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        <Move className="w-3 h-3 inline mr-1" />
                        Position
                      </Label>
                      {(currentSlide.imageOffsetX ||
                        currentSlide.imageOffsetY) && (
                        <button
                          onClick={() =>
                            updateField({ imageOffsetX: 0, imageOffsetY: 0 })
                          }
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <NudgeControl
                        label="X"
                        value={currentSlide.imageOffsetX || 0}
                        onChange={(v) => updateField({ imageOffsetX: v })}
                        step={10}
                        min={-500}
                        max={500}
                        format={(v) => `${v}`}
                        parse={(s) => {
                          const n = parseInt(s);
                          return isNaN(n) ? null : n;
                        }}
                        suffix="px"
                      />
                      <NudgeControl
                        label="Y"
                        value={currentSlide.imageOffsetY || 0}
                        onChange={(v) => updateField({ imageOffsetY: v })}
                        step={10}
                        min={-500}
                        max={500}
                        format={(v) => `${v}`}
                        parse={(s) => {
                          const n = parseInt(s);
                          return isNaN(n) ? null : n;
                        }}
                        suffix="px"
                      />
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      <RotateCw className="w-3 h-3 inline mr-1" />
                      Rotation
                    </Label>
                    <NudgeControl
                      value={currentSlide.imageRotation || 0}
                      onChange={(v) => updateField({ imageRotation: v })}
                      step={1}
                      min={-180}
                      max={180}
                      format={(v) => `${v}`}
                      parse={(s) => {
                        const n = parseInt(s);
                        return isNaN(n) ? null : n;
                      }}
                      suffix={"\u00B0"}
                    />
                  </div>
                </div>
              </Section>

              <Separator className="my-4" />
            </>
          )}

          {/* ━━━━━━━━━━ TYPOGRAPHY ━━━━━━━━━━ */}
          <Section icon={<Type className="w-3.5 h-3.5" />} title="Typography">
            <div className="space-y-3">
              {/* Font */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Font</Label>
                <Select
                  value={style.fontFamily}
                  onValueChange={(val) => onStyleChange({ fontFamily: val })}
                >
                  <SelectTrigger className="w-full h-8 text-sm">
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

              {/* Size */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Size ({currentFontSize}px)
                </Label>
                <div className="flex gap-1">
                  {FONT_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() =>
                        updateField({ headingFontSize: preset.value })
                      }
                      className={cn(
                        "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                        currentFontSize === preset.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Alignment
                </Label>
                <div className="flex gap-1">
                  <AlignButton
                    active={currentAlign === "left"}
                    onClick={() => updateField({ headingAlign: "left" })}
                    icon={<AlignLeft className="w-4 h-4" />}
                    label="Left"
                  />
                  <AlignButton
                    active={currentAlign === "center"}
                    onClick={() => updateField({ headingAlign: "center" })}
                    icon={<AlignCenter className="w-4 h-4" />}
                    label="Center"
                  />
                  <AlignButton
                    active={currentAlign === "right"}
                    onClick={() => updateField({ headingAlign: "right" })}
                    icon={<AlignRight className="w-4 h-4" />}
                    label="Right"
                  />
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ━━━━━━━━━━ HEADING TRANSFORM ━━━━━━━━━━ */}
          <Section
            icon={<Move className="w-3.5 h-3.5" />}
            title="Heading Transform"
          >
            <div className="space-y-3">
              {/* Position */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">
                    Position
                  </Label>
                  {(currentSlide.headingOffsetX ||
                    currentSlide.headingOffsetY) && (
                    <button
                      onClick={() =>
                        updateField({ headingOffsetX: 0, headingOffsetY: 0 })
                      }
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <NudgeControl
                    label="X"
                    value={currentSlide.headingOffsetX || 0}
                    onChange={(v) => updateField({ headingOffsetX: v })}
                    step={5}
                    min={-300}
                    max={300}
                    format={(v) => `${v}`}
                    parse={(s) => {
                      const n = parseInt(s);
                      return isNaN(n) ? null : n;
                    }}
                    suffix="px"
                  />
                  <NudgeControl
                    label="Y"
                    value={currentSlide.headingOffsetY || 0}
                    onChange={(v) => updateField({ headingOffsetY: v })}
                    step={5}
                    min={-300}
                    max={300}
                    format={(v) => `${v}`}
                    parse={(s) => {
                      const n = parseInt(s);
                      return isNaN(n) ? null : n;
                    }}
                    suffix="px"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  <RotateCw className="w-3 h-3 inline mr-1" />
                  Rotation
                </Label>
                <NudgeControl
                  value={currentSlide.headingRotation || 0}
                  onChange={(v) => updateField({ headingRotation: v })}
                  step={1}
                  min={-180}
                  max={180}
                  format={(v) => `${v}`}
                  parse={(s) => {
                    const n = parseInt(s);
                    return isNaN(n) ? null : n;
                  }}
                  suffix={"\u00B0"}
                />
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ━━━━━━━━━━ COLORS ━━━━━━━━━━ */}
          <Section icon={<Palette className="w-3.5 h-3.5" />} title="Colors">
            <div className="space-y-3">
              {/* Background */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Background
                </Label>
                <div className="grid grid-cols-6 gap-1.5">
                  {BACKGROUND_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        onStyleChange({ backgroundColor: color })
                      }
                      className={cn(
                        "w-7 h-7 rounded-lg border-2 transition-all hover:scale-110",
                        style.backgroundColor === color
                          ? "border-primary shadow-md scale-105"
                          : "border-transparent hover:border-border"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Label className="text-xs text-muted-foreground">
                    Custom:
                  </Label>
                  <input
                    type="color"
                    value={style.backgroundColor}
                    onChange={(e) =>
                      onStyleChange({ backgroundColor: e.target.value })
                    }
                    className="w-7 h-7 rounded cursor-pointer border border-border"
                  />
                </div>
              </div>

              {/* Heading + Text color row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Heading
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.headingColor}
                      onChange={(e) =>
                        onStyleChange({ headingColor: e.target.value })
                      }
                      className="w-7 h-7 rounded cursor-pointer border border-border shrink-0"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      {style.headingColor}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Text</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.fontColor}
                      onChange={(e) =>
                        onStyleChange({ fontColor: e.target.value })
                      }
                      className="w-7 h-7 rounded cursor-pointer border border-border shrink-0"
                    />
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      {style.fontColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ━━━━━━━━━━ SLIDE NUMBER ━━━━━━━━━━ */}
          <Section
            icon={<Hash className="w-3.5 h-3.5" />}
            title="Slide Number"
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Format</Label>
                <div className="grid grid-cols-3 gap-1">
                  {SLIDE_NUMBER_FORMATS.map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => onSlideNumberFormatChange(fmt.value)}
                      className={cn(
                        "py-1.5 rounded-md text-xs font-medium border transition-colors",
                        slideNumberFormat === fmt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {slideNumberFormat !== "none" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Position
                  </Label>
                  <div className="flex gap-1.5">
                    <ToggleButton
                      active={slideNumberPosition === "top-left"}
                      onClick={() => onSlideNumberPositionChange("top-left")}
                      label="Top Left"
                    />
                    <ToggleButton
                      active={slideNumberPosition === "top-right"}
                      onClick={() => onSlideNumberPositionChange("top-right")}
                      label="Top Right"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          <Separator className="my-4" />

          {/* ━━━━━━━━━━ EXPORT ━━━━━━━━━━ */}
          <Section icon={<Download className="w-3.5 h-3.5" />} title="Export">
            <div className="flex gap-1.5">
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
          </Section>
        </div>
      </ScrollArea>
    </div>
  );
}

/* ━━━━━━━━━━ Shared sub-components ━━━━━━━━━━ */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </Label>
      </div>
      {children}
    </div>
  );
}

function AlignButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/50"
      )}
    >
      {icon}
    </button>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function NudgeControl({
  label,
  value,
  onChange,
  step,
  min,
  max,
  format,
  parse,
  suffix,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  format: (v: number) => string;
  parse: (s: string) => number | null;
  suffix?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const startEdit = () => {
    setEditValue(format(value));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    const parsed = parse(editValue);
    if (parsed !== null) {
      onChange(clamp(parsed));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {label && (
        <span className="text-[10px] font-medium text-muted-foreground w-3 shrink-0">
          {label}
        </span>
      )}
      <button
        onClick={() => onChange(clamp(value - step))}
        className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
      >
        <Minus className="w-2.5 h-2.5" />
      </button>
      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 text-center text-[11px] font-mono tabular-nums bg-white border border-primary rounded px-1 h-6 focus:outline-none"
        />
      ) : (
        <button
          onClick={startEdit}
          className="flex-1 min-w-0 text-center text-[11px] font-mono text-muted-foreground tabular-nums h-6 rounded hover:bg-muted/30 transition-colors cursor-text"
        >
          {format(value)}{suffix}
        </button>
      )}
      <button
        onClick={() => onChange(clamp(value + step))}
        className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
      >
        <Plus className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}
