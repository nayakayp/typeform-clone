"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Eraser, Undo, Type, PenTool } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { QuestionRendererProps } from "../types";
import type { SignatureSettings } from "@/lib/db/schema/files";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export function Signature({
  question,
  value,
  onChange,
  disabled,
}: QuestionRendererProps<string | null>) {
  const settings = (question.settings || {}) as SignatureSettings;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [mode, setMode] = useState<"draw" | "type">(
    settings.showTypedOption ? "draw" : "draw"
  );
  const [typedName, setTypedName] = useState("");

  const penColor = settings.penColor || "#000000";
  const penWidth = settings.penWidth || 2;
  const backgroundColor = settings.backgroundColor || "#ffffff";

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, backgroundColor]);

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = 200;

      // Redraw after resize
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [backgroundColor]);

  const getPointerPosition = useCallback(
    (e: React.PointerEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;

      setIsDrawing(true);
      const pos = getPointerPosition(e);
      setCurrentStroke([pos]);

      // Draw immediate feedback
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penWidth;
        ctx.lineCap = "round";
        ctx.moveTo(pos.x, pos.y);
      }
    },
    [disabled, getPointerPosition, penColor, penWidth]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || disabled) return;

      const pos = getPointerPosition(e);
      setCurrentStroke((prev) => [...prev, pos]);

      // Draw line segment
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    },
    [isDrawing, disabled, getPointerPosition]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: penColor,
        width: penWidth,
      };
      setStrokes((prev) => [...prev, newStroke]);

      // Save as data URL
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        onChange(dataUrl);
      }
    }

    setCurrentStroke([]);
  }, [isDrawing, currentStroke, penColor, penWidth, onChange]);

  const handleUndo = () => {
    if (strokes.length === 0) return;

    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Save updated canvas
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        if (newStrokes.length === 0) {
          onChange(null);
        } else {
          const dataUrl = canvas.toDataURL("image/png");
          onChange(dataUrl);
        }
      }
    }, 0);
  };

  const handleClear = () => {
    setStrokes([]);
    onChange(null);
  };

  const handleTypedNameChange = (name: string) => {
    setTypedName(name);
    if (name.trim()) {
      // Create signature from typed name
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = penColor;
        ctx.font = "italic 32px 'Georgia', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, canvas.width / 2, canvas.height / 2);
        onChange(canvas.toDataURL("image/png"));
      }
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-4">
      {settings.showTypedOption && (
        <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="gap-2">
              <PenTool className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="gap-2">
              <Type className="h-4 w-4" />
              Type
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-4">
            <div ref={containerRef} className="relative">
              <canvas
                ref={canvasRef}
                className={`border rounded-lg touch-none ${
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair"
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={disabled || strokes.length === 0}
              >
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={disabled || strokes.length === 0}
              >
                <Eraser className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="mt-4">
            <Input
              value={typedName}
              onChange={(e) => handleTypedNameChange(e.target.value)}
              placeholder="Type your name"
              disabled={disabled}
              className="text-2xl italic font-serif h-16 text-center"
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Your typed name will be rendered as a signature
            </p>
          </TabsContent>
        </Tabs>
      )}

      {!settings.showTypedOption && (
        <>
          <div ref={containerRef} className="relative">
            <canvas
              ref={canvasRef}
              className={`border rounded-lg touch-none ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair"
              }`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={disabled || strokes.length === 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={disabled || strokes.length === 0}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Sign in the box above using your mouse, finger, or stylus
      </p>
    </div>
  );
}
