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

/**
 * Internal interface for managing canvas-based scratch areas.
 * Uses direct canvas rendering instead of CSS mask-image for better performance.
 */
interface CanvasScratchArea {
  id: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  isRevealed: boolean;
  config: ScratchAreaConfig;
}

/**
 * Fill canvas with overlay pattern for scratch effect.
 * Creates a gradient background with diagonal stripes and centered text.
 */
function fillCanvasWithOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlayColor: string,
  overlayPattern: string
): void {
  // Fill with gradient or solid color
  if (overlayColor.includes('gradient')) {
    // Parse gradient colors from the string (e.g., "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")
    const colorMatch = overlayColor.match(/#[0-9a-fA-F]{6}/g);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (colorMatch && colorMatch.length >= 2) {
      gradient.addColorStop(0, colorMatch[0]);
      gradient.addColorStop(1, colorMatch[1]);
    } else {
      // Default gradient colors (purple gradient)
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
    }
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = overlayColor || '#c0c0c0';
  }
  ctx.fillRect(0, 0, width, height);

  // Add diagonal stripe pattern
  ctx.strokeStyle = 'rgba(160, 160, 160, 0.4)';
  ctx.lineWidth = 8;
  for (let i = -height; i < width + height; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // Add pattern text
  if (overlayPattern) {
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(overlayPattern, width / 2, height / 2);
    ctx.shadowColor = 'transparent';
  }
}

/**
 * Calculate what percentage of the canvas has been scratched (erased).
 * Checks every 10th pixel for performance optimization.
 */
function calculateRevealPercentage(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
): number {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let transparentPixels = 0;

  // Check every 10th pixel for performance (checking alpha channel)
  for (let i = 3; i < pixels.length; i += 40) {
    if (pixels[i] < 128) {
      transparentPixels++;
    }
  }

  const totalChecked = pixels.length / 40;
  return (transparentPixels / totalChecked) * 100;
}

/**
 * ScratchTicketCSS - A scratch-off ticket component using direct canvas rendering.
 * 
 * Key performance improvements over the previous CSS mask-image approach:
 * - Uses visible <canvas> elements instead of hidden canvases with toDataURL()
 * - Employs globalCompositeOperation = 'destination-out' for efficient pixel erasing
 * - Eliminates expensive toDataURL() calls and DOM updates during scratching
 * - Maintains 60fps performance on both desktop and mobile devices
 */
export default function ScratchTicketCSS({ prize, onComplete, layout, scratcher }: ScratchTicketCSSProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scratchAreasRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [revealedAreaIds, setRevealedAreaIds] = useState<Set<string>>(new Set());
  const revealedRef = useRef(false);
  const lastScratchTime = useRef(0);
  
  // Store canvas scratch areas in a ref to avoid re-rendering on every scratch
  const canvasAreasRef = useRef<CanvasScratchArea[]>([]);
  // Track which overlay elements have canvases attached
  const overlayRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Get overlay styling from scratcher
  const overlayColor = scratcher.style?.overlayColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const overlayPattern = scratcher.style?.overlayPattern || 'SCRATCH';

  // Initialize canvas areas when component mounts or layout/prize changes
  useEffect(() => {
    const newAreas: CanvasScratchArea[] = layout.scratchAreas.map((areaConfig) => {
      const canvas = document.createElement('canvas');
      canvas.width = areaConfig.canvasWidth;
      canvas.height = areaConfig.canvasHeight;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error(`Failed to get 2D context for canvas ${areaConfig.id}`);
      }

      // Fill with the overlay pattern/color
      fillCanvasWithOverlay(ctx, canvas.width, canvas.height, overlayColor, overlayPattern);

      return {
        id: areaConfig.id,
        canvas,
        ctx,
        isRevealed: false,
        config: areaConfig,
      };
    });

    canvasAreasRef.current = newAreas;
    setRevealedAreaIds(new Set());
    revealedRef.current = false;
    setIsRevealed(false);

    // Attach canvases to DOM after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      overlayRefs.current.forEach((element, areaId) => {
        if (element) {
          const area = canvasAreasRef.current.find((a) => a.id === areaId);
          if (area) {
            // Clear existing canvases
            const existingCanvases = element.querySelectorAll('canvas');
            existingCanvases.forEach((c) => c.remove());
            // Append the new canvas
            element.appendChild(area.canvas);
          }
        }
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [prize, layout, overlayColor, overlayPattern]);

  // Check win condition when revealed areas change
  useEffect(() => {
    if (revealedRef.current) return;

    const isWinner = evaluateWinCondition(layout, revealedAreaIds);

    if (isWinner) {
      revealedRef.current = true;
      setIsRevealed(true);
      soundManager.playWin();
      onComplete();
    }
  }, [revealedAreaIds, layout, onComplete]);

  // Handle scratch at position - uses direct canvas manipulation
  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      const scratchAreasElement = scratchAreasRef.current;
      if (!scratchAreasElement) return;

      const rect = scratchAreasElement.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const relativeX = clientX - rect.left;

      // Find which area was scratched
      for (const area of canvasAreasRef.current) {
        const areaTop = rect.height * area.config.topPercent;
        const areaLeft = rect.width * area.config.leftPercent;
        const areaWidth = rect.width * area.config.widthPercent;
        const areaHeight = rect.height * area.config.heightPercent;

        if (
          relativeY >= areaTop &&
          relativeY <= areaTop + areaHeight &&
          relativeX >= areaLeft &&
          relativeX <= areaLeft + areaWidth
        ) {
          // Calculate position within the canvas
          const scaleX = area.canvas.width / areaWidth;
          const scaleY = area.canvas.height / areaHeight;
          const localX = (relativeX - areaLeft) * scaleX;
          const localY = (relativeY - areaTop) * scaleY;

          // Erase pixels using destination-out composite operation
          // This is the key performance improvement - no toDataURL() needed!
          area.ctx.globalCompositeOperation = 'destination-out';
          area.ctx.beginPath();
          area.ctx.arc(localX, localY, scratcher.scratchRadius, 0, Math.PI * 2);
          area.ctx.fill();

          // Reset composite operation for future draws
          area.ctx.globalCompositeOperation = 'source-over';

          // Play scratch sound (throttled)
          const now = Date.now();
          if (now - lastScratchTime.current > 50) {
            soundManager.playScratch();
            lastScratchTime.current = now;
          }

          // Check if area should be marked as revealed
          if (!area.isRevealed) {
            const percentage = calculateRevealPercentage(area.ctx, area.canvas);
            if (percentage >= area.config.revealThreshold) {
              area.isRevealed = true;
              setRevealedAreaIds((prev) => {
                const newSet = new Set(prev);
                newSet.add(area.id);
                return newSet;
              });
            }
          }

          break;
        }
      }
    },
    [scratcher.scratchRadius]
  );

  // Store ref for overlay element and attach canvas
  const setOverlayRef = useCallback((areaId: string) => (el: HTMLDivElement | null) => {
    overlayRefs.current.set(areaId, el);
    if (el) {
      const area = canvasAreasRef.current.find((a) => a.id === areaId);
      if (area) {
        // Clear existing canvases
        const existingCanvases = el.querySelectorAll('canvas');
        existingCanvases.forEach((c) => c.remove());
        // Append the canvas
        el.appendChild(area.canvas);
      }
    }
  }, []);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    soundManager.initialize();
    setIsScratching(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleMouseLeave = () => {
    setIsScratching(false);
    setCursorPosition(null);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    soundManager.initialize();
    setIsScratching(true);
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isScratching) {
      const touch = e.touches[0];
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setCursorPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
      }
      const now = Date.now();
      if (now - lastScratchTime.current > 100 && navigator.vibrate) {
        navigator.vibrate(5);
      }
      scratch(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
    setCursorPosition(null);
  };

  // Calculate aspect ratio and height for the ticket
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
          style={
            hasBackgroundImage
              ? {
                  background: 'none',
                  border: 'none',
                  borderRadius: '20px',
                  overflow: 'hidden',
                }
              : undefined
          }
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
            {layout.scratchAreas.map((areaConfig, index) => {
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
                  {/* Canvas-based scratch overlay - replaces CSS mask-image for better performance */}
                  <div
                    ref={setOverlayRef(areaConfig.id)}
                    className="scratch-overlay-canvas"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
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
