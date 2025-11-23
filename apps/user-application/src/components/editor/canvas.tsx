import { useState, useRef } from "react";
import { EditorTool } from "./editor-toolbar";

interface Overlay {
  type: "arrow" | "circle" | "blur";
  from?: [number, number];
  to?: [number, number];
  center?: [number, number];
  radius?: number;
  rect?: { x: number; y: number; width: number; height: number };
}

interface CanvasProps {
  screenshotUrl?: string;
  overlays?: Array<Overlay>;
  activeTool: EditorTool;
  onAddOverlay: (overlay: Overlay) => void;
}

export function Canvas({ screenshotUrl, overlays = [], activeTool, onAddOverlay }: CanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [currentPoint, setCurrentPoint] = useState<[number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCoordinates = (e: React.MouseEvent<HTMLDivElement>): [number, number] => {
    if (!containerRef.current) return [0, 0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return [Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "pointer") return;

    const coords = getCoordinates(e);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentPoint(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    setCurrentPoint(getCoordinates(e));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentPoint) return;

    // Create the overlay based on the active tool
    if (activeTool === "arrow") {
      onAddOverlay({
        type: "arrow",
        from: startPoint,
        to: currentPoint
      });
    } else if (activeTool === "highlight") {
      // Calculate radius based on distance
      const dx = currentPoint[0] - startPoint[0];
      const dy = currentPoint[1] - startPoint[1];
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      const centerX = (startPoint[0] + currentPoint[0]) / 2;
      const centerY = (startPoint[1] + currentPoint[1]) / 2;

      onAddOverlay({
        type: "circle",
        center: [centerX, centerY],
        radius: radius
      });
    } else if (activeTool === "blur") {
      const x = Math.min(startPoint[0], currentPoint[0]);
      const y = Math.min(startPoint[1], currentPoint[1]);
      const width = Math.abs(currentPoint[0] - startPoint[0]);
      const height = Math.abs(currentPoint[1] - startPoint[1]);

      onAddOverlay({
        type: "blur",
        rect: { x, y, width, height }
      });
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-muted p-8 relative overflow-hidden">
      <div className="max-w-5xl w-full space-y-4 z-10">
        <div className="bg-background rounded-xl shadow-2xl overflow-hidden border border-border/50">
          <div
            ref={containerRef}
            className={`relative aspect-video bg-muted select-none ${activeTool !== "pointer" ? "cursor-crosshair" : "cursor-default"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {screenshotUrl ? (
              <img src={screenshotUrl} alt="Screenshot" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No screenshot available
              </div>
            )}

            {/* Render existing overlays */}
            {overlays.map((overlay, index) => {
              if (overlay.type === "arrow" && overlay.from && overlay.to) {
                return (
                  <svg
                    key={index}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
                      </marker>
                    </defs>
                    <line
                      x1={overlay.from[0]}
                      y1={overlay.from[1]}
                      x2={overlay.to[0]}
                      y2={overlay.to[1]}
                      stroke="#6366F1"
                      strokeWidth="2"
                      markerEnd={`url(#arrowhead-${index})`}
                    />
                  </svg>
                );
              }
              if (overlay.type === "circle" && overlay.center && overlay.radius) {
                return (
                  <div
                    key={index}
                    className="absolute border-4 border-yellow-400 rounded-full pointer-events-none shadow-sm"
                    style={{
                      left: `${overlay.center[0] - overlay.radius}%`,
                      top: `${overlay.center[1] - overlay.radius}%`,
                      width: `${overlay.radius * 2}%`,
                      height: `${overlay.radius * 2}%`,
                    }}
                  />
                );
              }
              if (overlay.type === "blur" && overlay.rect) {
                return (
                  <div
                    key={index}
                    className="absolute backdrop-blur-md bg-background/30 pointer-events-none border border-white/20"
                    style={{
                      left: `${overlay.rect.x}%`,
                      top: `${overlay.rect.y}%`,
                      width: `${overlay.rect.width}%`,
                      height: `${overlay.rect.height}%`,
                    }}
                  />
                );
              }
              return null;
            })}

            {/* Render active drawing */}
            {isDrawing && startPoint && currentPoint && (
              <>
                {activeTool === "arrow" && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <marker id="arrowhead-drawing" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
                      </marker>
                    </defs>
                    <line
                      x1={startPoint[0]}
                      y1={startPoint[1]}
                      x2={currentPoint[0]}
                      y2={currentPoint[1]}
                      stroke="#6366F1"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead-drawing)"
                    />
                  </svg>
                )}
                {activeTool === "highlight" && (
                  <div
                    className="absolute border-4 border-yellow-400 rounded-full pointer-events-none shadow-sm"
                    style={{
                      left: `${Math.min(startPoint[0], currentPoint[0])}%`,
                      top: `${Math.min(startPoint[1], currentPoint[1])}%`,
                      width: `${Math.abs(currentPoint[0] - startPoint[0])}%`,
                      height: `${Math.abs(currentPoint[1] - startPoint[1])}%`,
                    }}
                  />
                )}
                {activeTool === "blur" && (
                  <div
                    className="absolute backdrop-blur-md bg-background/30 pointer-events-none border border-white/20"
                    style={{
                      left: `${Math.min(startPoint[0], currentPoint[0])}%`,
                      top: `${Math.min(startPoint[1], currentPoint[1])}%`,
                      width: `${Math.abs(currentPoint[0] - startPoint[0])}%`,
                      height: `${Math.abs(currentPoint[1] - startPoint[1])}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <div className="text-xs font-medium text-muted-foreground bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/20">
            {activeTool === "pointer" ? "Select a tool to draw" : `Click and drag to draw ${activeTool}`}
          </div>
        </div>
      </div>
    </div>
  );
}