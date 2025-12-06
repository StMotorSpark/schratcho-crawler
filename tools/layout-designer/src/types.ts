/**
 * Types for the Ticket Layout Designer
 * These mirror the types from core/mechanics/ticketLayouts.ts and core/mechanics/scratchers.ts
 */

/**
 * Ticket type for categorization and filtering
 */
export type TicketType = 'Core' | 'Hand' | 'Crawl';

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

/**
 * Reveal mechanics - 'independent' is the recommended mechanic for new tickets.
 * Legacy mechanics are deprecated but maintained for backward compatibility.
 */
export type RevealMechanic = 
  | 'independent'     // Recommended: Each area has its own independent prize
  | 'reveal-all'      // @deprecated
  | 'reveal-one'      // @deprecated
  | 'match-three'     // @deprecated
  | 'match-two'       // @deprecated
  | 'progressive';    // @deprecated

/**
 * Win conditions for ticket layouts.
 * New conditions work with independent prizes per area.
 */
export type WinCondition = 
  | 'no-win-condition'       // Always wins - just reveals what was won
  | 'match-two'              // Two areas must have matching prizes
  | 'match-three'            // Three areas must have matching prizes
  | 'match-all'              // All areas must have matching prizes (jackpot)
  | 'find-one'               // Must find a specific prize (uses targetPrizeId)
  | 'total-value-threshold'  // Combined value exceeds threshold
  | 'reveal-all-areas'       // @deprecated
  | 'reveal-any-area'        // @deprecated
  | 'match-symbols'          // @deprecated
  | 'progressive-reveal';    // @deprecated

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
  /** Ticket type for categorization (Core, Hand, or Crawl) */
  type?: TicketType;
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
  /** Target prize ID for 'find-one' win condition */
  targetPrizeId?: string;
  /** Value threshold for 'total-value-threshold' win condition */
  valueThreshold?: number;
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
 * Hand effect target types
 */
export type HandEffectTarget = 'prior' | 'next' | 'hand' | 'self';

/**
 * Hand effect operation types
 */
export type HandEffectOperation = 'multiply' | 'add' | 'subtract' | 'set' | 'diff';

/**
 * Conditional operation for diff effects
 */
export interface HandEffectCondition {
  type: 'greater' | 'less' | 'equal';
  target: HandEffectTarget;
  operation: HandEffectOperation;
  amount: number;
}

/**
 * Hand effect configuration
 */
export interface HandEffect {
  operation: HandEffectOperation;
  target: HandEffectTarget;
  amount: number;
  conditions?: HandEffectCondition[];
}

/**
 * Prize effects that can be applied when a ticket is resolved.
 */
export interface PrizeEffects {
  /** Hand effect to apply (modifies hand calculations instead of direct gold) */
  handEffect?: HandEffect;
  // Note: State effects and achievement IDs are handled in the core implementation
  // but not needed in the designer tool
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
  /** Optional effects to apply to user state when this prize is won */
  effects?: PrizeEffects;
}

/**
 * Active tab in the designer
 */
export type DesignerTab = 'layouts' | 'scratchers' | 'prizes';
