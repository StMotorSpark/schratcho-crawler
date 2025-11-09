import { useEffect, useRef, useState } from 'react';
import type { Prize } from '../utils/prizes';

interface ScratchTicketCanvasProps {
  prize: Prize;
  onComplete: () => void;
}

export default function ScratchTicketCanvas({ prize, onComplete }: ScratchTicketCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const revealedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw scratch-off surface
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add pattern/texture
    ctx.fillStyle = '#a0a0a0';
    for (let i = 0; i < rect.width; i += 20) {
      for (let j = 0; j < rect.height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }

    // Add "SCRATCH HERE" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH HERE', rect.width / 2, rect.height / 2);
  }, [prize]);

  const checkRevealPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check every 10th pixel for performance
    for (let i = 3; i < pixels.length; i += 40) {
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(
      (x - rect.left) * scaleX,
      (y - rect.top) * scaleY,
      20 * window.devicePixelRatio,
      0,
      Math.PI * 2
    );
    ctx.fill();

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
    <div className="scratch-ticket-canvas">
      <div className="ticket-content">
        <div className="prize-display">
          <div className="prize-emoji">{prize.emoji}</div>
          <div className="prize-name">{prize.name}</div>
          <div className="prize-value">{prize.value}</div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {isRevealed && (
        <div className="reveal-message">
          <p>🎉 Congratulations! 🎉</p>
          <p>You won: {prize.name}</p>
        </div>
      )}
    </div>
  );
}
