import { useRef, useState, useEffect, createRef } from "react";
import { CarouselSlideView } from "./carousel-slide";
import type {
  CarouselSlide,
  CarouselStyle,
  AspectRatio,
  SlideNumberFormat,
  SlideNumberPosition,
  LayoutId,
} from "@/lib/carousel-templates";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/carousel-templates";

interface CarouselSlideEditorProps {
  slide: CarouselSlide;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  authorName: string;
  showWatermark: boolean;
  slideNumberFormat: SlideNumberFormat;
  slideNumberPosition: SlideNumberPosition;
  layout: LayoutId;
  slideRefs: React.MutableRefObject<Map<string, React.RefObject<HTMLDivElement | null>>>;
  allSlides: CarouselSlide[];
}

export function CarouselSlideEditor({
  slide,
  style,
  aspectRatio,
  authorName,
  showWatermark,
  slideNumberFormat,
  slideNumberPosition,
  layout,
  slideRefs,
  allSlides,
}: CarouselSlideEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  // Calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const padding = 64;
      const availW = clientWidth - padding;
      const availH = clientHeight - padding;
      const scaleW = availW / dimensions.width;
      const scaleH = availH / dimensions.height;
      setScale(Math.min(scaleW, scaleH, 1));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [dimensions.width, dimensions.height]);

  // Ensure refs exist for all slides (for export)
  useEffect(() => {
    allSlides.forEach((s) => {
      if (!slideRefs.current.has(s.id)) {
        slideRefs.current.set(s.id, createRef<HTMLDivElement>());
      }
    });
  }, [allSlides, slideRefs]);

  const slideRef = slideRefs.current.get(slide.id) || createRef<HTMLDivElement>();
  if (!slideRefs.current.has(slide.id)) {
    slideRefs.current.set(slide.id, slideRef);
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[var(--color-50)] overflow-hidden"
    >
      <div
        style={{
          width: dimensions.width * scale,
          height: dimensions.height * scale,
          position: "relative",
        }}
      >
        {/* Slide rendered at full resolution, scaled down for preview */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <CarouselSlideView
            ref={slideRef}
            slide={slide}
            style={style}
            aspectRatio={aspectRatio}
            authorName={authorName}
            showWatermark={showWatermark}
            slideIndex={allSlides.findIndex((s) => s.id === slide.id)}
            totalSlides={allSlides.length}
            slideNumberFormat={slideNumberFormat}
            slideNumberPosition={slideNumberPosition}
            layout={layout}
          />
        </div>
      </div>

      {/* Hidden full-resolution slides for non-selected slides (for export) */}
      <div className="fixed -left-[9999px] -top-[9999px]" aria-hidden>
        {allSlides
          .filter((s) => s.id !== slide.id)
          .map((s) => {
            const ref = slideRefs.current.get(s.id) || createRef<HTMLDivElement>();
            if (!slideRefs.current.has(s.id)) {
              slideRefs.current.set(s.id, ref);
            }
            return (
              <CarouselSlideView
                key={s.id}
                ref={ref}
                slide={s}
                style={style}
                aspectRatio={aspectRatio}
                authorName={authorName}
                showWatermark={showWatermark}
                slideIndex={allSlides.findIndex((sl) => sl.id === s.id)}
                totalSlides={allSlides.length}
                slideNumberFormat={slideNumberFormat}
                slideNumberPosition={slideNumberPosition}
                layout={layout}
              />
            );
          })}
      </div>
    </div>
  );
}
