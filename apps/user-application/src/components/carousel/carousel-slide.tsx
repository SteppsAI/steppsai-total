import { forwardRef, useState } from "react";
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
        <OverlayImage slide={slide} />
      </div>
    ) : null;

    const centeredImageEl = slide.imageUrl ? (
      <div
        className="shrink-0 flex items-center justify-center mt-6"
        style={{
          maxHeight: "40%",
          ...(imageTransform ? { transform: imageTransform } : {}),
        }}
      >
        <OverlayImage slide={slide} />
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

    return (
      <div
        ref={ref}
        style={outerStyle}
        className="relative flex flex-col overflow-hidden shrink-0"
      >
        {slideNumberEl}

        <div className="flex-1 flex flex-col p-16 pb-4 min-h-0">
          {layout === "image-first" ? (
            <>
              {imageEl}
              {headingEl}
              {!imageEl && <div className="flex-1" />}
            </>
          ) : layout === "centered" ? (
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

function getArrowPoints(overlay: any): [number, number, number, number] | null {
  if (Array.isArray(overlay?.points) && overlay.points.length === 4) {
    return [
      Number(overlay.points[0]) || 0,
      Number(overlay.points[1]) || 0,
      Number(overlay.points[2]) || 0,
      Number(overlay.points[3]) || 0,
    ];
  }
  if (Array.isArray(overlay?.from) && Array.isArray(overlay?.to)) {
    return [
      Number(overlay.from[0]) || 0,
      Number(overlay.from[1]) || 0,
      Number(overlay.to[0]) || 0,
      Number(overlay.to[1]) || 0,
    ];
  }
  return null;
}

function OverlayImage({ slide }: { slide: CarouselSlide }) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const overlays = Array.isArray(slide.overlays) ? slide.overlays : [];
  const viewWidth = naturalSize?.width || 1000;
  const viewHeight = naturalSize?.height || 1000;
  const minDim = Math.min(viewWidth, viewHeight);
  const borderRadius = slide.imageBorderRadius ?? 0;

  return (
    <div
      className="relative inline-block max-w-full max-h-full shadow-lg"
      style={{
        borderRadius,
        overflow: borderRadius > 0 ? "hidden" : undefined,
      }}
    >
      <img
        src={slide.imageUrl || undefined}
        alt=""
        className="block max-w-full max-h-full object-contain"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
          }
        }}
      />

      {overlays.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {overlays.map((overlay: any, index) => {
            if (!overlay || !overlay.type) return null;

            if (overlay.type === "arrow") {
              const points = getArrowPoints(overlay);
              if (!points) return null;
              const [x1p, y1p, x2p, y2p] = points;
              const x1 = (x1p / 100) * viewWidth;
              const y1 = (y1p / 100) * viewHeight;
              const x2 = (x2p / 100) * viewWidth;
              const y2 = (y2p / 100) * viewHeight;
              const strokeWidth = overlay.strokeWidth || 4;
              const color = overlay.color || "#ef4444";
              const markerId = `arrowhead-${index}`;

              return (
                <g key={overlay.id || `arrow-${index}`}>
                  <defs>
                    <marker
                      id={markerId}
                      markerWidth={8}
                      markerHeight={8}
                      refX={7}
                      refY={3.5}
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,7 L7,3.5 z" fill={color} />
                    </marker>
                  </defs>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                  />
                </g>
              );
            }

            if (overlay.type === "circle") {
              const x = ((overlay.x || 0) / 100) * viewWidth;
              const y = ((overlay.y || 0) / 100) * viewHeight;
              const radius = ((overlay.radius || 2.5) / 100) * minDim;

              return (
                <circle
                  key={overlay.id || `circle-${index}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="none"
                  stroke={overlay.color || "#ef4444"}
                  strokeWidth={overlay.strokeWidth || 3}
                />
              );
            }

            if (overlay.type === "hide") {
              const x = ((overlay.x || 0) / 100) * viewWidth;
              const y = ((overlay.y || 0) / 100) * viewHeight;
              const width = ((overlay.width || 0) / 100) * viewWidth;
              const height = ((overlay.height || 0) / 100) * viewHeight;
              const normalizedX = width < 0 ? x + width : x;
              const normalizedY = height < 0 ? y + height : y;

              return (
                <rect
                  key={overlay.id || `hide-${index}`}
                  x={normalizedX}
                  y={normalizedY}
                  width={Math.abs(width)}
                  height={Math.abs(height)}
                  fill={overlay.color || "#000000"}
                  rx={4}
                />
              );
            }

            if (overlay.type === "text") {
              const x = ((overlay.x || 0) / 100) * viewWidth;
              const y = ((overlay.y || 0) / 100) * viewHeight;
              const baseFontSize = overlay.fontSize || 20;
              const scaledFontSize = (baseFontSize * minDim) / 1000 + 12;
              const rotation = typeof overlay.rotation === "number" ? overlay.rotation : 0;

              return (
                <text
                  key={overlay.id || `text-${index}`}
                  x={x}
                  y={y}
                  fill={overlay.fill || "#000000"}
                  fontFamily={overlay.fontFamily || "Arial"}
                  fontSize={scaledFontSize}
                  transform={rotation ? `rotate(${rotation} ${x} ${y})` : undefined}
                >
                  {overlay.text || ""}
                </text>
              );
            }

            return null;
          })}
        </svg>
      )}
    </div>
  );
}
