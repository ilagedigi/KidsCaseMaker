import React, { useRef, useEffect, useState } from 'react';
import { ToolType, BasePatternType } from '../types';
import { sounds } from './SoundEffects';

interface DrawingCanvasProps {
  baseColor: string;
  pattern: BasePatternType;
  patternColor: string;
  activeTool: ToolType;
  brushColor: string;
  brushSize: number;
  onCanvasChange: (dataUrl: string) => void;
  clearTrigger: number;
  undoTrigger: number;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  baseColor,
  pattern,
  patternColor,
  activeTool,
  brushColor,
  brushSize,
  onCanvasChange,
  clearTrigger,
  undoTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Set internal high-res canvas size (600x1200 matches typical phone aspect ratio 1:2)
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 1200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res canvas dimensions
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    saveState();
  }, []);

  // Handle Clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      setHistory([]);
      saveState();
      sounds.playTrash();
    }
  }, [clearTrigger]);

  // Handle Undo trigger
  useEffect(() => {
    if (undoTrigger > 0 && history.length > 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Pop current state
      const newHistory = [...history];
      newHistory.pop(); // remove current state

      const prevState = newHistory[newHistory.length - 1];
      if (prevState) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, 0, 0);
          setHistory(newHistory);
          onCanvasChange(canvas.toDataURL());
        };
        img.src = prevState;
      }
      sounds.playPop();
    }
  }, [undoTrigger]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistory((prev) => [...prev.slice(-19), dataUrl]); // keep last 20 states
    onCanvasChange(dataUrl);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Map screen coordinates to internal high-res coordinate system
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPoint.current = coords;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'bucket') {
      // Paint bucket covers the canvas with the brush color
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = brushColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
      sounds.playSplash();
      saveState();
      setIsDrawing(false);
    } else if (activeTool === 'spray') {
      sounds.startSpray();
      drawSpray(coords.x, coords.y, ctx);
    } else if (activeTool === 'glitter') {
      sounds.playSparkle();
      drawGlitter(coords.x, coords.y, coords.x, coords.y, ctx);
    } else {
      // Normal brush or eraser
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'none') return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    if (!coords || !lastPoint.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (activeTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (activeTool === 'spray') {
      drawSpray(coords.x, coords.y, ctx);
    } else if (activeTool === 'glitter') {
      drawGlitter(lastPoint.current.x, lastPoint.current.y, coords.x, coords.y, ctx);
    }

    ctx.restore();
    lastPoint.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPoint.current = null;
    sounds.stopSpray();
    saveState();
  };

  // Draw simulated spray paint with small circles in a radius
  const drawSpray = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = brushColor;
    
    const density = brushSize * 1.5;
    const radius = brushSize * 3;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius;
      const sprayX = x + Math.cos(angle) * distance;
      const sprayY = y + Math.sin(angle) * distance;

      ctx.beginPath();
      ctx.arc(sprayX, sprayY, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Draw glittery stroke with a glowing shadow and tiny sparkle stars
  const drawGlitter = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Core stroke
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize * 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add glow
    ctx.shadowColor = brushColor;
    ctx.shadowBlur = brushSize * 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Spawn tiny shiny star sparkles on top
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    
    // Draw 1-2 star shapes along the line
    const steps = 1;
    for (let i = 0; i < steps; i++) {
      if (Math.random() > 0.4) {
        const midX = startX + (endX - startX) * Math.random();
        const midY = startY + (endY - startY) * Math.random();
        
        // Draw 4-point star
        ctx.beginPath();
        const starSize = Math.random() * 6 + 6;
        
        ctx.moveTo(midX, midY - starSize);
        ctx.quadraticCurveTo(midX, midY, midX + starSize, midY);
        ctx.quadraticCurveTo(midX, midY, midX, midY + starSize);
        ctx.quadraticCurveTo(midX, midY, midX - starSize, midY);
        ctx.quadraticCurveTo(midX, midY, midX, midY - starSize);
        
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // Build CSS patterns
  const getPatternStyle = (): React.CSSProperties => {
    switch (pattern) {
      case 'solid':
        return { backgroundColor: baseColor };

      case 'marble':
        return {
          backgroundColor: baseColor,
          backgroundImage: `linear-gradient(125deg, ${patternColor}15 0%, transparent 40%, ${patternColor}15 60%, transparent 100%),
                             linear-gradient(45deg, transparent 45%, ${patternColor}20 50%, transparent 55%)`,
          backgroundSize: '200% 200%',
        };

      case 'stripes':
        return {
          backgroundColor: baseColor,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, ${patternColor}40 15px, ${patternColor}40 30px)`,
        };

      case 'polka':
        return {
          backgroundColor: baseColor,
          backgroundImage: `radial-gradient(${patternColor}80 20%, transparent 20%), radial-gradient(${patternColor}80 20%, transparent 20%)`,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        };

      case 'stars':
        return {
          backgroundColor: baseColor,
          backgroundImage: `radial-gradient(circle, ${patternColor}bf 10%, transparent 11%), 
                            radial-gradient(circle, ${patternColor}bf 15%, transparent 16%)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        };

      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${baseColor} 0%, ${patternColor} 100%)`,
        };

      case 'waves':
        return {
          backgroundColor: baseColor,
          backgroundImage: `radial-gradient(circle at 100% 150%, ${patternColor} 24%, white 24%, white 28%, ${patternColor} 28%, ${patternColor} 36%, transparent 36%),
                            radial-gradient(circle at 0% 150%, ${patternColor} 24%, white 24%, white 28%, ${patternColor} 28%, ${patternColor} 36%, transparent 36%)`,
          backgroundSize: '40px 40px',
        };

      default:
        return { backgroundColor: baseColor };
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={getPatternStyle()}
    >
      {/* Visual background glitter overlay if "stars" or custom pattern is active to add texture */}
      {pattern === 'stars' && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      )}

      {/* The drawing canvas layer */}
      <canvas
        id="phone-case-drawing-canvas"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`absolute inset-0 w-full h-full block ${
          activeTool !== 'none' ? 'cursor-crosshair' : 'cursor-default'
        }`}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
