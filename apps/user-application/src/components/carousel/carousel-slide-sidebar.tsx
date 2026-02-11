import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Check, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import type { CarouselSlide, CarouselStyle, AspectRatio } from "@/lib/carousel-templates";
import { ASPECT_RATIO_DIMENSIONS } from "@/lib/carousel-templates";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CarouselSlideSidebarProps {
  slides: CarouselSlide[];
  selectedSlideId: string;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  onSlideSelect: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onReorderSlides: (slides: CarouselSlide[]) => void;
  onAddSlide: () => void;
}

interface SortableSlideItemProps {
  slide: CarouselSlide;
  index: number;
  isActive: boolean;
  isDeleting: boolean;
  style: CarouselStyle;
  aspectRatio: AspectRatio;
  onSelect: (id: string) => void;
  onDeleteClick: (id: string, e: React.MouseEvent) => void;
  onDeleteMouseLeave: (id: string) => void;
}

function SortableSlideItem({
  slide,
  index,
  isActive,
  isDeleting,
  style: carouselStyle,
  aspectRatio,
  onSelect,
  onDeleteClick,
  onDeleteMouseLeave,
}: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        "group relative flex flex-col gap-1.5 mb-4 last:mb-0",
        isDragging && "shadow-lg rounded-xl bg-white/80"
      )}
    >
      <div className="flex items-center gap-1.5 px-1">
        <button
          className={cn(
            "cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-[var(--color-100)] transition-colors shrink-0",
            "text-[var(--color-400)] hover:text-[var(--color-600)]",
            "opacity-0 group-hover:opacity-100 focus:opacity-100"
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <span
          className={cn(
            "text-xs font-bold transition-colors shrink-0",
            isActive
              ? "text-primary"
              : "text-[var(--color-500)]"
          )}
        >
          {index + 1}
        </span>
        {slide.heading && (
          <span
            className={cn(
              "text-[10px] leading-tight line-clamp-1 transition-colors",
              isActive
                ? "text-primary/70"
                : "text-[var(--color-400)]"
            )}
          >
            {slide.heading}
          </span>
        )}
      </div>

      <div
        onClick={() => onSelect(slide.id)}
        className={cn(
          "relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300",
          isActive
            ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
            : "border border-white/40 shadow-sm hover:shadow-lg hover:border-primary/20 hover:translate-y-[-2px] opacity-90 hover:opacity-100"
        )}
        style={{ aspectRatio: `${dims.width}/${dims.height}` }}
      >
        {/* Mini slide preview */}
        <div
          className="w-full h-full flex flex-col p-3"
          style={{
            backgroundColor: carouselStyle.backgroundColor,
            fontFamily: carouselStyle.fontFamily,
          }}
        >
          <p
            className="text-[8px] font-bold leading-tight line-clamp-3"
            style={{ color: carouselStyle.headingColor }}
          >
            {slide.heading || "Untitled"}
          </p>
          {slide.imageUrl && (
            <div className="flex-1 flex items-center justify-center mt-1">
              <div className="w-full rounded overflow-hidden bg-white/10" style={{ maxHeight: "50%" }}>
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete button */}
      <div
        className={cn(
          "absolute -right-1.5 top-6 transition-all duration-200 z-10 translate-x-2",
          isDeleting
            ? "opacity-100 translate-x-0"
            : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
        )}
      >
        <Button
          variant={isDeleting ? "destructive" : "secondary"}
          size="icon"
          className={cn(
            "h-6 w-6 rounded-full shadow-md transition-all duration-200 border",
            isDeleting
              ? "bg-red-500 hover:bg-red-600 text-white border-red-400"
              : "bg-white hover:bg-red-50 text-muted-foreground hover:text-red-500 border-[var(--color-200)]"
          )}
          onClick={(e) => onDeleteClick(slide.id, e)}
          onMouseLeave={() => onDeleteMouseLeave(slide.id)}
        >
          {isDeleting ? (
            <Check className="w-3 h-3" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function CarouselSlideSidebar({
  slides,
  selectedSlideId,
  style: carouselStyle,
  aspectRatio,
  onSlideSelect,
  onDeleteSlide,
  onReorderSlides,
  onAddSlide,
}: CarouselSlideSidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setDeletingId(null);
  }, [selectedSlideId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      onReorderSlides(arrayMove(slides, oldIndex, newIndex));
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (deletingId === id) {
      onDeleteSlide(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
    }
  };

  const handleDeleteMouseLeave = (id: string) => {
    if (deletingId === id) setDeletingId(null);
  };

  return (
    <div className="w-[200px] flex flex-col h-full bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 border-l border-[var(--color-200)]">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4 pb-20 pt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slides.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {slides.map((slide, index) => (
                <SortableSlideItem
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={selectedSlideId === slide.id}
                  isDeleting={deletingId === slide.id}
                  style={carouselStyle}
                  aspectRatio={aspectRatio}
                  onSelect={onSlideSelect}
                  onDeleteClick={handleDeleteClick}
                  onDeleteMouseLeave={handleDeleteMouseLeave}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add slide button */}
          <div className="pt-2 flex justify-center px-1">
            <Button
              variant="ghost"
              onClick={onAddSlide}
              className="w-full group relative overflow-hidden rounded-xl border border-dashed border-[var(--color-300)] bg-white/30 hover:bg-white/60 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300 h-12"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="bg-white rounded-full p-1 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold">Add Slide</span>
              </div>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
