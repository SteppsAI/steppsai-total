import { useRef, useCallback, useState, useEffect, createRef } from "react";
import { CarouselSlideView } from "./carousel-slide";
import type {
  CarouselSlide,
  CarouselStyle,
  AspectRatio,
} from "@/lib/carousel-templates";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/carousel-templates";

interface CarouselSlideEditorProps {
  slide: CarouselSlide;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  authorName: string;
  showWatermark: boolean;
  onUpdateSlide: (slideId: string, data: Partial<CarouselSlide>) => void;
  slideRefs: React.MutableRefObject<Map<string, React.RefObject<HTMLDivElement | null>>>;
  allSlides: CarouselSlide[];
}

export function CarouselSlideEditor({
  slide,
  style,
  aspectRatio,
  authorName,
  showWatermark,
  onUpdateSlide,
  slideRefs,
  allSlides,
}: CarouselSlideEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [headingValue, setHeadingValue] = useState(slide.heading);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Sync heading value when slide changes
  useEffect(() => {
    setHeadingValue(slide.heading);
    setIsEditingHeading(false);
  }, [slide.id]);

  // Ensure refs exist for all slides (for export)
  useEffect(() => {
    allSlides.forEach((s) => {
      if (!slideRefs.current.has(s.id)) {
        slideRefs.current.set(s.id, createRef<HTMLDivElement>());
      }
    });
  }, [allSlides, slideRefs]);

  const handleHeadingClick = useCallback(() => {
    setIsEditingHeading(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const handleHeadingBlur = useCallback(() => {
    setIsEditingHeading(false);
    onUpdateSlide(slide.id, { heading: headingValue });
  }, [slide.id, headingValue, onUpdateSlide]);

  const handleHeadingKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditingHeading(false);
        setHeadingValue(slide.heading);
      }
    },
    [slide.heading]
  );

  const handleImageClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          onUpdateSlide(slide.id, { imageUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [slide.id, onUpdateSlide]);

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
        {/* Actual slide rendered at full resolution for export */}
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
          />
        </div>

        {/* Interactive overlay (scaled to match) */}
        <div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: isEditingHeading ? "none" : "auto" }}
        >
          {/* Heading click area */}
          <div
            className="absolute cursor-text hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 rounded-lg transition-all"
            style={{
              top: `${(72 / dimensions.height) * 100}%`,
              left: `${(64 / dimensions.width) * 100}%`,
              right: `${(64 / dimensions.width) * 100}%`,
              height: "30%",
            }}
            onClick={handleHeadingClick}
          />

          {/* Image click area */}
          <div
            className="absolute cursor-pointer hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 rounded-lg transition-all"
            style={{
              top: "40%",
              left: `${(64 / dimensions.width) * 100}%`,
              right: `${(64 / dimensions.width) * 100}%`,
              height: "35%",
            }}
            onClick={handleImageClick}
            title={slide.imageUrl ? "Click to change image" : "Click to add image"}
          />
        </div>

        {/* Heading editing overlay */}
        {isEditingHeading && (
          <div
            className="absolute z-20"
            style={{
              top: `${(72 / dimensions.height) * 100}%`,
              left: `${(64 / dimensions.width) * 100}%`,
              right: `${(64 / dimensions.width) * 100}%`,
              height: "30%",
            }}
          >
            <textarea
              ref={textareaRef}
              value={headingValue}
              onChange={(e) => setHeadingValue(e.target.value)}
              onBlur={handleHeadingBlur}
              onKeyDown={handleHeadingKeyDown}
              className="w-full h-full resize-none bg-black/5 backdrop-blur-sm rounded-lg p-3 text-lg font-bold border-2 border-primary focus:outline-none"
              style={{
                color: style.headingColor,
                fontFamily: style.fontFamily,
              }}
            />
          </div>
        )}
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
              />
            );
          })}
      </div>
    </div>
  );
}
