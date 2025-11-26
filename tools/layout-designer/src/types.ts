/**
 * Types for the Ticket Layout Designer
 * These mirror the types from core/mechanics/ticketLayouts.ts
 */

export interface ScratchAreaConfig {
  id: string;
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
  canvasWidth: number;
  canvasHeight: number;
  revealThreshold: number;
}

export type RevealMechanic = 
  | 'reveal-all'
  | 'reveal-one'
  | 'match-three'
  | 'match-two'
  | 'progressive';

export type WinCondition = 
  | 'reveal-all-areas'
  | 'reveal-any-area'
  | 'match-symbols'
  | 'progressive-reveal';

export interface TicketLayout {
  id: string;
  name: string;
  description: string;
  scratchAreas: ScratchAreaConfig[];
  revealMechanic: RevealMechanic;
  winCondition: WinCondition;
  ticketWidth: number;
  ticketHeight: number;
  backgroundImage?: string;
}

export interface DrawingRect {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

/**
 * Scratcher configuration - mirrors core/mechanics/scratchers.ts
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
 * Prize configuration - mirrors core/mechanics/prizes.ts
 */
export interface Prize {
  /** Display name for this prize */
  name: string;
  /** Value description of this prize */
  value: string;
  /** Emoji to display for this prize */
  emoji: string;
}
