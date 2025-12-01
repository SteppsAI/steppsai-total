import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Arrow, Circle, Group, Transformer, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { Undo2, Redo2, Trash2 } from "lucide-react";
import { EditorTool } from "./editor-toolbar";
import {
  Overlay as Annotation,
  ArrowAnnotation,
  CircleAnnotation,
  HideAnnotation,
} from "@/types/db";
import { ANNOTATION_DEFAULTS } from "./annotation-types";
import { useAnnotationHistory } from "@/hooks/use-annotation-history";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CanvasProps {
  screenshotUrl?: string;
  overlays?: Array<any>; // Legacy overlays prop for backward compatibility
  activeTool: EditorTool;
  onAddOverlay?: (overlay: any) => void;
  onAnnotationsChange?: (annotations: Annotation[]) => void;
  onDeleteStep?: () => void;
  currentStepId?: string;
}

// Generate unique IDs for annotations
const generateId = () => `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#0B0F19', // Dark
];

export function Canvas({
  screenshotUrl,
  overlays,
  activeTool,
  onAnnotationsChange,
  onDeleteStep,
  currentStepId,
}: CanvasProps) {
  const [image] = useImage(screenshotUrl || "");
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[5]); // Default to Indigo

  // Ref to track if we are currently syncing from props to avoid triggering updates back to parent
  const isSyncingRef = useRef(false);
  // Ref to store the latest callback without causing re-renders
  const onAnnotationsChangeRef = useRef(onAnnotationsChange);
  onAnnotationsChangeRef.current = onAnnotationsChange;

  // Initialize with overlays from props
  const { annotations, set: setAnnotations, undo, redo, canUndo, canRedo } = useAnnotationHistory(overlays || []);

  // Sync internal history with external props when they change (e.g. switching steps)
  useEffect(() => {
    if (overlays) {
      isSyncingRef.current = true;
      setAnnotations(overlays);
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [screenshotUrl]);

  // Container dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions on mount, resize, and when image loads
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();

        let height;
        if (image) {
          height = width / (image.width / image.height);
        } else {
          // Default to 16:9 aspect ratio if no image is loaded yet
          height = width / (16 / 9);
        }

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [image]);

  // Notify parent of annotation changes (use ref to avoid infinite loops)
  useEffect(() => {
    if (!isSyncingRef.current) {
      onAnnotationsChangeRef.current?.(annotations);
    }
  }, [annotations]);

  // Sync selectedColor with selected annotation
  useEffect(() => {
    if (selectedId) {
      const annotation = annotations.find(a => a.id === selectedId);
      if (annotation) {
        setSelectedColor(annotation.color);
      }
    }
  }, [selectedId, annotations]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected annotation
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        setAnnotations(annotations.filter(a => a.id !== selectedId));
        setSelectedId(null);
      }

      // Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
        setSelectedId(null);
      }

      // Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z' && canRedo) {
        e.preventDefault();
        redo();
        setSelectedId(null);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, annotations, setAnnotations, undo, redo, canUndo, canRedo]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current) return;

    const selectedNode = layerRef.current?.findOne(`#${selectedId}`);
    if (selectedNode && selectedId) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, annotations]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedId) {
      handleAnnotationChange(selectedId, { color });
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.getType() === 'Layer';
    if (clickedOnEmpty) {
      setSelectedId(null);
      if (activeTool === 'pointer') return;
    }

    // Don't start drawing if clicking on an existing annotation
    if (!clickedOnEmpty && activeTool === 'pointer') {
      return;
    }

    if (activeTool === 'pointer') return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);

    // Create temporary annotation based on tool
    if (activeTool === 'arrow') {
      const newArrow: ArrowAnnotation = {
        id: generateId(),
        type: 'arrow',
        points: [pos.x, pos.y, pos.x, pos.y],
        color: selectedColor,
        strokeWidth: ANNOTATION_DEFAULTS.arrow.strokeWidth,
      };
      setTempAnnotation(newArrow);
    } else if (activeTool === 'highlight') {
      const newCircle: CircleAnnotation = {
        id: generateId(),
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        color: selectedColor,
        strokeWidth: ANNOTATION_DEFAULTS.circle.strokeWidth,
      };
      setTempAnnotation(newCircle);
    } else if (activeTool === 'hide') {
      const newHide: HideAnnotation = {
        id: generateId(),
        type: 'hide',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: ANNOTATION_DEFAULTS.hide.color,
      };
      setTempAnnotation(newHide);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !tempAnnotation) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Update temporary annotation based on type
    if (tempAnnotation.type === 'arrow') {
      const arrow = tempAnnotation as ArrowAnnotation;
      setTempAnnotation({
        ...arrow,
        points: [arrow.points[0], arrow.points[1], pos.x, pos.y],
      });
    } else if (tempAnnotation.type === 'circle') {
      const circle = tempAnnotation as CircleAnnotation;
      const dx = pos.x - circle.x;
      const dy = pos.y - circle.y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      setTempAnnotation({
        ...circle,
        radius,
      });
    } else if (tempAnnotation.type === 'hide') {
      const hide = tempAnnotation as HideAnnotation;
      const width = pos.x - hide.x;
      const height = pos.y - hide.y;
      setTempAnnotation({
        ...hide,
        width,
        height,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !tempAnnotation) {
      setIsDrawing(false);
      return;
    }

    // Only add if annotation has meaningful size
    let shouldAdd = false;
    if (tempAnnotation.type === 'arrow') {
      const arrow = tempAnnotation as ArrowAnnotation;
      const dx = arrow.points[2] - arrow.points[0];
      const dy = arrow.points[3] - arrow.points[1];
      shouldAdd = Math.sqrt(dx * dx + dy * dy) > 10;
    } else if (tempAnnotation.type === 'circle') {
      const circle = tempAnnotation as CircleAnnotation;
      shouldAdd = circle.radius > 10;
    } else if (tempAnnotation.type === 'hide') {
      const hide = tempAnnotation as HideAnnotation;
      shouldAdd = Math.abs(hide.width) > 10 && Math.abs(hide.height) > 10;
    }

    if (shouldAdd) {
      setAnnotations([...annotations, tempAnnotation]);
    }

    setIsDrawing(false);
    setTempAnnotation(null);
  };

  const handleAnnotationChange = (id: string, newAttrs: Partial<Annotation>) => {
    const newAnnotations = annotations.map(ann => {
      if (ann.id === id) {
        return { ...ann, ...newAttrs } as Annotation;
      }
      return ann;
    });
    setAnnotations(newAnnotations);
  };

  // Render hide annotation with filled rectangle
  const renderHideAnnotation = (annotation: HideAnnotation) => {
    // Normalize width/height to handle negative values
    const x = annotation.width < 0 ? annotation.x + annotation.width : annotation.x;
    const y = annotation.height < 0 ? annotation.y + annotation.height : annotation.y;
    const width = Math.abs(annotation.width);
    const height = Math.abs(annotation.height);

    return (
      <Group
        key={annotation.id}
        id={annotation.id}
        x={x}
        y={y}
        draggable={activeTool === 'pointer'}
        onClick={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
        onTap={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
        onDragEnd={(e) => {
          handleAnnotationChange(annotation.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          handleAnnotationChange(annotation.id, {
            x: node.x(),
            y: node.y(),
            width: width * scaleX,
            height: height * scaleY,
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      >
        {/* Solid filled rectangle for hiding content */}
        <Rect
          width={width}
          height={height}
          fill={annotation.color}
          cornerRadius={4}
        />
      </Group>
    );
  };

  // Render annotation components
  const renderAnnotations = (annotationsToRender: Annotation[]) => {
    return annotationsToRender.map((annotation) => {
      const isSelected = annotation.id === selectedId;

      if (annotation.type === 'arrow') {
        return (
          <Arrow
            key={annotation.id}
            id={annotation.id}
            points={annotation.points}
            stroke={annotation.color}
            strokeWidth={annotation.strokeWidth}
            fill={annotation.color}
            pointerLength={12}
            pointerWidth={12}
            draggable={activeTool === 'pointer'}
            onClick={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
            onTap={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
            onDragEnd={(e) => {
              const node = e.target;
              handleAnnotationChange(annotation.id, {
                points: [
                  annotation.points[0] + node.x(),
                  annotation.points[1] + node.y(),
                  annotation.points[2] + node.x(),
                  annotation.points[3] + node.y(),
                ],
              });
              node.position({ x: 0, y: 0 });
            }}
            shadowColor={isSelected ? '#000' : undefined}
            shadowBlur={isSelected ? 10 : undefined}
            shadowOpacity={isSelected ? 0.3 : undefined}
          />
        );
      }

      if (annotation.type === 'circle') {
        return (
          <Circle
            key={annotation.id}
            id={annotation.id}
            x={annotation.x}
            y={annotation.y}
            radius={annotation.radius}
            stroke={annotation.color}
            strokeWidth={annotation.strokeWidth}
            draggable={activeTool === 'pointer'}
            onClick={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
            onTap={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
            onDragEnd={(e) => {
              handleAnnotationChange(annotation.id, {
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              handleAnnotationChange(annotation.id, {
                radius: annotation.radius * scaleX,
              });
              node.scaleX(1);
              node.scaleY(1);
            }}
            shadowColor={isSelected ? '#000' : undefined}
            shadowBlur={isSelected ? 10 : undefined}
            shadowOpacity={isSelected ? 0.3 : undefined}
          />
        );
      }

      if (annotation.type === 'hide') {
        return renderHideAnnotation(annotation as HideAnnotation);
      }

      return null;
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 p-8 pb-16 relative overflow-hidden">
      <div className="max-w-5xl w-full space-y-4 z-10">
        {/* Toolbar for undo/redo/delete with icons */}

        {/* Canvas */}
        <div
          ref={containerRef}
          className="bg-background rounded-xl shadow-2xl overflow-hidden border border-border"
        >
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown as any}
            onTouchMove={handleMouseMove as any}
            onTouchEnd={handleMouseUp}
            style={{ cursor: activeTool === 'pointer' ? 'default' : 'crosshair' }}
          >
            <Layer ref={layerRef}>
              {/* Background Image */}
              {image && (
                <KonvaImage
                  image={image}
                  width={dimensions.width}
                  height={dimensions.height}
                  listening={false}
                />
              )}

              {/* Render saved annotations */}
              {renderAnnotations(annotations)}

              {/* Render temporary annotation while drawing */}
              {tempAnnotation && renderAnnotations([tempAnnotation])}

              {/* Transformer for selected annotation */}
              <Transformer
                ref={transformerRef}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit resize
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>

        {/* Action buttons at bottom */}
        <div className="flex justify-center items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-xl border border-border">
            <Button
              onClick={undo}
              disabled={!canUndo}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={redo}
              disabled={!canRedo}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-primary/10"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border/50" />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 p-1.5"
                  title="Color"
                >
                  <div
                    className="w-full h-full rounded-md border border-black/10 shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" side="top" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border border-black/10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                        selectedColor === color && "ring-2 ring-offset-2 ring-primary scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="h-6 w-px bg-border/50" />

            <Button
              onClick={() => {
                if (selectedId) {
                  // Delete selected annotation
                  setAnnotations(annotations.filter(a => a.id !== selectedId));
                  setSelectedId(null);
                } else if (onDeleteStep && currentStepId) {
                  // Delete entire step if no annotation selected
                  onDeleteStep();
                }
              }}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-red-50 text-red-600"
              title={selectedId ? "Delete annotation" : "Delete step"}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}