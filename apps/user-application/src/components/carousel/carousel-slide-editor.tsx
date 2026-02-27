import { useRef, useState, useEffect, createRef } from "react";
import {
  CarouselSlideView,
  type CarouselEditableElement,
  type CarouselResizeHandle,
} from "./carousel-slide";
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
  onUpdateSlide: (slideId: string, data: Partial<CarouselSlide>) => void;
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
  onUpdateSlide,
}: CarouselSlideEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [selectedElement, setSelectedElement] =
    useState<CarouselEditableElement | null>(null);
  const [interaction, setInteraction] = useState<{
    mode: "move" | "resize" | "rotate";
    element: CarouselEditableElement;
    handle?: CarouselResizeHandle;
    startClientX: number;
    startClientY: number;
    startOffsetX: number;
    startOffsetY: number;
    startWidthPercent: number;
    startScale: number;
    startRotation: number;
    centerX?: number;
    centerY?: number;
    startAngle?: number;
  } | null>(null);

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

  useEffect(() => {
    setInteraction(null);
    setSelectedElement(null);
  }, [slide.id]);

  useEffect(() => {
    if (!slide.imageUrl && selectedElement === "image") {
      setSelectedElement(null);
    }
  }, [slide.imageUrl, selectedElement]);

  useEffect(() => {
    if (!interaction) return;

    const handlePointerMove = (event: PointerEvent) => {
      const dx = (event.clientX - interaction.startClientX) / scale;
      const dy = (event.clientY - interaction.startClientY) / scale;

      if (interaction.mode === "move") {
        const nextX = Math.round(interaction.startOffsetX + dx);
        const nextY = Math.round(interaction.startOffsetY + dy);

        if (interaction.element === "heading") {
          onUpdateSlide(slide.id, {
            headingOffsetX: nextX,
            headingOffsetY: nextY,
          });
          return;
        }

        onUpdateSlide(slide.id, {
          imageOffsetX: nextX,
          imageOffsetY: nextY,
        });
        return;
      }

      if (interaction.mode === "resize") {
        if (interaction.element === "heading") {
          const direction =
            interaction.handle === "right" ||
            interaction.handle === "top-right" ||
            interaction.handle === "bottom-right"
              ? 1
              : -1;
          const deltaPercent = (dx / dimensions.width) * 100 * direction;
          const nextWidth = clamp(
            interaction.startWidthPercent + deltaPercent,
            20,
            100
          );

          onUpdateSlide(slide.id, {
            headingMaxWidth: Math.round(nextWidth),
          });
          return;
        }

        const signX =
          interaction.handle === "top-right" ||
          interaction.handle === "bottom-right"
            ? 1
            : -1;
        const signY =
          interaction.handle === "bottom-left" ||
          interaction.handle === "bottom-right"
            ? 1
            : -1;
        const delta = (signX * dx + signY * dy) / 2;
        const nextScale = clamp(
          interaction.startScale + delta / 280,
          0.2,
          3
        );

        onUpdateSlide(slide.id, {
          imageScale: Math.round(nextScale * 100) / 100,
        });
        return;
      }

      if (
        interaction.mode === "rotate" &&
        interaction.centerX !== undefined &&
        interaction.centerY !== undefined &&
        interaction.startAngle !== undefined
      ) {
        const currentAngle =
          (Math.atan2(
            event.clientY - interaction.centerY,
            event.clientX - interaction.centerX
          ) *
            180) /
          Math.PI;
        let deltaAngle = currentAngle - interaction.startAngle;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        const nextRotation = Math.round(interaction.startRotation + deltaAngle);

        if (interaction.element === "heading") {
          onUpdateSlide(slide.id, {
            headingRotation: nextRotation,
          });
          return;
        }

        onUpdateSlide(slide.id, {
          imageRotation: nextRotation,
        });
      }
    };

    const handlePointerUp = () => {
      setInteraction(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "";
    };
  }, [dimensions.width, interaction, onUpdateSlide, scale, slide.id]);

  const startMove = (
    element: CarouselEditableElement,
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    setSelectedElement(element);
    setInteraction({
      mode: "move",
      element,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX:
        element === "heading"
          ? slide.headingOffsetX || 0
          : slide.imageOffsetX || 0,
      startOffsetY:
        element === "heading"
          ? slide.headingOffsetY || 0
          : slide.imageOffsetY || 0,
      startWidthPercent: slide.headingMaxWidth || 100,
      startScale: slide.imageScale || 1,
      startRotation:
        element === "heading"
          ? slide.headingRotation || 0
          : slide.imageRotation || 0,
    });
  };

  const startResize = (
    element: CarouselEditableElement,
    handle: CarouselResizeHandle,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    setSelectedElement(element);
    setInteraction({
      mode: "resize",
      element,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX:
        element === "heading"
          ? slide.headingOffsetX || 0
          : slide.imageOffsetX || 0,
      startOffsetY:
        element === "heading"
          ? slide.headingOffsetY || 0
          : slide.imageOffsetY || 0,
      startWidthPercent: slide.headingMaxWidth || 100,
      startScale: slide.imageScale || 1,
      startRotation:
        element === "heading"
          ? slide.headingRotation || 0
          : slide.imageRotation || 0,
    });
  };

  const startRotate = (
    element: CarouselEditableElement,
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    const wrapper = (event.currentTarget.closest(
      "[data-editable-element]"
    ) as HTMLElement | null);
    const rect = wrapper?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle =
      (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) /
      Math.PI;

    setSelectedElement(element);
    setInteraction({
      mode: "rotate",
      element,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX:
        element === "heading"
          ? slide.headingOffsetX || 0
          : slide.imageOffsetX || 0,
      startOffsetY:
        element === "heading"
          ? slide.headingOffsetY || 0
          : slide.imageOffsetY || 0,
      startWidthPercent: slide.headingMaxWidth || 100,
      startScale: slide.imageScale || 1,
      startRotation:
        element === "heading"
          ? slide.headingRotation || 0
          : slide.imageRotation || 0,
      centerX,
      centerY,
      startAngle,
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[var(--color-50)] overflow-hidden"
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-editable-element]")) {
          setSelectedElement(null);
        }
      }}
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
            editorBindings={{
              selectedElement,
              onSelectElement: setSelectedElement,
              onStartMove: startMove,
              onStartResize: startResize,
              onStartRotate: startRotate,
            }}
          />
        </div>
      </div>

      {/* Hidden full-resolution slides for export */}
      <div className="fixed -left-[9999px] -top-[9999px]" aria-hidden>
        {allSlides.map((s) => {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
