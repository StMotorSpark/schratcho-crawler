import { useState, useRef, useEffect } from 'react';
import type { 
  TicketLayout, 
  ScratchAreaConfig, 
  RevealMechanic, 
  WinCondition,
  DrawingRect,
  Scratcher,
  Prize,
  PrizeConfig,
  DesignerTab,
  TicketType
} from './types';
import './App.css';

/**
 * Available prizes for the designer to choose from.
 * These match the prize IDs in core/mechanics/prizes.ts
 */
const AVAILABLE_PRIZES = [
  { id: 'grand-prize', name: 'Grand Prize', emoji: '🏆' },
  { id: 'gold-coins', name: 'Gold Coins', emoji: '🪙' },
  { id: 'diamond', name: 'Diamond', emoji: '💎' },
  { id: 'treasure-chest', name: 'Treasure Chest', emoji: '🎁' },
  { id: 'magic-potion', name: 'Magic Potion', emoji: '🧪' },
  { id: 'lucky-star', name: 'Lucky Star', emoji: '⭐' },
  { id: 'golden-key', name: 'Golden Key', emoji: '🔑' },
  { id: 'fire-sword', name: 'Fire Sword', emoji: '⚔️' },
  { id: 'shield', name: 'Shield', emoji: '🛡️' },
  { id: 'crown', name: 'Crown', emoji: '👑' },
];

/**
 * Validate if a string is a valid emoji
 * Uses regex to match common emoji patterns
 */
function isValidEmoji(str: string): boolean {
  if (!str || str.length === 0) return false;
  // Simple emoji validation - checks for common emoji patterns
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}|\p{Emoji_Component})+$/u;
  return emojiRegex.test(str);
}

/**
 * Calculate odds information for the designer
 */
interface PrizeOddsInfo {
  prizeId: string;
  name: string;
  emoji: string;
  probability: number;
  percentageStr: string;
  oddsStr: string;
  weight: number;
}

function calculatePrizeOdds(prizeConfigs: PrizeConfig[]): PrizeOddsInfo[] {
  const validConfigs = prizeConfigs.filter(c => c.weight > 0);
  if (validConfigs.length === 0) return [];
  
  const totalWeight = validConfigs.reduce((sum, c) => sum + c.weight, 0);
  
  return validConfigs.map(config => {
    const prizeInfo = AVAILABLE_PRIZES.find(p => p.id === config.prizeId);
    const probability = config.weight / totalWeight;
    
    return {
      prizeId: config.prizeId,
      name: prizeInfo?.name || 'Unknown',
      emoji: prizeInfo?.emoji || '?',
      probability,
      percentageStr: formatPercentage(probability),
      oddsStr: formatOdds(probability),
      weight: config.weight,
    };
  });
}

function formatPercentage(probability: number): string {
  const percent = probability * 100;
  if (percent >= 10) {
    return `${percent.toFixed(1)}%`;
  } else if (percent >= 1) {
    return `${percent.toFixed(2)}%`;
  } else {
    return `${percent.toFixed(3)}%`;
  }
}

function formatOdds(probability: number): string {
  if (probability <= 0) return 'N/A';
  const oneIn = 1 / probability;
  if (oneIn < 2) return '~1 in 1';
  if (oneIn < 100) return `1 in ${Math.round(oneIn)}`;
  if (oneIn < 1000) return `1 in ${Math.round(oneIn / 10) * 10}`;
  return `1 in ${Math.round(oneIn / 100) * 100}`;
}

function getWinConditionExplanation(winCondition: WinCondition, scratchAreaCount: number): string {
  switch (winCondition) {
    case 'no-win-condition':
      return 'Every ticket is a winner!';
    case 'match-two':
      return `Match 2 identical symbols out of ${scratchAreaCount} areas to win.`;
    case 'match-three':
      return `Match 3 identical symbols out of ${scratchAreaCount} areas to win.`;
    case 'match-all':
      return `All ${scratchAreaCount} areas must show the same symbol.`;
    case 'find-one':
      return 'Find the target prize to win.';
    case 'total-value-threshold':
      return 'Combined value must exceed threshold.';
    default:
      return 'Scratch to reveal prizes!';
  }
}

/**
 * Calculate approximate win probability based on win condition
 */
function calculateWinProbability(
  prizeOdds: PrizeOddsInfo[],
  winCondition: WinCondition,
  numAreas: number
): number {
  if (prizeOdds.length === 0) return 0;
  
  switch (winCondition) {
    case 'no-win-condition':
    case 'reveal-any-area':
    case 'reveal-all-areas':
    case 'progressive-reveal':
      return 1;
    case 'match-two':
      return calculateMatchProb(prizeOdds, numAreas, 2);
    case 'match-three':
      return calculateMatchProb(prizeOdds, numAreas, 3);
    case 'match-all':
      return calculateMatchProb(prizeOdds, numAreas, numAreas);
    case 'find-one':
    case 'total-value-threshold':
      return 0.5; // Placeholder
    default:
      return 0;
  }
}

function calculateMatchProb(prizeOdds: PrizeOddsInfo[], numAreas: number, required: number): number {
  if (numAreas < required) return 0;
  if (required <= 1) return 1;
  
  let totalProb = 0;
  for (const prize of prizeOdds) {
    const p = prize.probability;
    let prizeWinProb = 0;
    for (let k = required; k <= numAreas; k++) {
      prizeWinProb += binomialProb(numAreas, k, p);
    }
    totalProb += prizeWinProb;
  }
  return Math.min(1, totalProb);
}

function binomialProb(n: number, k: number, p: number): number {
  return binomialCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function binomialCoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

function App() {
  // Active tab state
  const [activeTab, setActiveTab] = useState<DesignerTab>('layouts');

  // Layout configuration state
  const [layoutId, setLayoutId] = useState('custom-layout');
  const [layoutName, setLayoutName] = useState('My Custom Layout');
  const [layoutDescription, setLayoutDescription] = useState('A custom ticket layout');
  const [ticketType, setTicketType] = useState<TicketType>('Core');
  const [revealMechanic, setRevealMechanic] = useState<RevealMechanic>('independent');
  const [winCondition, setWinCondition] = useState<WinCondition>('match-three');
  const [ticketWidth, setTicketWidth] = useState(500);
  const [ticketHeight, setTicketHeight] = useState(300);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImagePath, setBackgroundImagePath] = useState('');
  const [goldCost, setGoldCost] = useState<number>(5);
  const [targetPrizeId, setTargetPrizeId] = useState<string>('');
  const [valueThreshold, setValueThreshold] = useState<number>(100);

  // Prize configuration state
  const [prizeConfigs, setPrizeConfigs] = useState<PrizeConfig[]>([
    { prizeId: 'diamond', weight: 5 },
    { prizeId: 'magic-potion', weight: 10 },
    { prizeId: 'shield', weight: 15 },
  ]);

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

  // Scratcher state
  const [scratcherId, setScratcherId] = useState('custom-scratcher');
  const [scratcherName, setScratcherName] = useState('My Custom Scratcher');
  const [scratcherDescription, setScratcherDescription] = useState('A custom scratcher tool');
  const [scratcherSymbol, setScratcherSymbol] = useState('🪙');
  const [scratcherRadius, setScratcherRadius] = useState(25);
  const [scratcherOverlayColor, setScratcherOverlayColor] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [scratcherOverlayPattern, setScratcherOverlayPattern] = useState('SCRATCH');
  const [scratcherSymbolError, setScratcherSymbolError] = useState<string | null>(null);

  // Prize state
  // Note: prizeId is only used for file naming and constant naming, not as part of the Prize data
  // The Prize interface intentionally doesn't have an id field (matches core/mechanics/prizes.ts)
  const [prizeId, setPrizeId] = useState('custom-prize');
  const [prizeName, setPrizeName] = useState('My Custom Prize');
  const [prizeValue, setPrizeValue] = useState('$100');
  const [prizeEmoji, setPrizeEmoji] = useState('🏆');
  const [prizeEmojiError, setPrizeEmojiError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layoutInputRef = useRef<HTMLInputElement>(null);
  const scratcherInputRef = useRef<HTMLInputElement>(null);
  const prizeInputRef = useRef<HTMLInputElement>(null);
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

  const generateTypeScriptCode = () => {
    const layout: TicketLayout = {
      id: layoutId,
      name: layoutName,
      description: layoutDescription,
      type: ticketType,
      scratchAreas,
      revealMechanic,
      winCondition,
      ticketWidth,
      ticketHeight,
      backgroundImage: backgroundImagePath || undefined,
      goldCost,
      prizeConfigs: prizeConfigs.length > 0 ? prizeConfigs : undefined,
      targetPrizeId: winCondition === 'find-one' && targetPrizeId ? targetPrizeId : undefined,
      valueThreshold: winCondition === 'total-value-threshold' ? valueThreshold : undefined,
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
      type: ticketType,
      scratchAreas,
      revealMechanic,
      winCondition,
      ticketWidth,
      ticketHeight,
      backgroundImage: backgroundImagePath || undefined,
      goldCost,
      prizeConfigs: prizeConfigs.length > 0 ? prizeConfigs : undefined,
      targetPrizeId: winCondition === 'find-one' && targetPrizeId ? targetPrizeId : undefined,
      valueThreshold: winCondition === 'total-value-threshold' ? valueThreshold : undefined,
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
        setTicketType(layout.type || 'Core');
        setRevealMechanic(layout.revealMechanic);
        setWinCondition(layout.winCondition);
        setTicketWidth(layout.ticketWidth);
        setTicketHeight(layout.ticketHeight);
        setScratchAreas(layout.scratchAreas);
        setBackgroundImagePath(layout.backgroundImage || '');
        setGoldCost(layout.goldCost ?? 5);
        setPrizeConfigs(layout.prizeConfigs || []);
        setTargetPrizeId(layout.targetPrizeId || '');
        setValueThreshold(layout.valueThreshold ?? 100);
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
      // New win conditions
      case 'no-win-condition':
        return revealed.size > 0;
      case 'match-two':
        // For testing, simulate with enough revealed areas
        return revealed.size >= 2;
      case 'match-three':
        return revealed.size >= 3;
      case 'match-all':
        return revealed.size === scratchAreas.length;
      case 'find-one':
        // For testing, simulate as win when any area is revealed
        return revealed.size > 0 && !!targetPrizeId;
      case 'total-value-threshold':
        // For testing, simulate as win when enough areas revealed
        return revealed.size >= Math.ceil(scratchAreas.length / 2);
      // Legacy win conditions
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

  // Scratcher symbol validation
  const handleScratcherSymbolChange = (value: string) => {
    setScratcherSymbol(value);
    if (value && !isValidEmoji(value)) {
      setScratcherSymbolError('Please enter a valid emoji (e.g., 🪙, 🖌️, ⚔️)');
    } else {
      setScratcherSymbolError(null);
    }
  };

  // Prize emoji validation
  const handlePrizeEmojiChange = (value: string) => {
    setPrizeEmoji(value);
    if (value && !isValidEmoji(value)) {
      setPrizeEmojiError('Please enter a valid emoji (e.g., 🏆, 💎, ⭐)');
    } else {
      setPrizeEmojiError(null);
    }
  };

  // Generate TypeScript code for Scratcher
  const generateScratcherTypeScriptCode = () => {
    const scratcher: Scratcher = {
      id: scratcherId,
      name: scratcherName,
      description: scratcherDescription,
      symbol: scratcherSymbol,
      scratchRadius: scratcherRadius,
      style: {
        overlayColor: scratcherOverlayColor,
        overlayPattern: scratcherOverlayPattern,
      },
    };

    const timestamp = new Date().toISOString();
    const constantName = scratcherId.toUpperCase().replace(/-/g, '_') + '_SCRATCHER';
    const code = `/**
 * ${scratcherName}
 * ${scratcherDescription}
 * 
 * Generated by Scratcher Designer
 * Date: ${timestamp}
 * 
 * To use this scratcher:
 * 1. Save this file to: core/game-logic/scratchers/${scratcherId}.ts
 * 2. Import in core/mechanics/scratchers.ts:
 *    import { ${constantName} } from '../game-logic/scratchers/${scratcherId}';
 * 3. Add to SCRATCHER_TYPES object:
 *    '${scratcherId}': ${constantName},
 */

import type { Scratcher } from '../../mechanics/scratchers';

export const ${constantName}: Scratcher = ${JSON.stringify(scratcher, null, 2)};
`;

    return code;
  };

  // Generate JSON code for Scratcher
  const generateScratcherJSONCode = () => {
    const scratcher: Scratcher = {
      id: scratcherId,
      name: scratcherName,
      description: scratcherDescription,
      symbol: scratcherSymbol,
      scratchRadius: scratcherRadius,
      style: {
        overlayColor: scratcherOverlayColor,
        overlayPattern: scratcherOverlayPattern,
      },
    };

    return JSON.stringify(scratcher, null, 2);
  };

  // Load scratcher from file
  const handleLoadScratcher = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let scratcher: Scratcher;

        if (file.name.endsWith('.json')) {
          scratcher = JSON.parse(content);
        } else {
          // Try to extract object from TypeScript file
          const exportMatch = content.match(/export\s+const\s+\w+\s*:\s*Scratcher\s*=\s*({[\s\S]*});/);
          if (exportMatch) {
            const jsonStr = convertTsObjectToJson(exportMatch[1]);
            scratcher = JSON.parse(jsonStr);
          } else {
            throw new Error('Could not find valid Scratcher export in TypeScript file');
          }
        }

        // Load scratcher data
        setScratcherId(scratcher.id);
        setScratcherName(scratcher.name);
        setScratcherDescription(scratcher.description);
        setScratcherSymbol(scratcher.symbol);
        setScratcherRadius(scratcher.scratchRadius);
        if (scratcher.style) {
          setScratcherOverlayColor(scratcher.style.overlayColor || '');
          setScratcherOverlayPattern(scratcher.style.overlayPattern || '');
        }
        setToastMessage('✓ Scratcher loaded successfully!');
      } catch (error) {
        setToastMessage('✗ Failed to load scratcher: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Generate TypeScript code for Prize
  const generatePrizeTypeScriptCode = () => {
    const prize: Prize = {
      id: prizeId,
      name: prizeName,
      value: prizeValue,
      emoji: prizeEmoji,
    };

    const timestamp = new Date().toISOString();
    const constantName = prizeId.toUpperCase().replace(/-/g, '_') + '_PRIZE';
    const code = `/**
 * ${prizeName}
 * ${prizeValue}
 * 
 * Generated by Prize Designer
 * Date: ${timestamp}
 * 
 * To use this prize:
 * 1. Save this file to: core/game-logic/prizes/${prizeId}.ts
 * 2. Import in core/mechanics/prizes.ts:
 *    import { ${constantName} } from '../game-logic/prizes/${prizeId}';
 * 3. Add to prizes array or use directly in game logic
 */

import type { Prize } from '../../mechanics/prizes';

export const ${constantName}: Prize = ${JSON.stringify(prize, null, 2)};
`;

    return code;
  };

  // Generate JSON code for Prize
  const generatePrizeJSONCode = () => {
    const prize: Prize = {
      id: prizeId,
      name: prizeName,
      value: prizeValue,
      emoji: prizeEmoji,
    };

    return JSON.stringify(prize, null, 2);
  };

  // Load prize from file
  const handleLoadPrize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let prize: Prize;

        if (file.name.endsWith('.json')) {
          prize = JSON.parse(content);
        } else {
          // Try to extract object from TypeScript file
          const exportMatch = content.match(/export\s+const\s+\w+\s*:\s*Prize\s*=\s*({[\s\S]*});/);
          if (exportMatch) {
            const jsonStr = convertTsObjectToJson(exportMatch[1]);
            prize = JSON.parse(jsonStr);
          } else {
            throw new Error('Could not find valid Prize export in TypeScript file');
          }
        }

        // Load prize data - use id from prize if available, otherwise derive from filename
        const fileBaseName = file.name.replace(/\.(ts|json)$/, '');
        setPrizeId(prize.id || fileBaseName);
        setPrizeName(prize.name);
        setPrizeValue(prize.value);
        setPrizeEmoji(prize.emoji);
        setToastMessage('✓ Prize loaded successfully!');
      } catch (error) {
        setToastMessage('✗ Failed to load prize: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Reset scratcher form
  const handleResetScratcher = () => {
    setScratcherId('custom-scratcher');
    setScratcherName('My Custom Scratcher');
    setScratcherDescription('A custom scratcher tool');
    setScratcherSymbol('🪙');
    setScratcherRadius(25);
    setScratcherOverlayColor('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    setScratcherOverlayPattern('SCRATCH');
    setScratcherSymbolError(null);
  };

  // Reset prize form
  const handleResetPrize = () => {
    setPrizeId('custom-prize');
    setPrizeName('My Custom Prize');
    setPrizeValue('$100');
    setPrizeEmoji('🏆');
    setPrizeEmojiError(null);
  };

  const selectedArea = selectedAreaIndex !== null ? scratchAreas[selectedAreaIndex] : null;

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="tab-navigation">
      <button 
        className={`tab-button ${activeTab === 'layouts' ? 'active' : ''}`}
        onClick={() => setActiveTab('layouts')}
      >
        🎫 Ticket Layouts
      </button>
      <button 
        className={`tab-button ${activeTab === 'scratchers' ? 'active' : ''}`}
        onClick={() => setActiveTab('scratchers')}
      >
        🪙 Scratchers
      </button>
      <button 
        className={`tab-button ${activeTab === 'prizes' ? 'active' : ''}`}
        onClick={() => setActiveTab('prizes')}
      >
        🏆 Prizes
      </button>
    </div>
  );

  // Render Scratcher Designer panel
  const renderScratcherDesigner = () => (
    <div className="content scratcher-content">
      <div className="left-panel">
        <section className="panel">
          <h2>Scratcher Info</h2>
          <div className="form-group">
            <label>Scratcher ID (kebab-case):</label>
            <input
              type="text"
              value={scratcherId}
              onChange={(e) => setScratcherId(e.target.value)}
              placeholder="my-custom-scratcher"
            />
          </div>
          <div className="form-group">
            <label>Scratcher Name:</label>
            <input
              type="text"
              value={scratcherName}
              onChange={(e) => setScratcherName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={scratcherDescription}
              onChange={(e) => setScratcherDescription(e.target.value)}
              rows={3}
            />
          </div>
        </section>

        <section className="panel">
          <h2>Load/Save</h2>
          <input
            type="file"
            ref={scratcherInputRef}
            onChange={handleLoadScratcher}
            accept=".ts,.json"
            style={{ display: 'none' }}
          />
          <button onClick={() => scratcherInputRef.current?.click()}>
            📂 Load Existing Scratcher
          </button>
          <button onClick={handleResetScratcher} style={{ marginTop: '10px' }}>
            🔄 Reset Form
          </button>
          <p className="instructions" style={{ fontSize: '12px', marginTop: '8px' }}>
            Load a .ts or .json scratcher file from core/game-logic/scratchers/
          </p>
        </section>

        <section className="panel">
          <h2>Symbol & Behavior</h2>
          <div className="form-group">
            <label>Symbol (Emoji):</label>
            <input
              type="text"
              value={scratcherSymbol}
              onChange={(e) => handleScratcherSymbolChange(e.target.value)}
              placeholder="🪙"
              className={scratcherSymbolError ? 'error' : ''}
            />
            {scratcherSymbolError && (
              <span className="error-message">{scratcherSymbolError}</span>
            )}
          </div>
          <div className="form-group">
            <label>Scratch Radius (px): {scratcherRadius}</label>
            <input
              type="range"
              min="10"
              max="60"
              value={scratcherRadius}
              onChange={(e) => setScratcherRadius(parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>10 (Precise)</span>
              <span>60 (Large)</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Visual Style</h2>
          <div className="form-group">
            <label>Overlay Color (CSS):</label>
            <input
              type="text"
              value={scratcherOverlayColor}
              onChange={(e) => setScratcherOverlayColor(e.target.value)}
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>
          <div className="form-group">
            <label>Overlay Pattern:</label>
            <input
              type="text"
              value={scratcherOverlayPattern}
              onChange={(e) => setScratcherOverlayPattern(e.target.value)}
              placeholder="SCRATCH"
            />
          </div>
        </section>
      </div>

      <div className="center-panel">
        <section className="panel">
          <h2>Preview</h2>
          <div className="scratcher-preview">
            <div 
              className="scratcher-demo"
              style={{ 
                background: scratcherOverlayColor,
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <div className="scratcher-cursor" style={{ fontSize: `${Math.max(24, scratcherRadius)}px` }}>
                {scratcherSymbol}
              </div>
              {scratcherOverlayPattern && (
                <div className="overlay-pattern" style={{ 
                  position: 'absolute', 
                  bottom: '10px', 
                  fontSize: '14px', 
                  color: 'rgba(255,255,255,0.7)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {scratcherOverlayPattern}
                </div>
              )}
            </div>
            <div className="preview-info" style={{ marginTop: '15px', textAlign: 'center' }}>
              <p><strong>{scratcherName}</strong></p>
              <p style={{ fontSize: '12px', color: '#8b9dc3' }}>{scratcherDescription}</p>
              <p style={{ fontSize: '12px', color: '#8b9dc3' }}>Scratch Radius: {scratcherRadius}px</p>
            </div>
          </div>
        </section>
      </div>

      <div className="right-panel">
        <section className="panel">
          <h2>Export Configuration</h2>
          
          <h3>Save to Core</h3>
          <div className="code-actions">
            <button onClick={() => handleDownload(generateScratcherTypeScriptCode(), `${scratcherId}.ts`)}>
              💾 Download for Core
            </button>
          </div>
          <p className="instructions" style={{ fontSize: '12px', marginTop: '8px' }}>
            Save to: <code>core/game-logic/scratchers/{scratcherId}.ts</code>
          </p>

          <h3>TypeScript</h3>
          <div className="code-actions">
            <button onClick={() => handleCopyToClipboard(generateScratcherTypeScriptCode())}>
              Copy TypeScript
            </button>
            <button onClick={() => handleDownload(generateScratcherTypeScriptCode(), `${scratcherId}.ts`)}>
              Download .ts
            </button>
          </div>
          <pre className="code-preview">
            <code>{generateScratcherTypeScriptCode()}</code>
          </pre>

          <h3>JSON</h3>
          <div className="code-actions">
            <button onClick={() => handleCopyToClipboard(generateScratcherJSONCode())}>
              Copy JSON
            </button>
            <button onClick={() => handleDownload(generateScratcherJSONCode(), `${scratcherId}.json`)}>
              Download .json
            </button>
          </div>
          <pre className="code-preview">
            <code>{generateScratcherJSONCode()}</code>
          </pre>
        </section>
      </div>
    </div>
  );

  // Render Prize Designer panel
  const renderPrizeDesigner = () => (
    <div className="content prize-content">
      <div className="left-panel">
        <section className="panel">
          <h2>Prize Info</h2>
          <div className="form-group">
            <label>Prize ID (kebab-case, for filename):</label>
            <input
              type="text"
              value={prizeId}
              onChange={(e) => setPrizeId(e.target.value)}
              placeholder="grand-prize"
            />
          </div>
          <div className="form-group">
            <label>Prize Name:</label>
            <input
              type="text"
              value={prizeName}
              onChange={(e) => setPrizeName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Prize Value:</label>
            <input
              type="text"
              value={prizeValue}
              onChange={(e) => setPrizeValue(e.target.value)}
              placeholder="$1000, 500 Coins, +50 HP, etc."
            />
          </div>
          <div className="form-group">
            <label>Emoji:</label>
            <input
              type="text"
              value={prizeEmoji}
              onChange={(e) => handlePrizeEmojiChange(e.target.value)}
              placeholder="🏆"
              className={prizeEmojiError ? 'error' : ''}
            />
            {prizeEmojiError && (
              <span className="error-message">{prizeEmojiError}</span>
            )}
          </div>
        </section>

        <section className="panel">
          <h2>Load/Save</h2>
          <input
            type="file"
            ref={prizeInputRef}
            onChange={handleLoadPrize}
            accept=".ts,.json"
            style={{ display: 'none' }}
          />
          <button onClick={() => prizeInputRef.current?.click()}>
            📂 Load Existing Prize
          </button>
          <button onClick={handleResetPrize} style={{ marginTop: '10px' }}>
            🔄 Reset Form
          </button>
          <p className="instructions" style={{ fontSize: '12px', marginTop: '8px' }}>
            Load a .ts or .json prize file from core/game-logic/prizes/
          </p>
        </section>
      </div>

      <div className="center-panel">
        <section className="panel">
          <h2>Preview</h2>
          <div className="prize-preview">
            <div className="prize-card">
              <div className="prize-emoji" style={{ fontSize: '64px' }}>
                {prizeEmoji}
              </div>
              <div className="prize-name" style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>
                {prizeName}
              </div>
              <div className="prize-value" style={{ fontSize: '18px', color: '#28a745', marginTop: '5px' }}>
                {prizeValue}
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Quick Emoji Picker</h2>
          <div className="emoji-picker">
            {['🏆', '💎', '🪙', '⭐', '🎁', '🧪', '🔑', '⚔️', '🛡️', '👑', '💰', '🎰', '🍀', '🌟', '💫'].map(emoji => (
              <button
                key={emoji}
                className="emoji-button"
                onClick={() => handlePrizeEmojiChange(emoji)}
                style={{ 
                  fontSize: '24px', 
                  padding: '8px', 
                  margin: '4px',
                  background: prizeEmoji === emoji ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#0f3460'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="right-panel">
        <section className="panel">
          <h2>Export Configuration</h2>
          
          <h3>Save to Core</h3>
          <div className="code-actions">
            <button onClick={() => handleDownload(generatePrizeTypeScriptCode(), `${prizeId}.ts`)}>
              💾 Download for Core
            </button>
          </div>
          <p className="instructions" style={{ fontSize: '12px', marginTop: '8px' }}>
            Save to: <code>core/game-logic/prizes/{prizeId}.ts</code>
          </p>

          <h3>TypeScript</h3>
          <div className="code-actions">
            <button onClick={() => handleCopyToClipboard(generatePrizeTypeScriptCode())}>
              Copy TypeScript
            </button>
            <button onClick={() => handleDownload(generatePrizeTypeScriptCode(), `${prizeId}.ts`)}>
              Download .ts
            </button>
          </div>
          <pre className="code-preview">
            <code>{generatePrizeTypeScriptCode()}</code>
          </pre>

          <h3>JSON</h3>
          <div className="code-actions">
            <button onClick={() => handleCopyToClipboard(generatePrizeJSONCode())}>
              Copy JSON
            </button>
            <button onClick={() => handleDownload(generatePrizeJSONCode(), `${prizeId}.json`)}>
              Download .json
            </button>
          </div>
          <pre className="code-preview">
            <code>{generatePrizeJSONCode()}</code>
          </pre>
        </section>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header>
        <h1>🎮 Game Designer Toolkit</h1>
        <p>Design and configure tickets, scratchers, and prizes</p>
        {renderTabNavigation()}
      </header>

      {activeTab === 'scratchers' && renderScratcherDesigner()}

      {activeTab === 'prizes' && renderPrizeDesigner()}

      {activeTab === 'layouts' && (
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
            <div className="form-group">
              <label>Ticket Type:</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as TicketType)}
              >
                <option value="Core">Core</option>
                <option value="Hand">Hand</option>
                <option value="Crawl" disabled>Crawl (Coming Soon)</option>
              </select>
              <p className="instructions" style={{ fontSize: '12px', marginTop: '4px' }}>
                Type for categorization. Crawl tickets are not yet available.
              </p>
            </div>
            <div className="form-group">
              <label>Gold Cost:</label>
              <input
                type="number"
                value={goldCost}
                onChange={(e) => {
                  // Parse the value, defaulting to 0 for empty/invalid input
                  // 0 is a valid value (free ticket), so this is intentional
                  const value = parseInt(e.target.value);
                  setGoldCost(Math.max(0, isNaN(value) ? 0 : value));
                }}
                min="0"
                placeholder="Cost in gold (0 = free)"
              />
              <p className="instructions" style={{ fontSize: '12px', marginTop: '4px' }}>
                Cost to purchase this ticket type (0 = free)
              </p>
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
                <option value="independent">✨ Independent (Recommended)</option>
                <optgroup label="Legacy (Deprecated)">
                  <option value="reveal-all">Reveal All</option>
                  <option value="reveal-one">Reveal One</option>
                  <option value="match-three">Match Three</option>
                  <option value="match-two">Match Two</option>
                  <option value="progressive">Progressive</option>
                </optgroup>
              </select>
              <p className="instructions" style={{ fontSize: '12px', marginTop: '4px' }}>
                Use 'Independent' for one prize per area (recommended for new tickets)
              </p>
            </div>
            <div className="form-group">
              <label>Win Condition:</label>
              <select
                value={winCondition}
                onChange={(e) => setWinCondition(e.target.value as WinCondition)}
              >
                <optgroup label="New Win Conditions">
                  <option value="no-win-condition">Always Win (No Condition)</option>
                  <option value="match-two">Match Two</option>
                  <option value="match-three">Match Three</option>
                  <option value="match-all">Match All (Jackpot)</option>
                  <option value="find-one">Find One (Specific Prize)</option>
                  <option value="total-value-threshold">Value Threshold</option>
                </optgroup>
                <optgroup label="Legacy (Deprecated)">
                  <option value="reveal-all-areas">Reveal All Areas</option>
                  <option value="reveal-any-area">Reveal Any Area</option>
                  <option value="match-symbols">Match Symbols</option>
                  <option value="progressive-reveal">Progressive Reveal</option>
                </optgroup>
              </select>
            </div>

            {/* Show targetPrizeId field when find-one is selected */}
            {winCondition === 'find-one' && (
              <div className="form-group">
                <label>Target Prize ID:</label>
                <select
                  value={targetPrizeId}
                  onChange={(e) => setTargetPrizeId(e.target.value)}
                >
                  <option value="">-- Select Target Prize --</option>
                  {AVAILABLE_PRIZES.map(prize => (
                    <option key={prize.id} value={prize.id}>
                      {prize.emoji} {prize.name}
                    </option>
                  ))}
                </select>
                <p className="instructions" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Player must find this prize to win
                </p>
              </div>
            )}

            {/* Show valueThreshold field when total-value-threshold is selected */}
            {winCondition === 'total-value-threshold' && (
              <div className="form-group">
                <label>Value Threshold (Gold):</label>
                <input
                  type="number"
                  value={valueThreshold}
                  onChange={(e) => setValueThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <p className="instructions" style={{ fontSize: '12px', marginTop: '4px' }}>
                  Combined prize gold value must exceed this amount
                </p>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Prize Configuration</h2>
            <p className="instructions" style={{ fontSize: '12px', marginBottom: '10px' }}>
              Configure which prizes are available for this ticket and their relative weights.
              Higher weights = higher chance of being selected.
            </p>
            
            <div className="prize-configs">
              {prizeConfigs.map((config, index) => {
                const prizeInfo = AVAILABLE_PRIZES.find(p => p.id === config.prizeId);
                return (
                  <div key={index} className="prize-config-item" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    padding: '8px',
                    background: '#0a1929',
                    borderRadius: '4px'
                  }}>
                    <span style={{ fontSize: '20px' }}>{prizeInfo?.emoji || '?'}</span>
                    <select
                      value={config.prizeId}
                      onChange={(e) => {
                        const newConfigs = [...prizeConfigs];
                        newConfigs[index] = { ...config, prizeId: e.target.value };
                        setPrizeConfigs(newConfigs);
                      }}
                      style={{ flex: 1 }}
                    >
                      {AVAILABLE_PRIZES.map(prize => (
                        <option key={prize.id} value={prize.id}>
                          {prize.emoji} {prize.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={config.weight}
                      onChange={(e) => {
                        const newConfigs = [...prizeConfigs];
                        newConfigs[index] = { ...config, weight: Math.max(0, parseInt(e.target.value) || 0) };
                        setPrizeConfigs(newConfigs);
                      }}
                      style={{ width: '60px' }}
                      min="0"
                      title="Weight"
                    />
                    <button
                      onClick={() => {
                        const newConfigs = prizeConfigs.filter((_, i) => i !== index);
                        setPrizeConfigs(newConfigs);
                      }}
                      style={{ 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                const newConfigs = [...prizeConfigs, { prizeId: 'diamond', weight: 5 }];
                setPrizeConfigs(newConfigs);
              }}
              style={{ marginTop: '8px', width: '100%' }}
            >
              + Add Prize
            </button>

            {prizeConfigs.length === 0 && (
              <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
                ⚠️ No prizes configured. Add at least one prize with a positive weight.
              </p>
            )}

            {prizeConfigs.some(c => c.weight <= 0) && (
              <p style={{ color: '#ffc107', fontSize: '12px', marginTop: '8px' }}>
                ⚠️ Some prizes have zero or negative weights and will be skipped.
              </p>
            )}
          </section>

          <section className="panel">
            <h2>📊 Odds Information</h2>
            <p className="instructions" style={{ fontSize: '12px', marginBottom: '10px' }}>
              Calculated odds based on current prize configuration and win condition.
            </p>
            
            {(() => {
              const prizeOdds = calculatePrizeOdds(prizeConfigs);
              const winProb = calculateWinProbability(prizeOdds, winCondition, scratchAreas.length);
              const winExplanation = getWinConditionExplanation(winCondition, scratchAreas.length);
              
              return (
                <>
                  {/* Win Probability */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(17, 153, 142, 0.2) 0%, rgba(56, 239, 125, 0.2) 100%)',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 239, 125, 0.3)',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Win Probability:</span>
                      <span style={{ color: '#38ef7d', fontSize: '1.3rem', fontWeight: '700' }}>
                        {formatPercentage(winProb)}
                      </span>
                    </div>
                    <p style={{ color: '#ccc', fontSize: '0.85rem', margin: 0 }}>{winExplanation}</p>
                  </div>

                  {/* Prize Odds Table */}
                  {prizeOdds.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 4px', color: '#8b9dc3' }}>Prize</th>
                            <th style={{ textAlign: 'right', padding: '8px 4px', color: '#8b9dc3' }}>Chance</th>
                            <th style={{ textAlign: 'right', padding: '8px 4px', color: '#8b9dc3' }}>Odds</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prizeOdds.sort((a, b) => b.probability - a.probability).map(prize => (
                            <tr key={prize.prizeId} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <td style={{ padding: '8px 4px' }}>
                                <span style={{ marginRight: '6px' }}>{prize.emoji}</span>
                                <span style={{ color: '#fff' }}>{prize.name}</span>
                              </td>
                              <td style={{ textAlign: 'right', padding: '8px 4px', color: '#f0c040', fontWeight: '600' }}>
                                {prize.percentageStr}
                              </td>
                              <td style={{ textAlign: 'right', padding: '8px 4px', color: '#aaa' }}>
                                {prize.oddsStr}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '15px' }}>
                      No valid prizes configured
                    </p>
                  )}

                  {/* Info */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '10px',
                    borderRadius: '6px',
                    marginTop: '15px'
                  }}>
                    <p style={{ color: '#888', fontSize: '0.75rem', margin: 0 }}>
                      ℹ️ Win probability is an approximation based on independent random prize selection per area.
                      Actual odds may vary.
                    </p>
                  </div>
                </>
              );
            })()}
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
        </div>
      </div>
      )}

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
