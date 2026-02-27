import {
  forwardRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";
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

export type CarouselEditableElement = "heading" | "image";
export type CarouselResizeHandle =
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface CarouselSlideEditorBindings {
  selectedElement: CarouselEditableElement | null;
  onSelectElement: (element: CarouselEditableElement) => void;
  onStartMove: (
    element: CarouselEditableElement,
    event: ReactPointerEvent<HTMLDivElement>
  ) => void;
  onStartResize: (
    element: CarouselEditableElement,
    handle: CarouselResizeHandle,
    event: ReactPointerEvent<HTMLButtonElement>
  ) => void;
  onStartRotate: (
    element: CarouselEditableElement,
    event: ReactPointerEvent<HTMLButtonElement>
  ) => void;
}

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
  editorBindings?: CarouselSlideEditorBindings;
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
      editorBindings,
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
      slide.imageRotation
    );

    const headingStyle = {
      color: style.headingColor,
      fontFamily: style.fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight: slide.headingLineHeight || 1.15,
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
      <EditableWrapper
        element="heading"
        editorBindings={editorBindings}
        className="shrink-0"
        style={{
          width: `${slide.headingMaxWidth || 100}%`,
          ...(headingTransform ? { transform: headingTransform } : {}),
        }}
        resizeHandles={[
          "left",
          "right",
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ]}
      >
        <h2
          style={headingStyle}
          className="font-bold whitespace-pre-wrap break-words mt-8"
        >
          {slide.heading || "\u00A0"}
        </h2>
      </EditableWrapper>
    );

    const imageEl = slide.imageUrl ? (
      <div className="flex-1 flex items-center justify-center min-h-0 mt-6">
        <EditableWrapper
          element="image"
          editorBindings={editorBindings}
          className="inline-flex max-w-full max-h-full"
          style={imageTransform ? { transform: imageTransform } : undefined}
          resizeHandles={["top-left", "top-right", "bottom-left", "bottom-right"]}
        >
          <OverlayImage slide={slide} />
        </EditableWrapper>
      </div>
    ) : null;

    const centeredImageEl = slide.imageUrl ? (
      <div
        className="shrink-0 flex items-center justify-center mt-6"
        style={{
          maxHeight: "40%",
        }}
      >
        <EditableWrapper
          element="image"
          editorBindings={editorBindings}
          className="inline-flex max-w-full max-h-full"
          style={imageTransform ? { transform: imageTransform } : undefined}
          resizeHandles={["top-left", "top-right", "bottom-left", "bottom-right"]}
        >
          <OverlayImage slide={slide} />
        </EditableWrapper>
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

function EditableWrapper({
  element,
  editorBindings,
  className,
  style,
  resizeHandles,
  children,
}: {
  element: CarouselEditableElement;
  editorBindings?: CarouselSlideEditorBindings;
  className?: string;
  style?: React.CSSProperties;
  resizeHandles: CarouselResizeHandle[];
  children: React.ReactNode;
}) {
  const isSelected = editorBindings?.selectedElement === element;

  const handleMoveStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editorBindings) return;
    event.preventDefault();
    event.stopPropagation();
    editorBindings.onSelectElement(element);
    editorBindings.onStartMove(element, event);
  };

  return (
    <div
      data-editable-element={element}
      className={cn("relative min-w-0", editorBindings && "cursor-move", className)}
      style={style}
      onPointerDown={editorBindings ? handleMoveStart : undefined}
    >
      {children}

      {editorBindings && isSelected && (
        <div className="absolute inset-[-10px] z-30 pointer-events-none">
          <div className="absolute inset-0 rounded-sm border-2 border-primary shadow-[0_0_0_1px_rgba(99,102,241,0.3)]" />

          {resizeHandles.map((handle) => (
            <ResizeHandleButton
              key={handle}
              handle={handle}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                editorBindings.onStartResize(element, handle, event);
              }}
            />
          ))}

          <button
            type="button"
            className="pointer-events-auto absolute left-1/2 -bottom-12 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-sm text-foreground shadow-sm hover:bg-muted/70"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              editorBindings.onStartRotate(element, event);
            }}
            aria-label={`Rotate ${element}`}
          >
            ↻
          </button>
        </div>
      )}
    </div>
  );
}

function buildTransform(
  offsetX?: number,
  offsetY?: number,
  rotation?: number
): string | undefined {
  const parts: string[] = [];
  if (offsetX || offsetY) {
    parts.push(`translate(${offsetX || 0}px, ${offsetY || 0}px)`);
  }
  if (rotation) {
    parts.push(`rotate(${rotation}deg)`);
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function ResizeHandleButton({
  handle,
  onPointerDown,
}: {
  handle: CarouselResizeHandle;
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  const positionClassMap: Record<CarouselResizeHandle, string> = {
    left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
    right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
    "top-left": "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
    "top-right": "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
    "bottom-left":
      "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
    "bottom-right":
      "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
  };

  return (
    <button
      type="button"
      className={cn(
        "pointer-events-auto absolute h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm",
        positionClassMap[handle]
      )}
      onPointerDown={onPointerDown}
      aria-label={`Resize from ${handle}`}
    />
  );
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
  const imageScale = slide.imageScale ?? 1;
  const imageWidthPercent = slide.imageWidthPercent ?? 100;
  const imageHeightPercent = slide.imageHeightPercent ?? 100;

  return (
    <div
      className="relative inline-block max-w-full max-h-full shadow-lg"
      style={{
        width: `${imageWidthPercent}%`,
        height: `${imageHeightPercent}%`,
        borderRadius,
        overflow: borderRadius > 0 ? "hidden" : undefined,
        transform: imageScale !== 1 ? `scale(${imageScale})` : undefined,
        transformOrigin: "center center",
      }}
    >
      <img
        src={slide.imageUrl || undefined}
        alt=""
        className="block w-full h-full object-contain"
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
