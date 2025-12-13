import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Arrow, Circle, Group, Rect, Text } from "react-konva";
import useImage from "use-image";
import {
    Overlay as Annotation,
    ArrowAnnotation,
    CircleAnnotation,
    HideAnnotation,
    TextAnnotation,
} from "@/types/db";

interface ViewerCanvasProps {
    screenshotUrl?: string;
    overlays?: Array<any>;
}

// Helper to convert percentage-based overlay to pixel-based for rendering
function overlayToPixels(overlay: any, width: number, height: number): Annotation | null {
    if (!overlay || !overlay.type) return null;

    const minDim = Math.min(width, height);

    if (overlay.type === 'circle') {
        return {
            id: overlay.id,
            type: 'circle',
            x: (overlay.x / 100) * width,
            y: (overlay.y / 100) * height,
            radius: (overlay.radius || 2.5) * (minDim / 100),
            color: overlay.color || '#ef4444',
            strokeWidth: overlay.strokeWidth || 3,
        } as CircleAnnotation;
    }

    if (overlay.type === 'arrow') {
        if (overlay.points) {
            return {
                id: overlay.id,
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
        // Legacy format
        if (overlay.from && overlay.to) {
            return {
                id: overlay.id,
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
            id: overlay.id,
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
            id: overlay.id,
            type: 'text',
            x: (overlay.x / 100) * width,
            y: (overlay.y / 100) * height,
            text: overlay.text || '',
            fontSize: (overlay.fontSize || 20) * (Math.min(width, height) / 1000) + 12, // Scale text slightly based on view
            fontFamily: overlay.fontFamily || 'Arial',
            fill: overlay.fill || '#000000',
        } as TextAnnotation;
    }

    return null;
}

export function ViewerCanvas({ screenshotUrl, overlays }: ViewerCanvasProps) {
    const [image] = useImage(screenshotUrl || "");
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [renderableOverlays, setRenderableOverlays] = useState<Annotation[]>([]);

    // Calculate dimensions to fit container while maintaining aspect ratio
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const availableWidth = containerRef.current.clientWidth;
                // Limit height to reasonable max height (e.g., 60vh) so it doesn't take up entire screen
                const maxHeight = window.innerHeight * 0.6;

                let newWidth = availableWidth;
                let newHeight = 0;

                if (image) {
                    const aspectRatio = image.width / image.height;
                    newHeight = newWidth / aspectRatio;

                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                        newWidth = newHeight * aspectRatio;
                    }
                } else {
                    // Default placeholder ratio
                    newHeight = newWidth * (9 / 16);
                }

                setDimensions({ width: newWidth, height: newHeight });
            }
        };

        updateDimensions();
        // Add event listener for window resize
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [image]);

    // Update renderable overlays when dimensions or props change
    useEffect(() => {
        if (overlays && dimensions.width > 0 && dimensions.height > 0) {
            const pixels = overlays
                .map(o => overlayToPixels(o, dimensions.width, dimensions.height))
                .filter((o): o is Annotation => o !== null);
            setRenderableOverlays(pixels);
        }
    }, [overlays, dimensions]);


    const renderHideAnnotation = (annotation: HideAnnotation) => {
        const x = annotation.width < 0 ? annotation.x + annotation.width : annotation.x;
        const y = annotation.height < 0 ? annotation.y + annotation.height : annotation.y;
        const width = Math.abs(annotation.width);
        const height = Math.abs(annotation.height);

        return (
            <Group
                key={annotation.id}
                x={x}
                y={y}
            >
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
        return (
            <Text
                key={annotation.id}
                x={annotation.x}
                y={annotation.y}
                text={annotation.text}
                fontSize={annotation.fontSize}
                fontFamily={annotation.fontFamily}
                fill={annotation.fill}
            />
        );
    };

    return (
        <div ref={containerRef} className="w-full h-full flex justify-center items-center">
            {dimensions.width > 0 && dimensions.height > 0 && (
                <div
                    className="relative overflow-hidden rounded-md shadow-sm border bg-muted/10 ring-1 ring-black/5"
                    style={{ width: dimensions.width, height: dimensions.height }}
                >
                    <Stage
                        width={dimensions.width}
                        height={dimensions.height}
                        scaleX={1}
                        scaleY={1}
                    >
                        <Layer>
                            {image && (
                                <KonvaImage
                                    image={image}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    listening={false}
                                />
                            )}
                            {renderableOverlays.map((annotation) => {
                                if (annotation.type === 'text') {
                                    return renderTextAnnotation(annotation as TextAnnotation);
                                }
                                if (annotation.type === 'arrow') {
                                    return (
                                        <Arrow
                                            key={annotation.id}
                                            points={annotation.points}
                                            stroke={annotation.color}
                                            strokeWidth={annotation.strokeWidth}
                                            fill={annotation.color}
                                            pointerLength={12}
                                            pointerWidth={12}
                                        />
                                    );
                                }
                                if (annotation.type === 'circle') {
                                    return (
                                        <Circle
                                            key={annotation.id}
                                            x={annotation.x}
                                            y={annotation.y}
                                            radius={annotation.radius}
                                            stroke={annotation.color}
                                            strokeWidth={annotation.strokeWidth}
                                        />
                                    );
                                }
                                if (annotation.type === 'hide') {
                                    return renderHideAnnotation(annotation as HideAnnotation);
                                }
                                return null;
                            })}
                        </Layer>
                    </Stage>
                </div>
            )}
        </div>
    );
}
