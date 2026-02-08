import { forwardRef } from "react";
import type {
  CarouselSlide,
  CarouselStyle,
  AspectRatio,
  SlideNumberFormat,
  SlideNumberPosition,
} from "@/lib/carousel-templates";
import {
  ASPECT_RATIO_DIMENSIONS,
  DEFAULT_HEADING_FONT_SIZE,
  formatSlideNumber,
} from "@/lib/carousel-templates";

interface CarouselSlideProps {
  slide: CarouselSlide;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  authorName: string;
  showWatermark: boolean;
  slideIndex: number;
  totalSlides: number;
  slideNumberFormat: SlideNumberFormat;
  slideNumberPosition: SlideNumberPosition;
  scale?: number;
}

export const CarouselSlideView = forwardRef<HTMLDivElement, CarouselSlideProps>(
  (
    {
      slide,
      style,
      aspectRatio,
      authorName,
      showWatermark,
      slideIndex,
      totalSlides,
      slideNumberFormat,
      slideNumberPosition,
      scale,
    },
    ref
  ) => {
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const fontSize = slide.headingFontSize || DEFAULT_HEADING_FONT_SIZE;
    const textAlign = slide.headingAlign || "left";
    const imageFit = slide.imageFit || "contain";
    const slideNumber = formatSlideNumber(slideNumberFormat, slideIndex, totalSlides);

    const headingTransform = buildTransform(
      slide.headingOffsetX,
      slide.headingOffsetY,
      slide.headingRotation
    );
    const imageTransform = buildTransform(
      slide.imageOffsetX,
      slide.imageOffsetY,
      slide.imageRotation,
      slide.imageScale
    );

    return (
      <div
        ref={ref}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: style.backgroundColor,
          fontFamily: style.fontFamily,
          transform: scale ? `scale(${scale})` : undefined,
          transformOrigin: "top left",
        }}
        className="relative flex flex-col overflow-hidden shrink-0"
      >
        {/* Slide number */}
        {slideNumber && (
          <div
            className="absolute top-10 z-10"
            style={{
              [slideNumberPosition === "top-left" ? "left" : "right"]: 64,
              color: style.fontColor,
              fontFamily: style.fontFamily,
              fontSize: 22,
              opacity: 0.7,
              fontWeight: 600,
            }}
          >
            {slideNumber}
          </div>
        )}

        {/* Content area - takes remaining space above the bottom bar */}
        <div className="flex-1 flex flex-col p-16 pb-4 min-h-0">
          {/* Heading - shrinks to fit content */}
          <div className="shrink-0" style={headingTransform ? { transform: headingTransform } : undefined}>
            <h2
              style={{
                color: style.headingColor,
                fontFamily: style.fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: 1.15,
                textAlign,
              }}
              className="font-bold whitespace-pre-wrap break-words mt-8"
            >
              {slide.heading || "\u00A0"}
            </h2>
          </div>

          {/* Optional image - fills remaining space but never overflows */}
          {slide.imageUrl && (
            <div
              className="flex-1 flex items-center justify-center mt-6 min-h-0"
              style={imageTransform ? { transform: imageTransform } : undefined}
            >
              <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-white/10 shadow-lg">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="max-w-full max-h-full"
                  style={{ objectFit: imageFit }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}

          {/* Spacer when no image */}
          {!slide.imageUrl && <div className="flex-1" />}
        </div>

        {/* Bottom bar - always visible, pinned to bottom */}
        <div
          className="shrink-0 flex items-center justify-between px-16 py-8"
          style={{ color: style.fontColor }}
        >
          <span className="text-xl font-medium">{authorName}</span>
          {showWatermark && (
            <img
              src="/made-with-steppsai.png"
              alt="made with stepps.ai"
              style={{ height: 36 }}
              crossOrigin="anonymous"
            />
          )}
        </div>
      </div>
    );
  }
);

CarouselSlideView.displayName = "CarouselSlideView";

function buildTransform(
  offsetX?: number,
  offsetY?: number,
  rotation?: number,
  imgScale?: number
): string | undefined {
  const parts: string[] = [];
  if (offsetX || offsetY) {
    parts.push(`translate(${offsetX || 0}px, ${offsetY || 0}px)`);
  }
  if (rotation) {
    parts.push(`rotate(${rotation}deg)`);
  }
  if (imgScale && imgScale !== 1) {
    parts.push(`scale(${imgScale})`);
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}
