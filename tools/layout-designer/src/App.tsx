import { useState, useRef, useEffect } from 'react';
import type { 
  TicketLayout, 
  ScratchAreaConfig, 
  RevealMechanic, 
  WinCondition,
  DrawingRect,
  Scratcher,
  Prize
} from './types';
import './App.css';

// Default scratchers matching core/mechanics/scratchers.ts
const DEFAULT_SCRATCHERS: Scratcher[] = [
  {
    id: 'coin',
    name: 'Gold Coin',
    description: 'Classic coin scratcher - medium scratch area',
    symbol: '🪙',
    scratchRadius: 25,
    style: {
      overlayColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlayPattern: 'SCRATCH',
    },
  },
  {
    id: 'brush',
    name: 'Magic Brush',
    description: 'Wide brush for faster scratching',
    symbol: '🖌️',
    scratchRadius: 35,
    style: {
      overlayColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      overlayPattern: 'SCRATCH',
    },
  },
];

// Default prizes matching core/mechanics/prizes.ts
const DEFAULT_PRIZES: Prize[] = [
  { name: 'Grand Prize', value: '$1000', emoji: '🏆' },
  { name: 'Gold Coins', value: '500 Coins', emoji: '🪙' },
  { name: 'Diamond', value: '100 Gems', emoji: '💎' },
];

/**
 * Validates if a string is a valid emoji
 */
function isValidEmoji(str: string): boolean {
  if (!str || str.length === 0) return false;
  // Check if the string contains at least one emoji character
  const emojiRegex = /\p{Emoji}/u;
  return emojiRegex.test(str);
}

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
  
  // Testing/preview state
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [revealedAreas, setRevealedAreas] = useState<Set<string>>(new Set());
  const [testWinCondition, setTestWinCondition] = useState<boolean | null>(null);

  // Scratcher management state
  const [scratchers, setScratchers] = useState<Scratcher[]>(DEFAULT_SCRATCHERS);
  const [selectedScratcherIndex, setSelectedScratcherIndex] = useState<number | null>(null);
  const [showScratcherPanel, setShowScratcherPanel] = useState(false);

  // Prize management state
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);
  const [showPrizePanel, setShowPrizePanel] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layoutInputRef = useRef<HTMLInputElement>(null);
  const imageCache = useRef<HTMLImageElement | null>(null);

  // Canvas dimensions for display
  const CANVAS_DISPLAY_WIDTH = 600;
  const CANVAS_DISPLAY_HEIGHT = Math.floor((ticketHeight / ticketWidth) * CANVAS_DISPLAY_WIDTH);

  // Cache background image to prevent flashing during drag
  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        imageCache.current = img;
        redrawCanvas();
      };
      img.src = backgroundImage;
    } else {
      imageCache.current = null;
      redrawCanvas();
    }
  }, [backgroundImage]);

  // Redraw canvas when state changes
  useEffect(() => {
    redrawCanvas();
  }, [scratchAreas, selectedAreaIndex, drawingRect, ticketWidth, ticketHeight]);

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
    if (backgroundImage && imageCache.current) {
      // Use cached image for immediate drawing (no flashing)
      ctx.drawImage(imageCache.current, 0, 0, canvas.width, canvas.height);
      drawScratchAreas(ctx);
    } else if (backgroundImage) {
      // First load - will be cached by useEffect
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  // ============= SCRATCHER MANAGEMENT =============
  
  const handleAddScratcher = () => {
    const newId = `scratcher-${scratchers.length + 1}`;
    const newScratcher: Scratcher = {
      id: newId,
      name: 'New Scratcher',
      description: 'A new scratcher',
      symbol: '✨',
      scratchRadius: 25,
      style: {
        overlayColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overlayPattern: 'SCRATCH',
      },
    };
    setScratchers([...scratchers, newScratcher]);
    setSelectedScratcherIndex(scratchers.length);
  };

  const handleDeleteScratcher = () => {
    if (selectedScratcherIndex !== null) {
      const newScratchers = scratchers.filter((_, index) => index !== selectedScratcherIndex);
      setScratchers(newScratchers);
      setSelectedScratcherIndex(null);
    }
  };

  const handleUpdateScratcher = (field: string, value: string | number) => {
    if (selectedScratcherIndex === null) return;

    const newScratchers = [...scratchers];
    if (field.startsWith('style.')) {
      const styleField = field.replace('style.', '') as 'overlayColor' | 'overlayPattern';
      newScratchers[selectedScratcherIndex] = {
        ...newScratchers[selectedScratcherIndex],
        style: {
          ...newScratchers[selectedScratcherIndex].style,
          [styleField]: value,
        },
      };
    } else {
      newScratchers[selectedScratcherIndex] = {
        ...newScratchers[selectedScratcherIndex],
        [field]: value,
      };
    }
    setScratchers(newScratchers);
  };

  const generateScratcherCode = () => {
    const timestamp = new Date().toISOString();
    const scratcherExports = scratchers.map(s => {
      const constName = s.id.toUpperCase().replace(/-/g, '_') + '_SCRATCHER';
      return `export const ${constName}: Scratcher = ${JSON.stringify(s, null, 2)};`;
    }).join('\n\n');

    const scratcherTypes = scratchers.map(s => {
      const constName = s.id.toUpperCase().replace(/-/g, '_') + '_SCRATCHER';
      return `  ${s.id}: ${constName},`;
    }).join('\n');

    return `/**
 * Scratcher Configuration
 * 
 * Generated by Ticket Layout Designer
 * Date: ${timestamp}
 * 
 * To use these scratchers:
 * 1. Save this file to: core/mechanics/scratchers.ts
 * 2. Import and use getScratcher() or getScratchers() to access
 */

export interface Scratcher {
  id: string;
  name: string;
  description: string;
  symbol: string;
  scratchRadius: number;
  style?: {
    overlayColor?: string;
    overlayPattern?: string;
  };
}

${scratcherExports}

export const SCRATCHER_TYPES: Record<string, Scratcher> = {
${scratcherTypes}
};

export function getScratcher(id: string): Scratcher {
  return SCRATCHER_TYPES[id] || SCRATCHER_TYPES[Object.keys(SCRATCHER_TYPES)[0]];
}

export function getScratchers(): Scratcher[] {
  return Object.values(SCRATCHER_TYPES);
}
`;
  };

  // ============= PRIZE MANAGEMENT =============
  
  const handleAddPrize = () => {
    const newPrize: Prize = {
      name: 'New Prize',
      value: '$100',
      emoji: '🎁',
    };
    setPrizes([...prizes, newPrize]);
    setSelectedPrizeIndex(prizes.length);
  };

  const handleDeletePrize = () => {
    if (selectedPrizeIndex !== null) {
      const newPrizes = prizes.filter((_, index) => index !== selectedPrizeIndex);
      setPrizes(newPrizes);
      setSelectedPrizeIndex(null);
    }
  };

  const handleUpdatePrize = (field: keyof Prize, value: string) => {
    if (selectedPrizeIndex === null) return;

    const newPrizes = [...prizes];
    newPrizes[selectedPrizeIndex] = {
      ...newPrizes[selectedPrizeIndex],
      [field]: value,
    };
    setPrizes(newPrizes);
  };

  const generatePrizeCode = () => {
    const timestamp = new Date().toISOString();
    return `/**
 * Prize Configuration
 * 
 * Generated by Ticket Layout Designer
 * Date: ${timestamp}
 * 
 * To use these prizes:
 * 1. Save this file to: core/mechanics/prizes.ts
 * 2. Import and use getRandomPrize() to access
 */

export interface Prize {
  name: string;
  value: string;
  emoji: string;
}

const prizes: Prize[] = ${JSON.stringify(prizes, null, 2)};

export function getRandomPrize(): Prize {
  return prizes[Math.floor(Math.random() * prizes.length)];
}
`;
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

    const timestamp = new Date().toISOString();
    const code = `/**
 * ${layoutName}
 * ${layoutDescription}
 * 
 * Generated by Ticket Layout Designer
 * Date: ${timestamp}
 * 
 * To use this layout:
 * 1. Save this file to: core/game-logic/tickets/${layoutId}Layout.ts
 * 2. Import in core/mechanics/ticketLayouts.ts:
 *    import { ${layoutId.toUpperCase().replace(/-/g, '_')}_TICKET } from '../game-logic/tickets/${layoutId}Layout';
 * 3. Add to TICKET_LAYOUTS object:
 *    '${layoutId}': ${layoutId.toUpperCase().replace(/-/g, '_')}_TICKET,
 */

import type { TicketLayout } from '../../mechanics/ticketLayouts';

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

  // Convert TypeScript object literal to JSON-compatible string
  const convertTsObjectToJson = (tsObject: string): string => {
    // Remove comments (single-line and multi-line)
    let result = tsObject.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove trailing commas before closing braces/brackets
    result = result.replace(/,(\s*[}\]])/g, '$1');
    
    // Convert unquoted property names to quoted ones
    // Match property names that aren't already quoted
    result = result.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    
    // Convert single quotes to double quotes for string values
    // This handles simple cases - be careful with nested quotes
    result = result.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    
    // Remove any variable references (like imported assets) - replace with empty string
    // Match patterns like: "backgroundImage": goblinGoldAsset,
    result = result.replace(/"([^"]+)":\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,/g, '"$1": "",');
    result = result.replace(/"([^"]+)":\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}/g, '"$1": ""}');
    
    return result;
  };

  const handleLoadLayout = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let layout: TicketLayout;

        // Try to parse as JSON first
        if (file.name.endsWith('.json')) {
          layout = JSON.parse(content);
        } else {
          // Try to extract object from TypeScript file - look for the export statement
          // Use greedy match to get the complete object
          const exportMatch = content.match(/export\s+const\s+\w+\s*:\s*TicketLayout\s*=\s*({[\s\S]*});/);
          if (exportMatch) {
            // Convert TypeScript object syntax to valid JSON
            const jsonStr = convertTsObjectToJson(exportMatch[1]);
            try {
              layout = JSON.parse(jsonStr);
            } catch (parseError) {
              throw new Error('Failed to parse layout object. The file may contain unsupported syntax.');
            }
          } else {
            throw new Error('Could not find valid TicketLayout export in TypeScript file');
          }
        }

        // Load layout data
        setLayoutId(layout.id);
        setLayoutName(layout.name);
        setLayoutDescription(layout.description);
        setRevealMechanic(layout.revealMechanic);
        setWinCondition(layout.winCondition);
        setTicketWidth(layout.ticketWidth);
        setTicketHeight(layout.ticketHeight);
        setScratchAreas(layout.scratchAreas);
        setBackgroundImagePath(layout.backgroundImage || '');
        setToastMessage('✓ Layout loaded successfully!');
      } catch (error) {
        setToastMessage('✗ Failed to load layout: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const handleTestArea = (areaId: string) => {
    const newRevealed = new Set(revealedAreas);
    if (newRevealed.has(areaId)) {
      newRevealed.delete(areaId);
    } else {
      newRevealed.add(areaId);
    }
    setRevealedAreas(newRevealed);
    
    // Check win condition
    const isWinner = evaluateTestWinCondition(newRevealed);
    setTestWinCondition(isWinner);
  };

  const evaluateTestWinCondition = (revealed: Set<string>): boolean => {
    switch (winCondition) {
      case 'reveal-all-areas':
        return revealed.size === scratchAreas.length;
      case 'reveal-any-area':
        return revealed.size > 0;
      case 'match-symbols':
        // For testing purposes, assume a win if enough areas are revealed
        if (revealMechanic === 'match-three') {
          return revealed.size >= 3;
        }
        if (revealMechanic === 'match-two') {
          return revealed.size >= 2;
        }
        return false;
      case 'progressive-reveal':
        // Check if last area exists and is revealed
        if (scratchAreas.length === 0) return false;
        const lastAreaId = scratchAreas[scratchAreas.length - 1].id;
        return revealed.has(lastAreaId);
      default:
        return false;
    }
  };

  const handleResetTest = () => {
    setRevealedAreas(new Set());
    setTestWinCondition(null);
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
            <h2>Load/Save</h2>
            <input
              type="file"
              ref={layoutInputRef}
              onChange={handleLoadLayout}
              accept=".ts,.json"
              style={{ display: 'none' }}
            />
            <button onClick={() => layoutInputRef.current?.click()}>
              📂 Load Existing Layout
            </button>
            <p className="instructions" style={{ fontSize: '12px', marginTop: '8px' }}>
              Load a .ts or .json layout file from core/game-logic/tickets/
            </p>
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
            <h2>🎯 Scratcher Management ({scratchers.length})</h2>
            <button 
              onClick={() => setShowScratcherPanel(!showScratcherPanel)}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {showScratcherPanel ? '▼' : '▶'} {showScratcherPanel ? 'Hide' : 'Show'} Scratchers
            </button>
            
            {showScratcherPanel && (
              <div className="scratcher-panel">
                <div className="scratcher-list">
                  {scratchers.map((scratcher, index) => (
                    <button
                      key={scratcher.id}
                      onClick={() => setSelectedScratcherIndex(index)}
                      className={selectedScratcherIndex === index ? 'selected' : ''}
                      style={{ width: '100%', textAlign: 'left', marginBottom: '5px' }}
                    >
                      {scratcher.symbol} {scratcher.name}
                    </button>
                  ))}
                </div>
                
                <button onClick={handleAddScratcher} style={{ width: '100%', marginTop: '10px' }}>
                  ➕ Add Scratcher
                </button>
                
                {selectedScratcherIndex !== null && scratchers[selectedScratcherIndex] && (
                  <div className="scratcher-editor" style={{ marginTop: '15px' }}>
                    <h3>Editing: {scratchers[selectedScratcherIndex].name}</h3>
                    <div className="form-group">
                      <label>ID:</label>
                      <input
                        type="text"
                        value={scratchers[selectedScratcherIndex].id}
                        onChange={(e) => handleUpdateScratcher('id', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={scratchers[selectedScratcherIndex].name}
                        onChange={(e) => handleUpdateScratcher('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        value={scratchers[selectedScratcherIndex].description}
                        onChange={(e) => handleUpdateScratcher('description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Symbol (Emoji):</label>
                      <input
                        type="text"
                        value={scratchers[selectedScratcherIndex].symbol}
                        onChange={(e) => handleUpdateScratcher('symbol', e.target.value)}
                        style={{ fontSize: '1.5rem' }}
                      />
                      {!isValidEmoji(scratchers[selectedScratcherIndex].symbol) && (
                        <span className="validation-error">⚠️ Please enter a valid emoji</span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Scratch Radius (px):</label>
                      <input
                        type="number"
                        value={scratchers[selectedScratcherIndex].scratchRadius}
                        onChange={(e) => handleUpdateScratcher('scratchRadius', parseInt(e.target.value) || 25)}
                        min="10"
                        max="100"
                      />
                    </div>
                    <div className="form-group">
                      <label>Overlay Color:</label>
                      <input
                        type="text"
                        value={scratchers[selectedScratcherIndex].style?.overlayColor || ''}
                        onChange={(e) => handleUpdateScratcher('style.overlayColor', e.target.value)}
                        placeholder="CSS gradient or color"
                      />
                    </div>
                    <div className="form-group">
                      <label>Overlay Pattern:</label>
                      <input
                        type="text"
                        value={scratchers[selectedScratcherIndex].style?.overlayPattern || ''}
                        onChange={(e) => handleUpdateScratcher('style.overlayPattern', e.target.value)}
                        placeholder="Text pattern on overlay"
                      />
                    </div>
                    <button onClick={handleDeleteScratcher} className="delete-btn">
                      Delete Scratcher
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="panel">
            <h2>🎁 Prize Management ({prizes.length})</h2>
            <button 
              onClick={() => setShowPrizePanel(!showPrizePanel)}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {showPrizePanel ? '▼' : '▶'} {showPrizePanel ? 'Hide' : 'Show'} Prizes
            </button>
            
            {showPrizePanel && (
              <div className="prize-panel">
                <div className="prize-list">
                  {prizes.map((prize, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPrizeIndex(index)}
                      className={selectedPrizeIndex === index ? 'selected' : ''}
                      style={{ width: '100%', textAlign: 'left', marginBottom: '5px' }}
                    >
                      {prize.emoji} {prize.name} - {prize.value}
                    </button>
                  ))}
                </div>
                
                <button onClick={handleAddPrize} style={{ width: '100%', marginTop: '10px' }}>
                  ➕ Add Prize
                </button>
                
                {selectedPrizeIndex !== null && prizes[selectedPrizeIndex] && (
                  <div className="prize-editor" style={{ marginTop: '15px' }}>
                    <h3>Editing: {prizes[selectedPrizeIndex].name}</h3>
                    <div className="form-group">
                      <label>Name:</label>
                      <input
                        type="text"
                        value={prizes[selectedPrizeIndex].name}
                        onChange={(e) => handleUpdatePrize('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Value:</label>
                      <input
                        type="text"
                        value={prizes[selectedPrizeIndex].value}
                        onChange={(e) => handleUpdatePrize('value', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Emoji:</label>
                      <input
                        type="text"
                        value={prizes[selectedPrizeIndex].emoji}
                        onChange={(e) => handleUpdatePrize('emoji', e.target.value)}
                        style={{ fontSize: '1.5rem' }}
                      />
                      {!isValidEmoji(prizes[selectedPrizeIndex].emoji) && (
                        <span className="validation-error">⚠️ Please enter a valid emoji</span>
                      )}
                    </div>
                    <button onClick={handleDeletePrize} className="delete-btn">
                      Delete Prize
                    </button>
                  </div>
                )}
              </div>
            )}
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
            <h2>Testing & Preview</h2>
            <button 
              onClick={() => setShowTestPanel(!showTestPanel)}
              style={{ marginBottom: '10px', width: '100%' }}
            >
              {showTestPanel ? '▼' : '▶'} {showTestPanel ? 'Hide' : 'Show'} Test Panel
            </button>
            
            {showTestPanel && (
              <div className="test-panel">
                <h3>Simulate Ticket</h3>
                <p className="instructions">
                  Click areas below to simulate scratching and test your win condition
                </p>
                
                <div className="test-areas">
                  {scratchAreas.map((area) => (
                    <div key={area.id} className="test-area-item">
                      <button
                        onClick={() => handleTestArea(area.id)}
                        className={revealedAreas.has(area.id) ? 'revealed' : 'hidden'}
                        style={{ width: '100%', padding: '10px', marginBottom: '5px' }}
                      >
                        {revealedAreas.has(area.id) ? '✓' : '🔒'} {area.id}
                      </button>
                    </div>
                  ))}
                </div>

                {testWinCondition !== null && (
                  <div className={`test-result ${testWinCondition ? 'win' : 'no-win'}`}>
                    {testWinCondition ? '🎉 WINNER!' : '❌ Not a winner yet'}
                  </div>
                )}

                <button onClick={handleResetTest} style={{ marginTop: '10px', width: '100%' }}>
                  🔄 Reset Test
                </button>

                <div className="test-info" style={{ marginTop: '15px', fontSize: '12px' }}>
                  <strong>Win Condition:</strong> {winCondition}<br/>
                  <strong>Reveal Mechanic:</strong> {revealMechanic}<br/>
                  <strong>Areas Revealed:</strong> {revealedAreas.size} / {scratchAreas.length}
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Export Configuration</h2>
            
            <h3>Save to Core</h3>
            <div className="code-actions">
              <button onClick={() => handleDownload(generateTypeScriptCode(), `${layoutId}Layout.ts`)}>
                💾 Download for Core
              </button>
            </div>
            <p className="instructions" style={{ fontSize: '12px', marginTop: '8px' }}>
              Save to: <code>core/game-logic/tickets/{layoutId}Layout.ts</code>
            </p>

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

          <section className="panel">
            <h2>Export Scratchers</h2>
            <p className="instructions" style={{ fontSize: '12px', marginBottom: '10px' }}>
              Export your scratchers to <code>core/mechanics/scratchers.ts</code>
            </p>
            <div className="code-actions">
              <button onClick={() => handleCopyToClipboard(generateScratcherCode())}>
                Copy Scratchers
              </button>
              <button onClick={() => handleDownload(generateScratcherCode(), 'scratchers.ts')}>
                Download scratchers.ts
              </button>
            </div>
            <pre className="code-preview" style={{ maxHeight: '200px' }}>
              <code>{generateScratcherCode()}</code>
            </pre>
          </section>

          <section className="panel">
            <h2>Export Prizes</h2>
            <p className="instructions" style={{ fontSize: '12px', marginBottom: '10px' }}>
              Export your prizes to <code>core/mechanics/prizes.ts</code>
            </p>
            <div className="code-actions">
              <button onClick={() => handleCopyToClipboard(generatePrizeCode())}>
                Copy Prizes
              </button>
              <button onClick={() => handleDownload(generatePrizeCode(), 'prizes.ts')}>
                Download prizes.ts
              </button>
            </div>
            <pre className="code-preview" style={{ maxHeight: '200px' }}>
              <code>{generatePrizeCode()}</code>
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
