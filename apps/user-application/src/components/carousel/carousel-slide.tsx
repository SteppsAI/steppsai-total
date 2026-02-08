import { forwardRef } from "react";
import type {
  CarouselSlide,
  CarouselStyle,
  AspectRatio,
  SlideNumberFormat,
  SlideNumberPosition,
  LayoutId,
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
  layout?: LayoutId;
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
      layout = "classic",
      scale,
    },
    ref
  ) => {
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const fontSize = slide.headingFontSize || DEFAULT_HEADING_FONT_SIZE;
    const textAlign = slide.headingAlign || "left";
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

    const headingStyle = {
      color: style.headingColor,
      fontFamily: style.fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight: 1.15,
      textAlign,
    } as const;

    const slideNumberEl = slideNumber ? (
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
    ) : null;

    const footerEl = (
      <div
        className="shrink-0 flex items-center justify-between px-16 py-8 relative z-20"
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
    );

    const headingEl = (
      <div className="shrink-0" style={headingTransform ? { transform: headingTransform } : undefined}>
        <h2
          style={headingStyle}
          className="font-bold whitespace-pre-wrap break-words mt-8"
        >
          {slide.heading || "\u00A0"}
        </h2>
      </div>
    );

    const imageEl = slide.imageUrl ? (
      <div
        className="flex-1 flex items-center justify-center min-h-0 mt-6"
        style={imageTransform ? { transform: imageTransform } : undefined}
      >
        <img
          src={slide.imageUrl}
          alt=""
          className="max-w-full max-h-full object-contain shadow-lg"
          style={{ borderRadius: slide.imageBorderRadius ?? 0 }}
          crossOrigin="anonymous"
        />
      </div>
    ) : null;

    // Centered layout: image without flex-1 so spacers can center the group
    const centeredImageEl = slide.imageUrl ? (
      <div
        className="shrink-0 flex items-center justify-center mt-6"
        style={{
          maxHeight: "40%",
          ...(imageTransform ? { transform: imageTransform } : {}),
        }}
      >
        <img
          src={slide.imageUrl}
          alt=""
          className="max-w-full max-h-full object-contain shadow-lg"
          style={{ borderRadius: slide.imageBorderRadius ?? 0 }}
          crossOrigin="anonymous"
        />
      </div>
    ) : null;

    const outerStyle = {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: style.backgroundColor,
      fontFamily: style.fontFamily,
      transform: scale ? `scale(${scale})` : undefined,
      transformOrigin: "top left" as const,
    };

    // Full Image layout: image as background with gradient overlay
    if (layout === "full-image" && slide.imageUrl) {
      return (
        <div
          ref={ref}
          style={outerStyle}
          className="relative flex flex-col overflow-hidden shrink-0"
        >
          {slideNumberEl}
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              borderRadius: slide.imageBorderRadius ?? 0,
              ...(imageTransform ? { transform: imageTransform } : {}),
            }}
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="flex-1" />
          <div
            className="relative z-10 px-16 pb-4"
            style={headingTransform ? { transform: headingTransform } : undefined}
          >
            <h2
              style={{ ...headingStyle, color: "#ffffff" }}
              className="font-bold whitespace-pre-wrap break-words"
            >
              {slide.heading || "\u00A0"}
            </h2>
          </div>
          {footerEl}
        </div>
      );
    }

    // Standard layouts
    return (
      <div
        ref={ref}
        style={outerStyle}
        className="relative flex flex-col overflow-hidden shrink-0"
      >
        {slideNumberEl}

        <div className="flex-1 flex flex-col p-16 pb-4 min-h-0">
          {layout === "centered" ? (
            <>
              <div className="flex-1" />
              {headingEl}
              {centeredImageEl}
              <div className="flex-1" />
            </>
          ) : (
            <>
              {headingEl}
              {imageEl}
              {!imageEl && <div className="flex-1" />}
            </>
          )}
        </div>

        {footerEl}
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
