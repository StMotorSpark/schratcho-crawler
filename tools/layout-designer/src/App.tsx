import { useState, useRef, useEffect } from 'react';
import type { 
  TicketLayout, 
  ScratchAreaConfig, 
  RevealMechanic, 
  WinCondition,
  DrawingRect 
} from './types';
import './App.css';

function App() {
  // Layout configuration state
  const [layoutId, setLayoutId] = useState('custom-layout');
  const [layoutName, setLayoutName] = useState('My Custom Layout');
  const [layoutDescription, setLayoutDescription] = useState('A custom ticket layout');
  const [revealMechanic, setRevealMechanic] = useState<RevealMechanic>('reveal-all');
  const [winCondition, setWinCondition] = useState<WinCondition>('reveal-all-areas');
  const [ticketWidth, setTicketWidth] = useState(500);
  const [ticketHeight, setTicketHeight] = useState(300);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImagePath, setBackgroundImagePath] = useState('');

  // Scratch areas state
  const [scratchAreas, setScratchAreas] = useState<ScratchAreaConfig[]>([]);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingRect, setDrawingRect] = useState<DrawingRect | null>(null);
  
  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas dimensions for display
  const CANVAS_DISPLAY_WIDTH = 600;
  const CANVAS_DISPLAY_HEIGHT = Math.floor((ticketHeight / ticketWidth) * CANVAS_DISPLAY_WIDTH);

  // Redraw canvas when state changes
  useEffect(() => {
    redrawCanvas();
  }, [backgroundImage, scratchAreas, selectedAreaIndex, drawingRect, ticketWidth, ticketHeight]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image or placeholder
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawScratchAreas(ctx);
      };
      img.src = backgroundImage;
    } else {
      // Draw placeholder background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#ccc';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#999';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a ticket image', canvas.width / 2, canvas.height / 2);
      
      drawScratchAreas(ctx);
    }
  };

  const drawScratchAreas = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw existing scratch areas
    scratchAreas.forEach((area, index) => {
      const x = area.leftPercent * canvas.width;
      const y = area.topPercent * canvas.height;
      const width = area.widthPercent * canvas.width;
      const height = area.heightPercent * canvas.height;

      // Fill with semi-transparent color
      const isSelected = index === selectedAreaIndex;
      ctx.fillStyle = isSelected ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(x, y, width, height);

      // Draw border
      ctx.strokeStyle = isSelected ? '#0096ff' : '#ff0000';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Area ${index + 1}`, x + 5, y + 20);
    });

    // Draw current drawing rectangle
    if (drawingRect) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.fillRect(drawingRect.startX, drawingRect.startY, drawingRect.width, drawingRect.height);
      
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(drawingRect.startX, drawingRect.startY, drawingRect.width, drawingRect.height);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicking on existing area
    const clickedAreaIndex = scratchAreas.findIndex(area => {
      const areaX = area.leftPercent * canvas.width;
      const areaY = area.topPercent * canvas.height;
      const areaWidth = area.widthPercent * canvas.width;
      const areaHeight = area.heightPercent * canvas.height;
      
      return x >= areaX && x <= areaX + areaWidth && y >= areaY && y <= areaY + areaHeight;
    });

    if (clickedAreaIndex !== -1) {
      setSelectedAreaIndex(clickedAreaIndex);
    } else {
      // Start drawing new area
      setIsDrawing(true);
      setDrawingRect({ startX: x, startY: y, width: 0, height: 0 });
      setSelectedAreaIndex(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingRect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setDrawingRect({
      ...drawingRect,
      width: x - drawingRect.startX,
      height: y - drawingRect.startY,
    });
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && drawingRect && Math.abs(drawingRect.width) > 10 && Math.abs(drawingRect.height) > 10) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Normalize rectangle (handle negative dimensions)
      const left = drawingRect.width >= 0 ? drawingRect.startX : drawingRect.startX + drawingRect.width;
      const top = drawingRect.height >= 0 ? drawingRect.startY : drawingRect.startY + drawingRect.height;
      const width = Math.abs(drawingRect.width);
      const height = Math.abs(drawingRect.height);

      // Convert to percentages
      const leftPercent = left / canvas.width;
      const topPercent = top / canvas.height;
      const widthPercent = width / canvas.width;
      const heightPercent = height / canvas.height;

      // Calculate canvas dimensions (proportional to area size)
      const canvasWidth = Math.max(100, Math.min(400, Math.round(width)));
      const canvasHeight = Math.max(100, Math.min(400, Math.round(height)));

      // Create new scratch area
      const newArea: ScratchAreaConfig = {
        id: `area-${scratchAreas.length + 1}`,
        topPercent,
        leftPercent,
        widthPercent,
        heightPercent,
        canvasWidth,
        canvasHeight,
        revealThreshold: 50,
      };

      setScratchAreas([...scratchAreas, newArea]);
    }

    setIsDrawing(false);
    setDrawingRect(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setTicketWidth(img.width);
        setTicketHeight(img.height);
        setBackgroundImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Set the path for export (just the filename)
    setBackgroundImagePath(file.name);
  };

  const handleDeleteArea = () => {
    if (selectedAreaIndex !== null) {
      const newAreas = scratchAreas.filter((_, index) => index !== selectedAreaIndex);
      setScratchAreas(newAreas);
      setSelectedAreaIndex(null);
    }
  };

  const handleUpdateArea = (field: keyof ScratchAreaConfig, value: number | string) => {
    if (selectedAreaIndex === null) return;

    const newAreas = [...scratchAreas];
    newAreas[selectedAreaIndex] = {
      ...newAreas[selectedAreaIndex],
      [field]: value,
    };
    setScratchAreas(newAreas);
  };

  const generateTypeScriptCode = () => {
    const layout: TicketLayout = {
      id: layoutId,
      name: layoutName,
      description: layoutDescription,
      scratchAreas,
      revealMechanic,
      winCondition,
      ticketWidth,
      ticketHeight,
      backgroundImage: backgroundImagePath || undefined,
    };

    const code = `import type { TicketLayout } from './ticketLayouts';

export const ${layoutId.toUpperCase().replace(/-/g, '_')}_TICKET: TicketLayout = ${JSON.stringify(layout, null, 2)};
`;

    return code;
  };

  const generateJSONCode = () => {
    const layout: TicketLayout = {
      id: layoutId,
      name: layoutName,
      description: layoutDescription,
      scratchAreas,
      revealMechanic,
      winCondition,
      ticketWidth,
      ticketHeight,
      backgroundImage: backgroundImagePath || undefined,
    };

    return JSON.stringify(layout, null, 2);
  };

  const handleCopyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => setToastMessage('✓ Code copied to clipboard!'))
      .catch(() => setToastMessage('✗ Failed to copy to clipboard'));
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedArea = selectedAreaIndex !== null ? scratchAreas[selectedAreaIndex] : null;

  return (
    <div className="app">
      <header>
        <h1>🎫 Ticket Layout Designer</h1>
        <p>Visual tool for creating scratch ticket layouts</p>
      </header>

      <div className="content">
        <div className="left-panel">
          <section className="panel">
            <h2>Basic Info</h2>
            <div className="form-group">
              <label>Layout ID:</label>
              <input
                type="text"
                value={layoutId}
                onChange={(e) => setLayoutId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Layout Name:</label>
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={layoutDescription}
                onChange={(e) => setLayoutDescription(e.target.value)}
                rows={3}
              />
            </div>
          </section>

          <section className="panel">
            <h2>Ticket Image</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()}>
              Upload Ticket Image
            </button>
            {backgroundImage && (
              <div className="image-info">
                <p>Size: {ticketWidth} x {ticketHeight} px</p>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Game Mechanics</h2>
            <div className="form-group">
              <label>Reveal Mechanic:</label>
              <select
                value={revealMechanic}
                onChange={(e) => setRevealMechanic(e.target.value as RevealMechanic)}
              >
                <option value="reveal-all">Reveal All</option>
                <option value="reveal-one">Reveal One</option>
                <option value="match-three">Match Three</option>
                <option value="match-two">Match Two</option>
                <option value="progressive">Progressive</option>
              </select>
            </div>
            <div className="form-group">
              <label>Win Condition:</label>
              <select
                value={winCondition}
                onChange={(e) => setWinCondition(e.target.value as WinCondition)}
              >
                <option value="reveal-all-areas">Reveal All Areas</option>
                <option value="reveal-any-area">Reveal Any Area</option>
                <option value="match-symbols">Match Symbols</option>
                <option value="progressive-reveal">Progressive Reveal</option>
              </select>
            </div>
          </section>

          <section className="panel">
            <h2>Scratch Areas ({scratchAreas.length})</h2>
            <p className="instructions">
              Click and drag on the canvas to create scratch areas.
              Click an area to select and edit it.
            </p>
            
            {selectedArea && (
              <div className="area-editor">
                <h3>Editing: {selectedArea.id}</h3>
                <div className="form-group">
                  <label>Area ID:</label>
                  <input
                    type="text"
                    value={selectedArea.id}
                    onChange={(e) => handleUpdateArea('id', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Reveal Threshold (%):</label>
                  <input
                    type="number"
                    value={selectedArea.revealThreshold}
                    onChange={(e) => handleUpdateArea('revealThreshold', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Canvas Width:</label>
                  <input
                    type="number"
                    value={selectedArea.canvasWidth}
                    onChange={(e) => handleUpdateArea('canvasWidth', parseInt(e.target.value))}
                    min="50"
                    max="500"
                  />
                </div>
                <div className="form-group">
                  <label>Canvas Height:</label>
                  <input
                    type="number"
                    value={selectedArea.canvasHeight}
                    onChange={(e) => handleUpdateArea('canvasHeight', parseInt(e.target.value))}
                    min="50"
                    max="500"
                  />
                </div>
                <button onClick={handleDeleteArea} className="delete-btn">
                  Delete Area
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="center-panel">
          <section className="panel canvas-panel">
            <h2>Canvas</h2>
            <canvas
              ref={canvasRef}
              width={CANVAS_DISPLAY_WIDTH}
              height={CANVAS_DISPLAY_HEIGHT}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
            />
          </section>
        </div>

        <div className="right-panel">
          <section className="panel">
            <h2>Export Configuration</h2>
            
            <h3>TypeScript</h3>
            <div className="code-actions">
              <button onClick={() => handleCopyToClipboard(generateTypeScriptCode())}>
                Copy TypeScript
              </button>
              <button onClick={() => handleDownload(generateTypeScriptCode(), `${layoutId}.ts`)}>
                Download .ts
              </button>
            </div>
            <pre className="code-preview">
              <code>{generateTypeScriptCode()}</code>
            </pre>

            <h3>JSON</h3>
            <div className="code-actions">
              <button onClick={() => handleCopyToClipboard(generateJSONCode())}>
                Copy JSON
              </button>
              <button onClick={() => handleDownload(generateJSONCode(), `${layoutId}.json`)}>
                Download .json
              </button>
            </div>
            <pre className="code-preview">
              <code>{generateJSONCode()}</code>
            </pre>
          </section>
        </div>
      </div>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
