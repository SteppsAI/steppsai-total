export type AspectRatio = "3:4" | "1:1";

export type TextAlign = "left" | "center" | "right";
export type SlideNumberFormat = "none" | "1" | "01" | "[01]" | "1/N" | "[1/N]";
export type SlideNumberPosition = "top-left" | "top-right";

export interface CarouselSlide {
  id: string;
  heading: string;
  imageUrl?: string | null;
  headingFontSize?: number;
  headingAlign?: TextAlign;
  headingOffsetX?: number;
  headingOffsetY?: number;
  headingRotation?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageRotation?: number;
  imageScale?: number;
  imageBorderRadius?: number;
}

export interface CarouselStyle {
  backgroundColor: string;
  fontFamily: string;
  headingColor: string;
  fontColor: string;
}

export type ExportFormat = "png" | "jpg";

export interface CarouselState {
  title: string;
  slides: CarouselSlide[];
  selectedSlideId: string;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  exportFormat: ExportFormat;
  authorName: string;
  showWatermark: boolean;
  slideNumberFormat: SlideNumberFormat;
  slideNumberPosition: SlideNumberPosition;
}

export const SLIDE_NUMBER_FORMATS: { value: SlideNumberFormat; label: string; example: string }[] = [
  { value: "none", label: "None", example: "" },
  { value: "1", label: "1", example: "1" },
  { value: "01", label: "01", example: "01" },
  { value: "[01]", label: "[01]", example: "[01]" },
  { value: "1/N", label: "1/N", example: "1/6" },
  { value: "[1/N]", label: "[1/N]", example: "[1/6]" },
];

export function formatSlideNumber(
  format: SlideNumberFormat,
  index: number,
  total: number
): string {
  const num = index + 1;
  const padded = String(num).padStart(2, "0");
  switch (format) {
    case "none":
      return "";
    case "1":
      return String(num);
    case "01":
      return padded;
    case "[01]":
      return `[${padded}]`;
    case "1/N":
      return `${num}/${total}`;
    case "[1/N]":
      return `[${num}/${total}]`;
    default:
      return "";
  }
}

export interface CarouselTemplate {
  id: string;
  name: string;
  style: CarouselStyle;
}

export const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  "3:4": { width: 1080, height: 1440 },
  "1:1": { width: 1080, height: 1080 },
};

export const BACKGROUND_COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483",
  "#2d4059", "#1b262c", "#0b0c10", "#1f2833",
  "#f5f5f5", "#ffffff", "#fafafa", "#e8e8e8",
  "#ff6b6b", "#ffa502", "#2ed573", "#1e90ff",
  "#a29bfe", "#fd79a8", "#00cec9", "#6c5ce7",
];

export const FONT_FAMILIES = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "system-ui, sans-serif", label: "System" },
  { value: "'Courier New', monospace", label: "Mono" },
  { value: "'Times New Roman', serif", label: "Times" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Trebuchet MS', sans-serif", label: "Trebuchet" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "'Palatino Linotype', serif", label: "Palatino" },
  { value: "Impact, sans-serif", label: "Impact" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans" },
  { value: "'Lucida Console', monospace", label: "Lucida" },
];

export const FONT_SIZE_PRESETS = [
  { value: 32, label: "S" },
  { value: 40, label: "M" },
  { value: 48, label: "L" },
  { value: 56, label: "XL" },
  { value: 64, label: "2XL" },
  { value: 80, label: "3XL" },
];

export const DEFAULT_HEADING_FONT_SIZE = 48;

export const CAROUSEL_TEMPLATES: CarouselTemplate[] = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    style: { backgroundColor: "#1a1a2e", fontFamily: "Inter, sans-serif", headingColor: "#ffffff", fontColor: "#a0a0b0" },
  },
  {
    id: "clean-light",
    name: "Clean Light",
    style: { backgroundColor: "#ffffff", fontFamily: "Inter, sans-serif", headingColor: "#1a1a2e", fontColor: "#666666" },
  },
  {
    id: "bold-purple",
    name: "Bold Purple",
    style: { backgroundColor: "#6c5ce7", fontFamily: "Inter, sans-serif", headingColor: "#ffffff", fontColor: "#ddd6fe" },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    style: { backgroundColor: "#0f3460", fontFamily: "Georgia, serif", headingColor: "#e0f0ff", fontColor: "#90b8e0" },
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral",
    style: { backgroundColor: "#e17055", fontFamily: "Inter, sans-serif", headingColor: "#ffffff", fontColor: "#ffecd2" },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    style: { backgroundColor: "#00b894", fontFamily: "Arial, sans-serif", headingColor: "#ffffff", fontColor: "#d5f5e3" },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    style: { backgroundColor: "#f8f1e4", fontFamily: "Georgia, serif", headingColor: "#2d2d2d", fontColor: "#8b7355" },
  },
  {
    id: "charcoal",
    name: "Charcoal",
    style: { backgroundColor: "#2d3436", fontFamily: "Inter, sans-serif", headingColor: "#dfe6e9", fontColor: "#b2bec3" },
  },
  {
    id: "rose",
    name: "Rose",
    style: { backgroundColor: "#fd79a8", fontFamily: "Inter, sans-serif", headingColor: "#ffffff", fontColor: "#ffeef4" },
  },
  {
    id: "midnight",
    name: "Midnight",
    style: { backgroundColor: "#0c0c1d", fontFamily: "'Courier New', monospace", headingColor: "#a29bfe", fontColor: "#636e72" },
  },
  {
    id: "cream",
    name: "Cream",
    style: { backgroundColor: "#ffeaa7", fontFamily: "Georgia, serif", headingColor: "#2d3436", fontColor: "#636e72" },
  },
  {
    id: "navy",
    name: "Navy",
    style: { backgroundColor: "#2c3e50", fontFamily: "Inter, sans-serif", headingColor: "#ecf0f1", fontColor: "#95a5a6" },
  },
  {
    id: "lavender",
    name: "Lavender",
    style: { backgroundColor: "#a29bfe", fontFamily: "Inter, sans-serif", headingColor: "#ffffff", fontColor: "#dfe6e9" },
  },
  {
    id: "mint",
    name: "Mint Fresh",
    style: { backgroundColor: "#55efc4", fontFamily: "Arial, sans-serif", headingColor: "#2d3436", fontColor: "#636e72" },
  },
  {
    id: "slate",
    name: "Slate",
    style: { backgroundColor: "#636e72", fontFamily: "Arial, sans-serif", headingColor: "#ffffff", fontColor: "#b2bec3" },
  },
  {
    id: "terracotta",
    name: "Terracotta",
    style: { backgroundColor: "#c0392b", fontFamily: "Georgia, serif", headingColor: "#ffeaa7", fontColor: "#f5cba7" },
  },
];
