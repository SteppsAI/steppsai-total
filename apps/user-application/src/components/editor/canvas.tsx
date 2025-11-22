import { useState } from "react";

interface CanvasProps {
  screenshotUrl?: string;
  overlays?: Array<{
    type: "arrow" | "circle" | "blur";
    from?: [number, number];
    to?: [number, number];
    center?: [number, number];
    radius?: number;
    rect?: { x: number; y: number; width: number; height: number };
  }>;
}

export function Canvas({ screenshotUrl, overlays = [] }: CanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setStartPoint([x, y]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPoint(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-muted p-8">
      <div className="max-w-4xl w-full space-y-4">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          <div
            className="relative aspect-video bg-muted cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {screenshotUrl ? (
              <img src={screenshotUrl} alt="Screenshot" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No screenshot available
              </div>
            )}
            
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
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
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
                      markerEnd="url(#arrowhead)"
                    />
                  </svg>
                );
              }
              if (overlay.type === "circle" && overlay.center && overlay.radius) {
                return (
                  <div
                    key={index}
                    className="absolute border-2 border-primary rounded-full pointer-events-none"
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
                    className="absolute backdrop-blur-sm bg-background/20 pointer-events-none"
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

            {isDrawing && startPoint && (
              <div
                className="absolute w-2 h-2 bg-primary rounded-full pointer-events-none"
                style={{
                  left: `${startPoint[0]}%`,
                  top: `${startPoint[1]}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-center gap-2">
          <div className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-md">
            Click and drag to draw arrows
          </div>
        </div>
      </div>
    </div>
  );
}