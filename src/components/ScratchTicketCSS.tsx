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
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const revealedRef = useRef(false);
  const lastScratchTime = useRef(0);
  
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
  }, [prize]);

  const checkRevealPercentage = (areaId: number, canvas: HTMLCanvasElement) => {
    if (revealedRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check every 10th pixel for performance
    for (let i = 0; i < pixels.length; i += 40) {
      // Check red channel (they're all the same in grayscale)
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    const totalChecked = pixels.length / 40;
    const percentage = (transparentPixels / totalChecked) * 100;

    // Mark area as revealed if more than 60% scratched
    if (percentage > 60) {
      setScratchAreas((prev) =>
        prev.map((area) =>
          area.id === areaId ? { ...area, isRevealed: true } : area
        )
      );
    }

    // Check if all areas are revealed
    const allRevealed = scratchAreas.every((area) => {
      if (area.id === areaId && percentage > 60) return true;
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
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
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

    // Update mask image for this area
    const newMaskImage = area.maskCanvas.toDataURL();
    setScratchAreas((prev) =>
      prev.map((a) =>
        a.id === area.id ? { ...a, maskImage: newMaskImage } : a
      )
    );

    // Play scratch sound (throttled to avoid too many sounds)
    const now = Date.now();
    if (now - lastScratchTime.current > 50) {
      soundManager.playScratch();
      lastScratchTime.current = now;
    }

    checkRevealPercentage(area.id, area.maskCanvas);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScratching) {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isScratching) {
      const touch = e.touches[0];
      scratch(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
  };

  return (
    <div className="scratch-ticket-css">
      <div
        ref={containerRef}
        className="ticket-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="ticket-content">
          <div className="ticket-header">
            <h2 className="ticket-title">🎟️ SCRATCH TICKET</h2>
          </div>
          <div className="scratch-areas">
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
      {isRevealed && (
        <div className="reveal-message">
          <p>🎉 Congratulations! 🎉</p>
          <p>You won: {prize.name}</p>
        </div>
      )}
    </div>
  );
}
