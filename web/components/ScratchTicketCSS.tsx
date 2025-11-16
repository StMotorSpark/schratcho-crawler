import { useRef, useState, useEffect } from 'react';
import type { Prize } from '../../core/mechanics/prizes';
import { soundManager } from '../../core/mechanics/sounds';
import type { TicketLayout } from '../../core/mechanics/ticketLayouts';
import { evaluateWinCondition, getPrizeDisplayForArea } from '../../core/mechanics/ticketLayouts';
import type { Scratcher } from '../../core/mechanics/scratchers';

interface ScratchTicketCSSProps {
  prize: Prize;
  onComplete: () => void;
  layout: TicketLayout;
  scratcher: Scratcher;
}

interface ScratchArea {
  id: string;
  maskCanvas: HTMLCanvasElement | null;
  maskImage: string;
  isRevealed: boolean;
  config: {
    topPercent: number;
    leftPercent: number;
    widthPercent: number;
    heightPercent: number;
    canvasWidth: number;
    canvasHeight: number;
    revealThreshold: number;
  };
}

export default function ScratchTicketCSS({ prize, onComplete, layout, scratcher }: ScratchTicketCSSProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scratchAreasRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const revealedRef = useRef(false);
  const lastScratchTime = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<boolean>(false);
  
  // Create scratch areas from layout configuration
  const [scratchAreas, setScratchAreas] = useState<ScratchArea[]>(
    layout.scratchAreas.map((areaConfig) => ({
      id: areaConfig.id,
      maskCanvas: null,
      maskImage: '',
      isRevealed: false,
      config: {
        topPercent: areaConfig.topPercent,
        leftPercent: areaConfig.leftPercent,
        widthPercent: areaConfig.widthPercent,
        heightPercent: areaConfig.heightPercent,
        canvasWidth: areaConfig.canvasWidth,
        canvasHeight: areaConfig.canvasHeight,
        revealThreshold: areaConfig.revealThreshold,
      },
    }))
  );

  useEffect(() => {
    // Initialize all scratch areas from layout configuration
    const newAreas = layout.scratchAreas.map((areaConfig) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return {
          id: areaConfig.id,
          maskCanvas: null,
          maskImage: '',
          isRevealed: false,
          config: {
            topPercent: areaConfig.topPercent,
            leftPercent: areaConfig.leftPercent,
            widthPercent: areaConfig.widthPercent,
            heightPercent: areaConfig.heightPercent,
            canvasWidth: areaConfig.canvasWidth,
            canvasHeight: areaConfig.canvasHeight,
            revealThreshold: areaConfig.revealThreshold,
          },
        };
      }

      // Set canvas size from configuration
      canvas.width = areaConfig.canvasWidth;
      canvas.height = areaConfig.canvasHeight;

      // Fill with white (opaque mask)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return {
        id: areaConfig.id,
        maskCanvas: canvas,
        maskImage: canvas.toDataURL(),
        isRevealed: false,
        config: {
          topPercent: areaConfig.topPercent,
          leftPercent: areaConfig.leftPercent,
          widthPercent: areaConfig.widthPercent,
          heightPercent: areaConfig.heightPercent,
          canvasWidth: areaConfig.canvasWidth,
          canvasHeight: areaConfig.canvasHeight,
          revealThreshold: areaConfig.revealThreshold,
        },
      };
    });

    setScratchAreas(newAreas);
    revealedRef.current = false;

    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prize, layout]);

  const checkRevealPercentage = (areaId: string, canvas: HTMLCanvasElement, threshold: number) => {
    if (revealedRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check every 10th pixel for performance (checking alpha channel)
    for (let i = 3; i < pixels.length; i += 40) {
      // Check alpha channel - pixels are RGBA, so alpha is every 4th value
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    const totalChecked = pixels.length / 40;
    const percentage = (transparentPixels / totalChecked) * 100;

    // Mark area as revealed if threshold is exceeded
    if (percentage > threshold) {
      setScratchAreas((prev) =>
        prev.map((area) =>
          area.id === areaId ? { ...area, isRevealed: true } : area
        )
      );
    }

    // Build set of revealed areas for win condition evaluation
    const revealedAreaIds = new Set<string>();
    scratchAreas.forEach((area) => {
      if (area.id === areaId && percentage > threshold) {
        revealedAreaIds.add(area.id);
      } else if (area.isRevealed) {
        revealedAreaIds.add(area.id);
      }
    });

    // Evaluate win condition using layout configuration
    const isWinner = evaluateWinCondition(layout, revealedAreaIds);

    if (isWinner && !revealedRef.current) {
      revealedRef.current = true;
      setIsRevealed(true);
      soundManager.playWin();
      onComplete();
    }
  };

  const scratch = (x: number, y: number) => {
    const scratchAreasElement = scratchAreasRef.current;
    if (!scratchAreasElement) return;

    const rect = scratchAreasElement.getBoundingClientRect();
    const relativeY = y - rect.top;
    const relativeX = x - rect.left;

    // Determine which scratch area was scratched based on position
    let targetArea: ScratchArea | null = null;
    let areaRect: { top: number; left: number; width: number; height: number } | null = null;

    for (const area of scratchAreas) {
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
        targetArea = area;
        areaRect = { top: areaTop, left: areaLeft, width: areaWidth, height: areaHeight };
        break;
      }
    }

    if (!targetArea || !areaRect || !targetArea.maskCanvas) return;

    const ctx = targetArea.maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const scaleX = targetArea.maskCanvas.width / areaRect.width;
    const scaleY = targetArea.maskCanvas.height / areaRect.height;
    const localY = relativeY - areaRect.top;
    const localX = relativeX - areaRect.left;

    // Draw black circle (transparent in mask) using scratcher radius
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(
      localX * scaleX,
      localY * scaleY,
      scratcher.scratchRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Update mask image for this area using requestAnimationFrame to prevent flickering
    if (!pendingUpdateRef.current) {
      pendingUpdateRef.current = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        const newMaskImage = targetArea!.maskCanvas!.toDataURL();
        setScratchAreas((prev) =>
          prev.map((a) =>
            a.id === targetArea!.id ? { ...a, maskImage: newMaskImage } : a
          )
        );
        pendingUpdateRef.current = false;
        animationFrameRef.current = null;
      });
    }

    // Play scratch sound (throttled to avoid too many sounds)
    const now = Date.now();
    if (now - lastScratchTime.current > 50) {
      soundManager.playScratch();
      lastScratchTime.current = now;
    }

    checkRevealPercentage(targetArea.id, targetArea.maskCanvas, targetArea.config.revealThreshold);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Initialize audio context on first user interaction (iOS requirement)
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

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    // Initialize audio context on first user interaction (iOS requirement)
    soundManager.initialize();
    
    setIsScratching(true);
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
    // Trigger haptic feedback on mobile (Note: Not supported on iOS)
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
      // Trigger haptic feedback on mobile (throttled)
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
            {scratchAreas.map((area, index) => {
              const prizeDisplay = getPrizeDisplayForArea(layout, index, prize);
              return (
                <div
                  key={area.id}
                  className="scratch-area"
                  style={{
                    position: 'absolute',
                    top: `${area.config.topPercent * 100}%`,
                    left: `${area.config.leftPercent * 100}%`,
                    width: `${area.config.widthPercent * 100}%`,
                    height: `${area.config.heightPercent * 100}%`,
                  }}
                >
                  <div className="area-content">
                    <div className="prize-display">
                      {prizeDisplay.emoji && <div className="prize-emoji">{prizeDisplay.emoji}</div>}
                      {prizeDisplay.name && <div className="prize-name">{prizeDisplay.name}</div>}
                      {prizeDisplay.value && <div className="prize-value">{prizeDisplay.value}</div>}
                    </div>
                  </div>
                  <div
                    className="scratch-overlay"
                    style={{
                      maskImage: `url(${area.maskImage})`,
                      WebkitMaskImage: `url(${area.maskImage})`,
                      maskSize: 'cover',
                      WebkitMaskSize: 'cover',
                      background: scratcher.style?.overlayColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <div className="overlay-pattern">
                      <span className="overlay-text">{scratcher.style?.overlayPattern || 'SCRATCH'}</span>
                    </div>
                  </div>
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
