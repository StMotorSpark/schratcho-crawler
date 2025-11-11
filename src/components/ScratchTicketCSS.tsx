import { useRef, useState, useEffect } from 'react';
import type { Prize } from '../utils/prizes';
import { soundManager } from '../utils/sounds';

interface ScratchTicketCSSProps {
  prize: Prize;
  onComplete: () => void;
}

interface ScratchArea {
  id: number;
  maskCanvas: HTMLCanvasElement | null;
  maskImage: string;
  isRevealed: boolean;
}

export default function ScratchTicketCSS({ prize, onComplete }: ScratchTicketCSSProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scratchAreasRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const revealedRef = useRef(false);
  const lastScratchTime = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<boolean>(false);
  
  // Create three scratch areas
  const [scratchAreas, setScratchAreas] = useState<ScratchArea[]>([
    { id: 1, maskCanvas: null, maskImage: '', isRevealed: false },
    { id: 2, maskCanvas: null, maskImage: '', isRevealed: false },
    { id: 3, maskCanvas: null, maskImage: '', isRevealed: false },
  ]);

  useEffect(() => {
    // Initialize all scratch areas
    const newAreas = scratchAreas.map((area) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return area;

      // Set canvas size for each area (smaller height since we have 3 areas)
      canvas.width = 400;
      canvas.height = 90;

      // Fill with white (opaque mask)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      return {
        ...area,
        maskCanvas: canvas,
        maskImage: canvas.toDataURL(),
        isRevealed: false,
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
  }, [prize]);

  const checkRevealPercentage = (areaId: number, canvas: HTMLCanvasElement) => {
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

    // Mark area as revealed if more than 50% scratched (lowered threshold)
    if (percentage > 50) {
      setScratchAreas((prev) =>
        prev.map((area) =>
          area.id === areaId ? { ...area, isRevealed: true } : area
        )
      );
    }

    // Check if all areas are revealed
    const allRevealed = scratchAreas.every((area) => {
      if (area.id === areaId && percentage > 50) return true;
      return area.isRevealed;
    });

    if (allRevealed && !revealedRef.current) {
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

    // Determine which scratch area was scratched based on Y position
    const areaHeight = rect.height / 3;
    const areaIndex = Math.floor(relativeY / areaHeight);

    if (areaIndex < 0 || areaIndex >= scratchAreas.length) return;

    const area = scratchAreas[areaIndex];
    if (!area.maskCanvas) return;

    const ctx = area.maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const scaleX = area.maskCanvas.width / rect.width;
    const scaleY = area.maskCanvas.height / areaHeight;
    const localY = relativeY - areaIndex * areaHeight;

    // Draw black circle (transparent in mask)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(
      relativeX * scaleX,
      localY * scaleY,
      25,
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
        const newMaskImage = area.maskCanvas!.toDataURL();
        setScratchAreas((prev) =>
          prev.map((a) =>
            a.id === area.id ? { ...a, maskImage: newMaskImage } : a
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

    checkRevealPercentage(area.id, area.maskCanvas);
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

  return (
    <div className="scratch-ticket-css">
      <div
        ref={containerRef}
        className="ticket-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="ticket-content">
          <div className="ticket-header">
            <h2 className="ticket-title">🎟️ SCRATCH TICKET</h2>
          </div>
          <div ref={scratchAreasRef} className="scratch-areas">
            {scratchAreas.map((area, index) => (
              <div key={area.id} className="scratch-area">
                <div className="area-content">
                  <div className="prize-display">
                    <div className="prize-emoji">{prize.emoji}</div>
                    <div className="prize-name">{prize.name}</div>
                    {index === 1 && <div className="prize-value">{prize.value}</div>}
                  </div>
                </div>
                <div
                  className="scratch-overlay"
                  style={{
                    maskImage: `url(${area.maskImage})`,
                    WebkitMaskImage: `url(${area.maskImage})`,
                    maskSize: 'cover',
                    WebkitMaskSize: 'cover',
                  }}
                >
                  <div className="overlay-pattern">
                    <span className="overlay-text">SCRATCH</span>
                  </div>
                </div>
              </div>
            ))}
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
          🪙
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
