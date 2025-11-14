/**
 * Scratcher Configuration System
 * 
 * This module defines the structure for configurable scratcher types,
 * allowing for dynamic scratcher graphics and behavior.
 */

/**
 * Defines a scratcher type with its visual appearance and behavior
 */
export interface Scratcher {
  /** Unique identifier for this scratcher */
  id: string;
  /** Display name for this scratcher */
  name: string;
  /** Description of this scratcher */
  description: string;
  /** Emoji or symbol to display as the scratcher cursor/token */
  symbol: string;
  /** Scratch radius in pixels (size of the scratch area per action) */
  scratchRadius: number;
  /** Visual style for the scratcher overlay */
  style?: {
    /** Background color/gradient for the scratch overlay */
    overlayColor?: string;
    /** Pattern or texture for the overlay */
    overlayPattern?: string;
  };
}

/**
 * Default coin scratcher (original demo scratcher)
 */
export const COIN_SCRATCHER: Scratcher = {
  id: 'coin',
  name: 'Gold Coin',
  description: 'Classic coin scratcher - medium scratch area',
  symbol: '🪙',
  scratchRadius: 25,
  style: {
    overlayColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    overlayPattern: 'SCRATCH',
  },
};

/**
 * Brush scratcher - larger scratch area
 */
export const BRUSH_SCRATCHER: Scratcher = {
  id: 'brush',
  name: 'Magic Brush',
  description: 'Wide brush for faster scratching',
  symbol: '🖌️',
  scratchRadius: 35,
  style: {
    overlayColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    overlayPattern: 'SCRATCH',
  },
};

/**
 * Finger scratcher - small, precise scratch area
 */
export const FINGER_SCRATCHER: Scratcher = {
  id: 'finger',
  name: 'Finger',
  description: 'Precise finger scratching',
  symbol: '👆',
  scratchRadius: 20,
  style: {
    overlayColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    overlayPattern: 'SCRATCH',
  },
};

/**
 * Key scratcher - very small, strategic scratching
 */
export const KEY_SCRATCHER: Scratcher = {
  id: 'key',
  name: 'Golden Key',
  description: 'Small key for strategic scratching',
  symbol: '🔑',
  scratchRadius: 15,
  style: {
    overlayColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    overlayPattern: 'SCRATCH',
  },
};

/**
 * Eraser scratcher - very large scratch area
 */
export const ERASER_SCRATCHER: Scratcher = {
  id: 'eraser',
  name: 'Mega Eraser',
  description: 'Massive eraser for quick reveals',
  symbol: '🧽',
  scratchRadius: 50,
  style: {
    overlayColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    overlayPattern: 'SCRATCH',
  },
};

/**
 * Sword scratcher - medium-large, game-themed
 */
export const SWORD_SCRATCHER: Scratcher = {
  id: 'sword',
  name: 'Fire Sword',
  description: 'Slash through with style',
  symbol: '⚔️',
  scratchRadius: 30,
  style: {
    overlayColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    overlayPattern: 'SCRATCH',
  },
};

/**
 * All available scratcher types
 */
export const SCRATCHER_TYPES: Record<string, Scratcher> = {
  coin: COIN_SCRATCHER,
  brush: BRUSH_SCRATCHER,
  finger: FINGER_SCRATCHER,
  key: KEY_SCRATCHER,
  eraser: ERASER_SCRATCHER,
  sword: SWORD_SCRATCHER,
};

/**
 * Get a scratcher by ID
 */
export function getScratcher(id: string): Scratcher {
  return SCRATCHER_TYPES[id] || COIN_SCRATCHER;
}

/**
 * Get all scratcher IDs
 */
export function getScratchers(): Scratcher[] {
  return Object.values(SCRATCHER_TYPES);
}
