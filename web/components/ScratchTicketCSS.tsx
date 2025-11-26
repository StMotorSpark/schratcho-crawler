import { useRef, useState, useEffect, useCallback } from 'react';
import type { Prize } from '../../core/mechanics/prizes';
import { soundManager } from '../../core/mechanics/sounds';
import type { TicketLayout, ScratchAreaConfig } from '../../core/mechanics/ticketLayouts';
import { evaluateWinCondition, getPrizeDisplayForArea } from '../../core/mechanics/ticketLayouts';
import type { Scratcher } from '../../core/mechanics/scratchers';

interface ScratchTicketCSSProps {
  prize: Prize;
  onComplete: () => void;
  layout: TicketLayout;
  scratcher: Scratcher;
}

interface ScratchAreaState {
  id: string;
  isRevealed: boolean;
}

/**
 * Parses a CSS gradient string and extracts color stops.
 * Returns a function that creates a CanvasGradient.
 */
function parseGradient(
  ctx: CanvasRenderingContext2D,
  gradientStr: string,
  width: number,
  height: number
): CanvasGradient | string {
  // Check if it's a gradient
  if (!gradientStr.includes('gradient')) {
    return gradientStr;
  }

  // Extract colors from gradient string
  // Format: "linear-gradient(135deg, #color1 0%, #color2 100%)"
  const colorMatch = gradientStr.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/g);
  
  // Create linear gradient (135deg = diagonal from top-left to bottom-right)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  
  if (colorMatch && colorMatch.length >= 2) {
    gradient.addColorStop(0, colorMatch[0]);
    gradient.addColorStop(1, colorMatch[1]);
  } else {
    // Fallback colors
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
  }
  
  return gradient;
}

/**
 * Draws the scratch overlay on a canvas with the given style.
 */
function drawOverlay(
  canvas: HTMLCanvasElement,
  overlayColor: string,
  overlayPattern: string
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const { width, height } = canvas;

  // Fill with the overlay color/gradient
  const fill = parseGradient(ctx, overlayColor, width, height);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);

  // Draw diagonal pattern lines
  ctx.strokeStyle = 'rgba(160, 160, 160, 0.4)';
  ctx.lineWidth = 2;
  
  const spacing = 16;
  for (let i = -height; i < width + height; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // Draw overlay text
  if (overlayPattern) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(overlayPattern, width / 2, height / 2);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

/**
 * Calculates the percentage of transparent pixels in a canvas.
 * Uses sampling for performance (every 10th pixel).
 */
function calculateRevealPercentage(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let transparentPixels = 0;

  // Check every 10th pixel for performance (checking alpha channel)
  // Pixels are RGBA, so we check every 4th value starting from index 3 (alpha)
  for (let i = 3; i < pixels.length; i += 40) {
    if (pixels[i] < 128) {
      transparentPixels++;
    }
  }

  const totalChecked = pixels.length / 40;
  return (transparentPixels / totalChecked) * 100;
}

/**
 * ScratchTicketCSS - A high-performance scratch-off ticket component.
 * 
 * Uses direct canvas rendering with globalCompositeOperation = 'destination-out'
 * to achieve 60fps performance. No toDataURL() calls during scratching.
 */
export default function ScratchTicketCSS({ prize, onComplete, layout, scratcher }: ScratchTicketCSSProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scratchAreasRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [, setAreaStates] = useState<ScratchAreaState[]>(
    layout.scratchAreas.map((area) => ({ id: area.id, isRevealed: false }))
  );
  
  const revealedRef = useRef(false);
  const lastScratchTime = useRef(0);
  const initializationKey = useRef(0);

  // Initialize canvases when layout/prize changes
  useEffect(() => {
    initializationKey.current += 1;
    revealedRef.current = false;
    setIsRevealed(false);
    setAreaStates(layout.scratchAreas.map((area) => ({ id: area.id, isRevealed: false })));
    
    // Initialize all canvases after render
    const initCanvases = () => {
      layout.scratchAreas.forEach((areaConfig) => {
        const canvas = canvasRefs.current.get(areaConfig.id);
        if (canvas) {
          // Set canvas dimensions
          canvas.width = areaConfig.canvasWidth;
          canvas.height = areaConfig.canvasHeight;
          
          // Draw overlay
          const overlayColor = scratcher.style?.overlayColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          const overlayPattern = scratcher.style?.overlayPattern || 'SCRATCH';
          drawOverlay(canvas, overlayColor, overlayPattern);
        }
      });
    };

    // Use requestAnimationFrame to ensure canvases are mounted
    const rafId = requestAnimationFrame(initCanvases);
    return () => cancelAnimationFrame(rafId);
  }, [prize, layout, scratcher]);

  // Store canvas ref for a specific area
  const setCanvasRef = useCallback((areaId: string, canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      canvasRefs.current.set(areaId, canvas);
    } else {
      canvasRefs.current.delete(areaId);
    }
  }, []);

  // Check win condition based on revealed areas
  const checkWinCondition = useCallback((newAreaStates: ScratchAreaState[]) => {
    if (revealedRef.current) return;

    const revealedAreaIds = new Set<string>();
    newAreaStates.forEach((state) => {
      if (state.isRevealed) {
        revealedAreaIds.add(state.id);
      }
    });

    const isWinner = evaluateWinCondition(layout, revealedAreaIds);
    if (isWinner) {
      revealedRef.current = true;
      setIsRevealed(true);
      soundManager.playWin();
      onComplete();
    }
  }, [layout, onComplete]);

  // Check if an area is revealed based on threshold
  const checkAreaReveal = useCallback((areaId: string, canvas: HTMLCanvasElement, threshold: number) => {
    const percentage = calculateRevealPercentage(canvas);
    
    if (percentage > threshold) {
      setAreaStates((prev) => {
        const newStates = prev.map((state) =>
          state.id === areaId ? { ...state, isRevealed: true } : state
        );
        // Check win condition with updated states
        checkWinCondition(newStates);
        return newStates;
      });
    }
  }, [checkWinCondition]);

  // Scratch at the given client coordinates
  const scratch = useCallback((clientX: number, clientY: number) => {
    const scratchAreasElement = scratchAreasRef.current;
    if (!scratchAreasElement || revealedRef.current) return;

    const rect = scratchAreasElement.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Find which scratch area was hit
    for (const areaConfig of layout.scratchAreas) {
      const areaTop = rect.height * areaConfig.topPercent;
      const areaLeft = rect.width * areaConfig.leftPercent;
      const areaWidth = rect.width * areaConfig.widthPercent;
      const areaHeight = rect.height * areaConfig.heightPercent;

      if (
        relativeX >= areaLeft &&
        relativeX <= areaLeft + areaWidth &&
        relativeY >= areaTop &&
        relativeY <= areaTop + areaHeight
      ) {
        const canvas = canvasRefs.current.get(areaConfig.id);
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Calculate position within the canvas
        const scaleX = canvas.width / areaWidth;
        const scaleY = canvas.height / areaHeight;
        const localX = (relativeX - areaLeft) * scaleX;
        const localY = (relativeY - areaTop) * scaleY;

        // Erase pixels at this position using destination-out
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(localX, localY, scratcher.scratchRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';

        // Play scratch sound (throttled)
        const now = Date.now();
        if (now - lastScratchTime.current > 50) {
          soundManager.playScratch();
          lastScratchTime.current = now;
        }

        // Check if area is revealed
        checkAreaReveal(areaConfig.id, canvas, areaConfig.revealThreshold);
        break;
      }
    }
  }, [layout, scratcher.scratchRadius, checkAreaReveal]);

  // Event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    soundManager.initialize();
    setIsScratching(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    scratch(e.clientX, e.clientY);
  }, [scratch]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  }, [isScratching, scratch]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsScratching(false);
    setCursorPosition(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    soundManager.initialize();
    setIsScratching(true);
    
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
    
    // Trigger haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    scratch(touch.clientX, touch.clientY);
  }, [scratch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isScratching) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
    
    // Trigger haptic feedback (throttled)
    const now = Date.now();
    if (now - lastScratchTime.current > 100 && navigator.vibrate) {
      navigator.vibrate(5);
    }
    
    scratch(touch.clientX, touch.clientY);
  }, [isScratching, scratch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
    setCursorPosition(null);
  }, []);

  // Calculate aspect ratio for the ticket
  const aspectRatio = layout.ticketHeight / layout.ticketWidth;
  const hasBackgroundImage = !!layout.backgroundImage;

  return (
    <div className="scratch-ticket-css">
      <div
        ref={containerRef}
        className={`ticket-container ${hasBackgroundImage ? 'with-background' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="ticket-content"
          style={hasBackgroundImage ? {
            background: 'none',
            border: 'none',
            borderRadius: '20px',
            overflow: 'hidden',
          } : undefined}
        >
          {!hasBackgroundImage && (
            <div className="ticket-header">
              <h2 className="ticket-title">🎟️ SCRATCH TICKET</h2>
            </div>
          )}
          <div 
            ref={scratchAreasRef} 
            className="scratch-areas"
            style={{
              height: hasBackgroundImage ? `${aspectRatio * 100}%` : '300px',
              paddingBottom: hasBackgroundImage ? `${aspectRatio * 100}%` : '0',
              backgroundImage: hasBackgroundImage ? `url(${layout.backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            {layout.scratchAreas.map((areaConfig: ScratchAreaConfig, index: number) => {
              const prizeDisplay = getPrizeDisplayForArea(layout, index, prize);
              return (
                <div
                  key={areaConfig.id}
                  className="scratch-area"
                  style={{
                    position: 'absolute',
                    top: `${areaConfig.topPercent * 100}%`,
                    left: `${areaConfig.leftPercent * 100}%`,
                    width: `${areaConfig.widthPercent * 100}%`,
                    height: `${areaConfig.heightPercent * 100}%`,
                  }}
                >
                  <div className="area-content">
                    <div className="prize-display">
                      {prizeDisplay.emoji && <div className="prize-emoji">{prizeDisplay.emoji}</div>}
                      {prizeDisplay.name && <div className="prize-name">{prizeDisplay.name}</div>}
                      {prizeDisplay.value && <div className="prize-value">{prizeDisplay.value}</div>}
                    </div>
                  </div>
                  {/* Direct canvas rendering - no CSS mask-image */}
                  <canvas
                    ref={(el) => setCanvasRef(areaConfig.id, el)}
                    className="scratch-canvas-overlay"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {cursorPosition && isScratching && (
        <div
          className="scratch-token"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        >
          {scratcher.symbol}
        </div>
      )}
      {isRevealed && (
        <>
          <div className="win-animation">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
          </div>
          <div className="reveal-message">
            <p>🎉 Congratulations! 🎉</p>
            <p>You won: {prize.name}</p>
          </div>
        </>
      )}
    </div>
  );
}
