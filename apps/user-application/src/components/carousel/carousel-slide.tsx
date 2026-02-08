import { forwardRef } from "react";
import type { CarouselSlide, CarouselStyle, AspectRatio } from "@/lib/carousel-templates";
import { ASPECT_RATIO_DIMENSIONS, DEFAULT_HEADING_FONT_SIZE } from "@/lib/carousel-templates";

interface CarouselSlideProps {
  slide: CarouselSlide;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  authorName: string;
  showWatermark: boolean;
  scale?: number;
}

export const CarouselSlideView = forwardRef<HTMLDivElement, CarouselSlideProps>(
  ({ slide, style, aspectRatio, authorName, showWatermark, scale }, ref) => {
    const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];
    const fontSize = slide.headingFontSize || DEFAULT_HEADING_FONT_SIZE;
    const textAlign = slide.headingAlign || "left";
    const imageFit = slide.imageFit || "contain";

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
        <div className="flex-1 flex flex-col justify-between p-16">
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

          {slide.imageUrl && (
            <div className="flex-1 flex items-center justify-center my-8">
              <div className="w-full max-h-[60%] rounded-2xl overflow-hidden bg-white/10 shadow-lg">
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="w-full h-full"
                  style={{ objectFit: imageFit }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}

          {!slide.imageUrl && <div className="flex-1" />}
        </div>

        <div
          className="flex items-center justify-between px-16 pb-12"
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
