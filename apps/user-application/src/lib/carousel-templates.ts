export type AspectRatio = "3:4" | "1:1";

export type TextAlign = "left" | "center" | "right";
export type ImageFit = "contain" | "cover";

export interface CarouselSlide {
  id: string;
  heading: string;
  imageUrl?: string | null;
  headingFontSize?: number;
  headingAlign?: TextAlign;
  imageFit?: ImageFit;
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
}

export interface CarouselTemplate {
  id: string;
  name: string;
  style: CarouselStyle;
  slides: Omit<CarouselSlide, "id">[];
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
    style: {
      backgroundColor: "#1a1a2e",
      fontFamily: "Inter, sans-serif",
      headingColor: "#ffffff",
      fontColor: "#a0a0b0",
    },
    slides: [
      { heading: "Your title here", imageUrl: null },
      { heading: "Add your content", imageUrl: null },
      { heading: "Final slide", imageUrl: null },
    ],
  },
  {
    id: "clean-light",
    name: "Clean Light",
    style: {
      backgroundColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
      headingColor: "#1a1a2e",
      fontColor: "#666666",
    },
    slides: [
      { heading: "Your title here", imageUrl: null },
      { heading: "Add your content", imageUrl: null },
      { heading: "Final slide", imageUrl: null },
    ],
  },
  {
    id: "bold-gradient",
    name: "Bold Purple",
    style: {
      backgroundColor: "#6c5ce7",
      fontFamily: "Inter, sans-serif",
      headingColor: "#ffffff",
      fontColor: "#ddd6fe",
    },
    slides: [
      { heading: "Your title here", imageUrl: null },
      { heading: "Add your content", imageUrl: null },
      { heading: "Final slide", imageUrl: null },
    ],
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    style: {
      backgroundColor: "#0f3460",
      fontFamily: "Georgia, serif",
      headingColor: "#e0f0ff",
      fontColor: "#90b8e0",
    },
    slides: [
      { heading: "Your title here", imageUrl: null },
      { heading: "Add your content", imageUrl: null },
      { heading: "Final slide", imageUrl: null },
    ],
  },
];
