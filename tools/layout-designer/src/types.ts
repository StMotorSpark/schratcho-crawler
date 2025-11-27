/**
 * Types for the Ticket Layout Designer
 * These mirror the types from core/mechanics/ticketLayouts.ts and core/mechanics/scratchers.ts
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

/**
 * Configuration for associating a prize with a ticket layout.
 * Defines which prize is available and its relative weight for selection.
 */
export interface PrizeConfig {
  /** The ID of the prize (references Prize.id) */
  prizeId: string;
  /** 
   * Weight for random selection (higher = more likely).
   * Must be a positive number. Zero or negative weights will trigger warnings.
   */
  weight: number;
}

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
  /** Gold cost to purchase this ticket type (default: 5, 0 = free) */
  goldCost?: number;
  /** 
   * Prize configurations for this ticket layout.
   * Defines which prizes are available and their relative weights.
   */
  prizeConfigs?: PrizeConfig[];
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
 * Note: Prize interface now includes an 'id' field for explicit association with ticket layouts.
 */
export interface Prize {
  /** Unique identifier for this prize (used for prize association) */
  id: string;
  /** Display name of the prize */
  name: string;
  /** Value of the prize (e.g., "$1000", "500 Coins") */
  value: string;
  /** Emoji representing the prize */
  emoji: string;
}

/**
 * Active tab in the designer
 */
export type DesignerTab = 'layouts' | 'scratchers' | 'prizes';
