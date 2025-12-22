import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Arrow, Circle, Group, Transformer, Rect, Text } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { Undo2, Redo2, Trash2, Minus, Plus } from "lucide-react";
import { EditorTool } from "./editor-toolbar";
import {
  Overlay as Annotation,
  ArrowAnnotation,
  CircleAnnotation,
  HideAnnotation,
  TextAnnotation,
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

// Helper to convert percentage-based overlay to pixel-based for rendering
// ALL overlays are stored as percentages (0-100 range) for consistency
function overlayToPixels(overlay: any, width: number, height: number): Annotation | null {
  if (!overlay || !overlay.type) return null;

  const minDim = Math.min(width, height);

  if (overlay.type === 'circle') {
    return {
      id: overlay.id || generateId(),
      type: 'circle',
      x: (overlay.x / 100) * width,
      y: (overlay.y / 100) * height,
      radius: (overlay.radius || 2.5) * (minDim / 100),
      color: overlay.color || '#ef4444',
      strokeWidth: overlay.strokeWidth || 3,
    } as CircleAnnotation;
  }

  if (overlay.type === 'arrow') {
    // Handle both new format (points as percentages) and legacy format (from/to)
    if (overlay.points) {
      return {
        id: overlay.id || generateId(),
        type: 'arrow',
        points: [
          (overlay.points[0] / 100) * width,
          (overlay.points[1] / 100) * height,
          (overlay.points[2] / 100) * width,
          (overlay.points[3] / 100) * height,
        ],
        color: overlay.color || '#ef4444',
        strokeWidth: overlay.strokeWidth || 4,
      } as ArrowAnnotation;
    }
    // Legacy format with from/to
    if (overlay.from && overlay.to) {
      return {
        id: overlay.id || generateId(),
        type: 'arrow',
        points: [
          (overlay.from[0] / 100) * width,
          (overlay.from[1] / 100) * height,
          (overlay.to[0] / 100) * width,
          (overlay.to[1] / 100) * height,
        ],
        color: overlay.color || '#ef4444',
        strokeWidth: overlay.strokeWidth || 4,
      } as ArrowAnnotation;
    }
  }

  if (overlay.type === 'hide') {
    return {
      id: overlay.id || generateId(),
      type: 'hide',
      x: (overlay.x / 100) * width,
      y: (overlay.y / 100) * height,
      width: (overlay.width / 100) * width,
      height: (overlay.height / 100) * height,
      color: overlay.color || '#000000',
    } as HideAnnotation;
  }

  if (overlay.type === 'text') {
    return {
      id: overlay.id || generateId(),
      type: 'text',
      x: (overlay.x / 100) * width,
      y: (overlay.y / 100) * height,
      text: overlay.text || '',
      fontSize: overlay.fontSize || 20,
      fontFamily: overlay.fontFamily || 'Arial',
      fill: overlay.fill || '#000000',
    } as TextAnnotation;
  }

  return null;
}

// Helper to convert pixel-based annotation to percentage-based for storage
function annotationToPercent(annotation: Annotation, width: number, height: number): any {
  const minDim = Math.min(width, height);

  if (annotation.type === 'circle') {
    return {
      ...annotation,
      x: (annotation.x / width) * 100,
      y: (annotation.y / height) * 100,
      radius: (annotation.radius / minDim) * 100,
    };
  }

  if (annotation.type === 'arrow') {
    return {
      ...annotation,
      points: [
        (annotation.points[0] / width) * 100,
        (annotation.points[1] / height) * 100,
        (annotation.points[2] / width) * 100,
        (annotation.points[3] / height) * 100,
      ],
    };
  }

  if (annotation.type === 'hide') {
    return {
      ...annotation,
      x: (annotation.x / width) * 100,
      y: (annotation.y / height) * 100,
      width: (annotation.width / width) * 100,
      height: (annotation.height / height) * 100,
    };
  }

  if (annotation.type === 'text') {
    return {
      ...annotation,
      x: (annotation.x / width) * 100,
      y: (annotation.y / height) * 100,
    };
  }

  return annotation;
}


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

const FONT_FAMILIES = [
  { name: 'Sans Serif', value: 'Arial' },
  { name: 'Serif', value: 'Georgia' },
  { name: 'Mono', value: 'Courier New' },
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempAnnotation, setTempAnnotation] = useState<Annotation | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[5]); // Default to Indigo
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>(ANNOTATION_DEFAULTS.text.fontFamily || 'Arial');
  const [selectedFontSize, setSelectedFontSize] = useState<number>(ANNOTATION_DEFAULTS.text.fontSize);

  // Ref to track if we are currently syncing from props to avoid triggering updates back to parent
  const isSyncingRef = useRef(false);
  // Ref to store the latest callback without causing re-renders
  const onAnnotationsChangeRef = useRef(onAnnotationsChange);
  onAnnotationsChangeRef.current = onAnnotationsChange;

  // Container dimensions - must be declared before useEffect that uses it
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with overlays from props
  const { annotations, set: setAnnotations, undo, redo, canUndo, canRedo } = useAnnotationHistory([]);

  // Sync internal history with external props when they change (e.g. switching steps)
  // Convert percentage-based overlays from backend to pixel-based for rendering
  useEffect(() => {
    if (overlays && dimensions.width > 0 && dimensions.height > 0) {
      isSyncingRef.current = true;
      const pixelOverlays = overlays
        .map(o => overlayToPixels(o, dimensions.width, dimensions.height))
        .filter((o): o is Annotation => o !== null);
      console.log('[Canvas] Syncing overlays from props:', overlays.length, '→', pixelOverlays.length, 'pixel overlays');
      setAnnotations(pixelOverlays);
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [currentStepId, screenshotUrl, dimensions.width, dimensions.height]);

  // Update dimensions on mount, resize, and when image loads
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        // Limit height to 75% of viewport height to prevent it from going off-screen
        const maxHeight = window.innerHeight * 0.75;

        let newWidth = availableWidth;
        let newHeight;

        if (image) {
          const aspectRatio = image.width / image.height;
          // First try to fit by width
          newHeight = newWidth / aspectRatio;

          // If height is too tall, constrain by height instead
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
        } else {
          // Default to 16:9 aspect ratio if no image is loaded yet
          const aspectRatio = 16 / 9;
          newHeight = newWidth / aspectRatio;

          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }
        }

        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [image]);

  // Notify parent of annotation changes (use ref to avoid infinite loops)
  // Convert pixel-based annotations to percentage-based for storage
  useEffect(() => {
    if (!isSyncingRef.current && dimensions.width > 0 && dimensions.height > 0) {
      const percentAnnotations = annotations.map(a =>
        annotationToPercent(a, dimensions.width, dimensions.height)
      );
      onAnnotationsChangeRef.current?.(percentAnnotations);
    }
  }, [annotations, dimensions.width, dimensions.height]);

  // Sync selectedColor with selected annotation
  useEffect(() => {
    if (selectedId) {
      const annotation = annotations.find(a => a.id === selectedId);
      if (annotation) {
        if (annotation.type === 'text') {
          setSelectedColor(annotation.fill);
          setSelectedFontFamily(annotation.fontFamily || 'Arial');
          setSelectedFontSize(annotation.fontSize);
        } else {
          setSelectedColor(annotation.color);
        }
      }
    }
  }, [selectedId, annotations]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reset delete confirm when selection changes
  useEffect(() => {
    setDeleteConfirmId(null);
  }, [selectedId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle delete if we are editing text
      if (editingId) return;

      // Don't handle delete if focus is on an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();

        if (deleteConfirmId === selectedId) {
          setAnnotations(annotations.filter(a => a.id !== selectedId));
          setSelectedId(null);
          setDeleteConfirmId(null);
        } else {
          setDeleteConfirmId(selectedId);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
        setSelectedId(null);
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z' && canRedo) {
        e.preventDefault();
        redo();
        setSelectedId(null);
      }

      if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, annotations, setAnnotations, undo, redo, canUndo, canRedo, editingId, deleteConfirmId]);

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
      const annotation = annotations.find(a => a.id === selectedId);
      if (annotation?.type === 'text') {
        handleAnnotationChange(selectedId, { fill: color } as any);
      } else {
        handleAnnotationChange(selectedId, { color });
      }
    }
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    setSelectedFontFamily(fontFamily);
    if (selectedId) {
      const annotation = annotations.find(a => a.id === selectedId);
      if (annotation?.type === 'text') {
        handleAnnotationChange(selectedId, { fontFamily } as any);
      }
    }
  };

  const handleFontSizeChange = (fontSize: number) => {
    setSelectedFontSize(fontSize);
    if (selectedId) {
      const annotation = annotations.find(a => a.id === selectedId);
      if (annotation?.type === 'text') {
        handleAnnotationChange(selectedId, { fontSize } as any);
      }
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.getType() === 'Layer';
    if (clickedOnEmpty) {
      setSelectedId(null);
      setEditingId(null);
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

    // Handle text tool
    if (activeTool === 'text') {
      const newText: TextAnnotation = {
        id: generateId(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Double click to edit',
        fontSize: selectedFontSize,
        fontFamily: selectedFontFamily,
        fill: selectedColor,
      };
      setAnnotations([...annotations, newText]);
      setSelectedId(newText.id);
      return;
    }

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

  const renderTextAnnotation = (annotation: TextAnnotation) => {
    const isSelected = annotation.id === selectedId;
    const isEditing = annotation.id === editingId;

    if (isEditing) return null;

    return (
      <Text
        key={annotation.id}
        id={annotation.id}
        x={annotation.x}
        y={annotation.y}
        text={annotation.text}
        fontSize={annotation.fontSize}
        fontFamily={annotation.fontFamily}
        fill={annotation.fill}
        draggable={activeTool === 'pointer'}
        onClick={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
        onTap={() => activeTool === 'pointer' && setSelectedId(annotation.id)}
        onDblClick={() => {
          if (activeTool === 'pointer') {
            setEditingId(annotation.id);
            setSelectedId(annotation.id);
          }
        }}
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

          // Update font size based on scale
          const newFontSize = annotation.fontSize * Math.max(scaleX, scaleY);

          handleAnnotationChange(annotation.id, {
            x: node.x(),
            y: node.y(),
            fontSize: newFontSize,
            rotation: node.rotation(),
          } as any);

          node.scaleX(1);
          node.scaleY(1);
        }}
        shadowColor={isSelected ? '#000' : undefined}
        shadowBlur={isSelected ? 10 : undefined}
        shadowOpacity={isSelected ? 0.3 : undefined}
      />
    );
  };

  // Render annotation components
  const renderAnnotations = (annotationsToRender: Annotation[]) => {
    return annotationsToRender.map((annotation) => {
      const isSelected = annotation.id === selectedId;

      if (annotation.type === 'text') {
        return renderTextAnnotation(annotation as TextAnnotation);
      }

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
    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-50)] p-8 pb-16 relative overflow-hidden">
      <div className="max-w-5xl w-full space-y-4 z-10">
        {/* Toolbar for undo/redo/delete with icons */}

        {/* Canvas */}
        <div ref={containerRef} className="w-full flex justify-center">
          <div
            className="bg-background rounded-xl shadow-2xl overflow-hidden border border-border relative"
            style={{ width: dimensions.width, height: dimensions.height }}
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
            {editingId && (() => {
              const annotation = annotations.find(a => a.id === editingId);
              if (!annotation || annotation.type !== 'text') return null;
              const textAnnotation = annotation as TextAnnotation;

              return (
                <textarea
                  ref={textareaRef}
                  value={textAnnotation.text}
                  onChange={(e) => handleAnnotationChange(textAnnotation.id, { text: e.target.value } as any)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      setEditingId(null);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: textAnnotation.y - 2, // Adjustment for padding/border
                    left: textAnnotation.x - 2,
                    fontSize: `${textAnnotation.fontSize}px`,
                    fontFamily: textAnnotation.fontFamily || 'Arial',
                    color: textAnnotation.fill,
                    border: '1px dashed #000',
                    background: 'rgba(255, 255, 255, 0.5)',
                    resize: 'none',
                    outline: 'none',
                    padding: '0px',
                    margin: 0,
                    lineHeight: 1,
                    whiteSpace: 'pre',
                    overflow: 'hidden',
                    minWidth: '100px',
                    minHeight: `${textAnnotation.fontSize}px`,
                  }}
                  autoFocus
                />
              );
            })()}
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="flex justify-center items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--color-50)] px-4 py-2.5 rounded-full shadow-lg border border-[var(--color-200)]">
            <Button
              onClick={undo}
              disabled={!canUndo}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-[var(--color-900)] hover:text-primary hover:bg-primary/15"
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={redo}
              disabled={!canRedo}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-[var(--color-900)] hover:text-primary hover:bg-primary/15"
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </Button>

            <div className="h-6 w-px bg-[var(--color-300)]" />

            {(activeTool === 'text' || (selectedId && annotations.find(a => a.id === selectedId)?.type === 'text')) && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-3 text-[var(--color-900)] hover:text-primary hover:bg-primary/15 text-sm font-medium w-28 justify-between"
                      title="Font Family"
                    >
                      <span className="truncate">
                        {FONT_FAMILIES.find(f => f.value === selectedFontFamily)?.name || 'Font'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-1" side="top">
                    <div className="flex flex-col gap-1">
                      {FONT_FAMILIES.map((font) => (
                        <button
                          key={font.value}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded text-sm hover:bg-primary/10 transition-colors",
                            selectedFontFamily === font.value && "bg-primary/10 text-primary"
                          )}
                          style={{ fontFamily: font.value }}
                          onClick={() => handleFontFamilyChange(font.value)}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="h-6 w-px bg-[var(--color-300)]" />

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-[var(--color-900)] hover:text-primary hover:bg-primary/15"
                    onClick={() => handleFontSizeChange(Math.max(12, selectedFontSize - 4))}
                    title="Decrease font size"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center text-[var(--color-900)]">{selectedFontSize}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-[var(--color-900)] hover:text-primary hover:bg-primary/15"
                    onClick={() => handleFontSizeChange(Math.min(128, selectedFontSize + 4))}
                    title="Increase font size"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="h-6 w-px bg-[var(--color-300)]" />
              </>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-primary/15 p-2"
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

            <div className="h-6 w-px bg-[var(--color-300)]" />

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
              className="h-10 w-10 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700"
              title={selectedId ? "Delete annotation" : "Delete step"}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}