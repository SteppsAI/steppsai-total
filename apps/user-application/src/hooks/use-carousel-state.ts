import { useReducer, useCallback } from "react";
import type {
  CarouselState,
  CarouselSlide,
  CarouselStyle,
  CarouselTemplate,
  AspectRatio,
  ExportFormat,
  SlideNumberFormat,
  SlideNumberPosition,
  LayoutId,
} from "@/lib/carousel-templates";
import type { Overlay } from "@/types/db";

type CarouselAction =
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_SELECTED_SLIDE"; slideId: string }
  | { type: "UPDATE_SLIDE"; slideId: string; data: Partial<CarouselSlide> }
  | { type: "ADD_SLIDE"; afterId?: string }
  | { type: "DELETE_SLIDE"; slideId: string }
  | { type: "REORDER_SLIDES"; slides: CarouselSlide[] }
  | { type: "SET_STYLE"; style: Partial<CarouselStyle> }
  | { type: "SET_EXPORT_FORMAT"; format: ExportFormat }
  | { type: "SET_AUTHOR_NAME"; authorName: string }
  | { type: "SET_SLIDE_NUMBER_FORMAT"; format: SlideNumberFormat }
  | { type: "SET_SLIDE_NUMBER_POSITION"; position: SlideNumberPosition }
  | { type: "SET_LAYOUT"; layout: LayoutId };

function carouselReducer(state: CarouselState, action: CarouselAction): CarouselState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.title };

    case "SET_SELECTED_SLIDE":
      return { ...state, selectedSlideId: action.slideId };

    case "UPDATE_SLIDE":
      return {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId ? { ...s, ...action.data } : s
        ),
      };

    case "ADD_SLIDE": {
      const newSlide: CarouselSlide = {
        id: crypto.randomUUID(),
        heading: "",
        imageUrl: null,
      };
      if (action.afterId) {
        const idx = state.slides.findIndex((s) => s.id === action.afterId);
        const newSlides = [...state.slides];
        newSlides.splice(idx + 1, 0, newSlide);
        return { ...state, slides: newSlides, selectedSlideId: newSlide.id };
      }
      return {
        ...state,
        slides: [...state.slides, newSlide],
        selectedSlideId: newSlide.id,
      };
    }

    case "DELETE_SLIDE": {
      if (state.slides.length <= 1) return state;
      const filtered = state.slides.filter((s) => s.id !== action.slideId);
      const newSelected =
        state.selectedSlideId === action.slideId
          ? filtered[0].id
          : state.selectedSlideId;
      return { ...state, slides: filtered, selectedSlideId: newSelected };
    }

    case "REORDER_SLIDES":
      return { ...state, slides: action.slides };

    case "SET_STYLE":
      return { ...state, style: { ...state.style, ...action.style } };

    case "SET_EXPORT_FORMAT":
      return { ...state, exportFormat: action.format };

    case "SET_AUTHOR_NAME":
      return { ...state, authorName: action.authorName };

    case "SET_SLIDE_NUMBER_FORMAT":
      return { ...state, slideNumberFormat: action.format };

    case "SET_SLIDE_NUMBER_POSITION":
      return { ...state, slideNumberPosition: action.position };

    case "SET_LAYOUT":
      return { ...state, layout: action.layout };

    default:
      return state;
  }
}

interface InitOptions {
  aspectRatio: AspectRatio;
  authorName: string;
  showWatermark: boolean;
  template?: CarouselTemplate;
  layoutId?: LayoutId;
  guideTitle?: string;
  guideSteps?: Array<{ caption: string; imageKey?: string | null; overlays?: Overlay[] }>;
}

const DEFAULT_STYLE: CarouselStyle = {
  backgroundColor: "#1a1a2e",
  fontFamily: "Inter, sans-serif",
  headingColor: "#ffffff",
  fontColor: "#a0a0b0",
};

function createInitialState(options: InitOptions): CarouselState {
  const { aspectRatio, authorName, showWatermark, template, layoutId, guideTitle, guideSteps } = options;

  // Style: use template style if provided, otherwise default
  const style: CarouselStyle = template ? { ...template.style } : { ...DEFAULT_STYLE };

  // Slides: from guide steps if provided, otherwise blank defaults
  let slides: CarouselSlide[];
  let title: string;

  if (guideSteps && guideSteps.length > 0) {
    slides = guideSteps.map((step) => ({
      id: crypto.randomUUID(),
      heading: step.caption || "",
      imageUrl: step.imageKey || null,
      overlays: step.overlays || [],
    }));
    title = guideTitle || "Untitled Carousel";
  } else {
    slides = [
      { id: crypto.randomUUID(), heading: "Your title here", imageUrl: null },
      { id: crypto.randomUUID(), heading: "", imageUrl: null },
      { id: crypto.randomUUID(), heading: "", imageUrl: null },
    ];
    title = "Untitled Carousel";
  }

  return {
    title,
    slides,
    selectedSlideId: slides[0].id,
    style,
    aspectRatio,
    exportFormat: "png",
    authorName,
    showWatermark,
    slideNumberFormat: "none",
    slideNumberPosition: "top-left",
    layout: layoutId || "classic",
  };
}

export function useCarouselState(options: InitOptions) {
  const [state, dispatch] = useReducer(carouselReducer, options, createInitialState);

  const setTitle = useCallback((title: string) => {
    dispatch({ type: "SET_TITLE", title });
  }, []);

  const selectSlide = useCallback((slideId: string) => {
    dispatch({ type: "SET_SELECTED_SLIDE", slideId });
  }, []);

  const updateSlide = useCallback((slideId: string, data: Partial<CarouselSlide>) => {
    dispatch({ type: "UPDATE_SLIDE", slideId, data });
  }, []);

  const addSlide = useCallback((afterId?: string) => {
    dispatch({ type: "ADD_SLIDE", afterId });
  }, []);

  const deleteSlide = useCallback((slideId: string) => {
    dispatch({ type: "DELETE_SLIDE", slideId });
  }, []);

  const reorderSlides = useCallback((slides: CarouselSlide[]) => {
    dispatch({ type: "REORDER_SLIDES", slides });
  }, []);

  const setStyle = useCallback((style: Partial<CarouselStyle>) => {
    dispatch({ type: "SET_STYLE", style });
  }, []);

  const setExportFormat = useCallback((format: ExportFormat) => {
    dispatch({ type: "SET_EXPORT_FORMAT", format });
  }, []);

  const setAuthorName = useCallback((authorName: string) => {
    dispatch({ type: "SET_AUTHOR_NAME", authorName });
  }, []);

  const setSlideNumberFormat = useCallback((format: SlideNumberFormat) => {
    dispatch({ type: "SET_SLIDE_NUMBER_FORMAT", format });
  }, []);

  const setSlideNumberPosition = useCallback((position: SlideNumberPosition) => {
    dispatch({ type: "SET_SLIDE_NUMBER_POSITION", position });
  }, []);

  const setLayout = useCallback((layout: LayoutId) => {
    dispatch({ type: "SET_LAYOUT", layout });
  }, []);

  return {
    state,
    setTitle,
    selectSlide,
    updateSlide,
    addSlide,
    deleteSlide,
    reorderSlides,
    setStyle,
    setExportFormat,
    setAuthorName,
    setSlideNumberFormat,
    setSlideNumberPosition,
    setLayout,
  };
}
