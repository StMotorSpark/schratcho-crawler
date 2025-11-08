import { useRef, useState, useEffect } from 'react';
import type { Prize } from '../utils/prizes';

interface ScratchTicketCSSProps {
  prize: Prize;
  onComplete: () => void;
}

export default function ScratchTicketCSS({ prize, onComplete }: ScratchTicketCSSProps) {
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [maskImage, setMaskImage] = useState<string>('');
  const revealedRef = useRef(false);

  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 300;

    // Fill with white (opaque mask)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update mask image
    setMaskImage(canvas.toDataURL());
  }, [prize]);

  const checkRevealPercentage = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas || revealedRef.current) return;

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

    if (percentage > 60 && !revealedRef.current) {
      revealedRef.current = true;
      setIsRevealed(true);
      onComplete();
    }
  };

  const scratch = (x: number, y: number) => {
    const canvas = maskCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Draw black circle (transparent in mask)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(
      (x - rect.left) * scaleX,
      (y - rect.top) * scaleY,
      25,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Update mask image
    setMaskImage(canvas.toDataURL());
    checkRevealPercentage();
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
          <div className="prize-display">
            <div className="prize-emoji">{prize.emoji}</div>
            <div className="prize-name">{prize.name}</div>
            <div className="prize-value">{prize.value}</div>
          </div>
        </div>
        <div
          className="scratch-overlay"
          style={{
            maskImage: `url(${maskImage})`,
            WebkitMaskImage: `url(${maskImage})`,
            maskSize: 'cover',
            WebkitMaskSize: 'cover',
          }}
        >
          <div className="overlay-pattern">
            <span className="overlay-text">SCRATCH HERE</span>
          </div>
        </div>
      </div>
      <canvas ref={maskCanvasRef} style={{ display: 'none' }} />
      {isRevealed && (
        <div className="reveal-message">
          <p>🎉 Congratulations! 🎉</p>
          <p>You won: {prize.name}</p>
        </div>
      )}
    </div>
  );
}
