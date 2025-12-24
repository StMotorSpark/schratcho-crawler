/**
 * Ticket Layout Configuration System
 * 
 * This module defines the structure for configurable ticket layouts,
 * allowing for dynamic scratch areas, prize reveal mechanics, and win conditions.
 * 
 * ## Prize Association
 * Each ticket layout must define its own prize pool via the `prizeConfigs` field.
 * This enables different tickets to have different prize pools and odds.
 */

import type { Prize, PrizeConfig } from './prizes';
import { getRandomPrizeForLayout, getRandomPrize as getLegacyRandomPrize, getPrizeGoldValue } from './prizes';
import { GOBLIN_GOLD_TICKET } from '../game-logic/tickets/basic-goblinGold/goblinGoldLayout';
import { TEST_TWO_COLUMN_TICKET } from '../game-logic/tickets/test-two-column';
import { TEST_HAND_TICKET } from '../game-logic/tickets/test-hand/testHandLayout';
import { TEST_DYNAMIC_SYMBOL_TICKET } from '../game-logic/tickets/test-dynamic-symbol';
import { BETTING_EXAMPLE_TICKET } from '../game-logic/tickets/betting-example/bettingExampleLayout';

/**
 * Defines the position and size of a scratch area on the ticket
 */
export interface ScratchAreaConfig {
  /** Unique identifier for this scratch area */
  id: string;
  /** Relative position from top (0-1, where 0 is top and 1 is bottom) */
  topPercent: number;
  /** Relative position from left (0-1, where 0 is left and 1 is right) */
  leftPercent: number;
  /** Width as percentage of ticket width (0-1) */
  widthPercent: number;
  /** Height as percentage of ticket height (0-1) */
  heightPercent: number;
  /** Canvas width in pixels for mask rendering */
  canvasWidth: number;
  /** Canvas height in pixels for mask rendering */
  canvasHeight: number;
  /** Threshold percentage (0-100) for considering area as revealed */
  revealThreshold: number;
}

/**
 * Prize reveal mechanics determine how prizes are displayed across scratch areas.
 * 
 * The new 'independent' mechanic means each scratch area contains its own unique prize,
 * enabling authentic scratch-off mechanics where players discover different prizes under each area.
 */
export type RevealMechanic = 
  | 'independent'     // Each area has its own independent prize (recommended)
  | 'reveal-all'      // @deprecated - Same prize revealed in all areas
  | 'reveal-one'      // @deprecated - Prize only revealed in one specific area
  | 'match-three'     // @deprecated - Use 'independent' with 'match-three' win condition
  | 'match-two'       // @deprecated - Use 'independent' with 'match-two' win condition
  | 'progressive';    // @deprecated - Each area reveals part of the prize info

/**
 * Win conditions determine what counts as a winning ticket.
 * 
 * The new win conditions work with arrays of prizes (one per scratch area):
 * - 'no-win-condition': Always wins (just reveals what was won)
 * - 'match-two': Two areas must have matching prize emojis
 * - 'match-three': Three areas must have matching prize emojis
 * - 'match-all': All areas must have matching prize emojis (jackpot)
 * - 'find-one': Must find a specific prize (defined by targetPrizeId)
 * - 'find-one-dynamic': Must find the symbol revealed in the winning symbol area (uses winningSymbolAreaId)
 * - 'total-value-threshold': Combined prize values must exceed a threshold
 */
export type WinCondition = 
  | 'no-win-condition'       // Always wins - show what you got
  | 'match-two'              // Two areas must match
  | 'match-three'            // Three areas must match
  | 'match-all'              // All areas must match (jackpot)
  | 'find-one'               // Find a specific prize (uses targetPrizeId)
  | 'find-one-dynamic'       // Find the dynamically revealed symbol (uses winningSymbolAreaId)
  | 'total-value-threshold'  // Combined value exceeds threshold
  | 'reveal-all-areas'       // @deprecated - Must scratch all areas to win
  | 'reveal-any-area'        // @deprecated - Win when any single area is revealed
  | 'match-symbols'          // @deprecated - Use new match conditions instead
  | 'progressive-reveal';    // @deprecated - Win when final area is revealed

/**
 * Ticket type for categorization and filtering
 */
export type TicketType = 'Core' | 'Hand' | 'Crawl';

/**
 * Defines a bet option that can be placed on a ticket.
 * Each option specifies the bet amount and the effects applied if the bet condition is met.
 */
export interface BetOption {
  /** Display order for UI (1 = first, 2 = second, 3 = third) */
  order: number;
  /** Amount of gold required to place this bet */
  betAmount: number;
  /** Friendly description of what this bet does */
  description: string;
  /** Minimum prize value threshold to activate this bet's bonus (0 = any win) */
  minPrizeThreshold: number;
  /** Multiplier applied to winning amount if condition is met */
  winMultiplier: number;
  /** Whether this bet is refunded if the ticket doesn't win */
  isRefundable?: boolean;
  /** Badge to display for this bet option (e.g., "Safe Bet", "High Risk") */
  badge?: string;
}

/**
 * Betting configuration for a ticket layout.
 * When enabled, players must select one of the bet options before scratching.
 */
export interface BettingConfig {
  /** Whether betting is enabled for this ticket */
  enabled: boolean;
  /** Array of exactly 3 bet options (required when enabled) */
  betOptions: [BetOption, BetOption, BetOption];
  /** Message to display when player doesn't have enough gold for any bet */
  insufficientFundsMessage?: string;
}

/**
 * Complete ticket layout configuration
 */
export interface TicketLayout {
  /** Unique identifier for this ticket type */
  id: string;
  /** Display name for this ticket type */
  name: string;
  /** Description of this ticket type */
  description: string;
  /** Ticket type for categorization (Core, Hand, or Crawl) */
  type?: TicketType;
  /** Configuration for each scratch area */
  scratchAreas: ScratchAreaConfig[];
  /** How prizes are revealed across areas */
  revealMechanic: RevealMechanic;
  /** What counts as a win */
  winCondition: WinCondition;
  /** Ticket width in pixels (for absolute positioning) */
  ticketWidth: number;
  /** Ticket height in pixels (for absolute positioning) */
  ticketHeight: number;
  /** Optional background image path for the ticket */
  backgroundImage?: string;
  /** Optional key used by frontends to resolve bundled assets */
  backgroundImageKey?: string;
  /** Gold cost to purchase this ticket type (default: 5, 0 = free) */
  goldCost?: number;
  /** 
   * Prize configurations for this ticket layout.
   * Defines which prizes are available and their relative weights.
   * If not specified, falls back to legacy global prize pool.
   */
  prizeConfigs?: PrizeConfig[];
  /**
   * Target prize ID for 'find-one' win condition.
   * Player must reveal an area containing this prize to win.
   */
  targetPrizeId?: string;
  /**
   * Value threshold for 'total-value-threshold' win condition.
   * Combined gold value of revealed prizes must exceed this amount to win.
   */
  valueThreshold?: number;
  /**
   * Winning symbol area ID for 'find-one-dynamic' win condition.
   * This scratch area reveals the symbol that players must find in other areas to win.
   */
  winningSymbolAreaId?: string;
  /**
   * Optional betting configuration for this ticket.
   * When present and enabled, players must place a bet before scratching.
   */
  bettingConfig?: BettingConfig;
}

/**
 * Default classic ticket layout (3 horizontal areas)
 * Uses independent prize per area with no-win-condition
 */
export const CLASSIC_TICKET: TicketLayout = {
  id: 'classic',
  name: 'Classic Scratch Ticket',
  description: 'Three horizontal scratch areas - each reveals its own prize',
  type: 'Core',
  goldCost: 5,
  scratchAreas: [
    {
      id: 'area-1',
      topPercent: 0,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 0.333,
      canvasWidth: 400,
      canvasHeight: 90,
      revealThreshold: 50,
    },
    {
      id: 'area-2',
      topPercent: 0.333,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 0.333,
      canvasWidth: 400,
      canvasHeight: 90,
      revealThreshold: 50,
    },
    {
      id: 'area-3',
      topPercent: 0.666,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 0.334,
      canvasWidth: 400,
      canvasHeight: 90,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'match-three',
  ticketWidth: 500,
  ticketHeight: 300,
  // Classic ticket has a balanced prize pool with all prizes
  prizeConfigs: [
    { prizeId: 'grand-prize', weight: 1 },     // Rare
    { prizeId: 'gold-coins', weight: 2 },      // Uncommon
    { prizeId: 'diamond', weight: 5 },         // Common
    { prizeId: 'treasure-chest', weight: 3 },  // Uncommon
    { prizeId: 'magic-potion', weight: 10 },   // Very common
    { prizeId: 'lucky-star', weight: 4 },      // Somewhat common
    { prizeId: 'golden-key', weight: 2 },      // Uncommon
    { prizeId: 'fire-sword', weight: 6 },      // Common
    { prizeId: 'shield', weight: 15 },         // Most common
    { prizeId: 'crown', weight: 2 },           // Uncommon
  ],
};

/**
 * Grid ticket layout (3x3 grid)
 * Uses match-three win condition - find 3 matching prizes to win
 */
export const GRID_TICKET: TicketLayout = {
  id: 'grid',
  name: 'Grid Ticket',
  description: 'Nine areas in a 3x3 grid - match three to win',
  type: 'Core',
  goldCost: 10,
  scratchAreas: [
    // Row 1
    {
      id: 'grid-1-1',
      topPercent: 0,
      leftPercent: 0,
      widthPercent: 0.333,
      heightPercent: 0.333,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    {
      id: 'grid-1-2',
      topPercent: 0,
      leftPercent: 0.333,
      widthPercent: 0.333,
      heightPercent: 0.333,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    {
      id: 'grid-1-3',
      topPercent: 0,
      leftPercent: 0.666,
      widthPercent: 0.334,
      heightPercent: 0.333,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    // Row 2
    {
      id: 'grid-2-1',
      topPercent: 0.333,
      leftPercent: 0,
      widthPercent: 0.333,
      heightPercent: 0.333,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    {
      id: 'grid-2-2',
      topPercent: 0.333,
      leftPercent: 0.333,
      widthPercent: 0.333,
      heightPercent: 0.333,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    {
      id: 'grid-2-3',
      topPercent: 0.333,
      leftPercent: 0.666,
      widthPercent: 0.334,
      heightPercent: 0.333,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    // Row 3
    {
      id: 'grid-3-1',
      topPercent: 0.666,
      leftPercent: 0,
      widthPercent: 0.333,
      heightPercent: 0.334,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    {
      id: 'grid-3-2',
      topPercent: 0.666,
      leftPercent: 0.333,
      widthPercent: 0.333,
      heightPercent: 0.334,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
    {
      id: 'grid-3-3',
      topPercent: 0.666,
      leftPercent: 0.666,
      widthPercent: 0.334,
      heightPercent: 0.334,
      canvasWidth: 130,
      canvasHeight: 90,
      revealThreshold: 60,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'match-three',
  ticketWidth: 500,
  ticketHeight: 300,
  // Grid ticket has higher-value prizes since it costs more
  prizeConfigs: [
    { prizeId: 'grand-prize', weight: 2 },     // More frequent than classic
    { prizeId: 'gold-coins', weight: 4 },      // Higher chance
    { prizeId: 'diamond', weight: 6 },         // Good odds
    { prizeId: 'treasure-chest', weight: 5 },  // Common
    { prizeId: 'crown', weight: 3 },           // Decent odds
  ],
};

/**
 * Single area ticket layout
 * Uses no-win-condition - always wins (just reveals the prize)
 */
export const SINGLE_AREA_TICKET: TicketLayout = {
  id: 'single',
  name: 'Single Area Ticket',
  description: 'One large scratch area - reveal your prize',
  type: 'Core',
  goldCost: 3,
  scratchAreas: [
    {
      id: 'single-area',
      topPercent: 0,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 1,
      canvasWidth: 400,
      canvasHeight: 270,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'no-win-condition',
  ticketWidth: 500,
  ticketHeight: 300,
  // Budget ticket with smaller prizes
  prizeConfigs: [
    { prizeId: 'magic-potion', weight: 10 },   // Most common
    { prizeId: 'shield', weight: 15 },         // Very common
    { prizeId: 'fire-sword', weight: 8 },      // Common
    { prizeId: 'diamond', weight: 3 },         // Less common
    { prizeId: 'golden-key', weight: 2 },      // Rare bonus
  ],
};

/**
 * All available ticket layouts
 */
export const TICKET_LAYOUTS: Record<string, TicketLayout> = {
  classic: CLASSIC_TICKET,
  grid: GRID_TICKET,
  single: SINGLE_AREA_TICKET,
  'goblin-gold': GOBLIN_GOLD_TICKET,
  'test-two-column': TEST_TWO_COLUMN_TICKET,
  'test-hand': TEST_HAND_TICKET,
  'test-dynamic-symbol': TEST_DYNAMIC_SYMBOL_TICKET,
  'betting-example': BETTING_EXAMPLE_TICKET,
};

/**
 * Get a ticket layout by ID
 */
export function getTicketLayout(id: string): TicketLayout {
  return TICKET_LAYOUTS[id] || CLASSIC_TICKET;
}

/**
 * Default gold cost for tickets if not specified
 */
export const DEFAULT_TICKET_GOLD_COST = 5;

/**
 * Get the gold cost for a ticket layout
 */
export function getTicketGoldCost(layout: TicketLayout): number {
  return layout.goldCost ?? DEFAULT_TICKET_GOLD_COST;
}

/**
 * Get a random prize for a ticket layout.
 * Uses the layout's prize configuration if available, otherwise falls back to legacy behavior.
 * 
 * @param layout - The ticket layout to get a prize for
 * @returns A randomly selected prize based on the layout's configuration
 */
export function getRandomPrizeForTicket(layout: TicketLayout): Prize {
  if (layout.prizeConfigs && layout.prizeConfigs.length > 0) {
    return getRandomPrizeForLayout(layout.prizeConfigs);
  }
  
  // Fallback to legacy behavior for layouts without prize configs
  console.warn(`Layout "${layout.id}" does not have prize configurations. Using legacy global prize pool.`);
  return getLegacyRandomPrize();
}

/**
 * Generate an array of prizes, one for each scratch area in the layout.
 * This is used for the new 'independent' reveal mechanic where each area has its own prize.
 * 
 * @param layout - The ticket layout to generate prizes for
 * @returns An array of prizes, one for each scratch area
 */
export function generateAreaPrizes(layout: TicketLayout): Prize[] {
  return layout.scratchAreas.map(() => getRandomPrizeForTicket(layout));
}

/**
 * Count how many times each prize emoji appears in the revealed prizes.
 * Used for match-based win conditions.
 * 
 * @param prizes - Array of prizes to count
 * @returns A record mapping emoji to count
 */
export function countPrizeMatches(prizes: Prize[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const prize of prizes) {
    counts[prize.emoji] = (counts[prize.emoji] || 0) + 1;
  }
  return counts;
}

/**
 * Get the maximum match count from a prize array.
 * 
 * @param prizes - Array of prizes to check
 * @returns The highest number of matching prizes
 */
export function getMaxMatchCount(prizes: Prize[]): number {
  const counts = countPrizeMatches(prizes);
  return Math.max(0, ...Object.values(counts));
}

/**
 * Evaluate if a ticket is a winner based on win condition.
 * 
 * For the new architecture with independent prizes per area, pass areaPrizes.
 * The function checks revealed prizes based on revealedAreas to determine the winner.
 * 
 * @param layout - The ticket layout configuration
 * @param revealedAreas - Set of revealed area IDs
 * @param areaPrizes - Array of prizes, one per scratch area (for new system)
 * @param matchData - Legacy match data (deprecated)
 * @returns true if the ticket is a winner based on its win condition
 */
export function evaluateWinCondition(
  layout: TicketLayout,
  revealedAreas: Set<string>,
  areaPrizes?: Prize[],
  matchData?: { symbols: string[]; matches: number }
): boolean {
  // Get the revealed prizes for match-based conditions
  const getRevealedPrizes = (): Prize[] => {
    if (!areaPrizes) return [];
    const revealedPrizes: Prize[] = [];
    for (let i = 0; i < layout.scratchAreas.length; i++) {
      if (revealedAreas.has(layout.scratchAreas[i].id)) {
        revealedPrizes.push(areaPrizes[i]);
      }
    }
    return revealedPrizes;
  };

  switch (layout.winCondition) {
    // New win conditions
    case 'no-win-condition':
      // Always wins when at least one area is revealed
      return revealedAreas.size > 0;
    
    case 'match-two': {
      const revealed = getRevealedPrizes();
      return getMaxMatchCount(revealed) >= 2;
    }
    
    case 'match-three': {
      const revealed = getRevealedPrizes();
      return getMaxMatchCount(revealed) >= 3;
    }
    
    case 'match-all': {
      // All areas must be revealed and all must match
      if (revealedAreas.size !== layout.scratchAreas.length) return false;
      const revealed = getRevealedPrizes();
      if (revealed.length === 0) return false;
      const firstEmoji = revealed[0].emoji;
      return revealed.every(p => p.emoji === firstEmoji);
    }
    
    case 'find-one': {
      if (!layout.targetPrizeId) {
        console.warn(`Layout "${layout.id}" uses 'find-one' but has no targetPrizeId set.`);
        return false;
      }
      const revealed = getRevealedPrizes();
      return revealed.some(p => p.id === layout.targetPrizeId);
    }
    
    case 'find-one-dynamic': {
      if (!layout.winningSymbolAreaId) {
        console.warn(`Layout "${layout.id}" uses 'find-one-dynamic' but has no winningSymbolAreaId set.`);
        return false;
      }
      if (!areaPrizes) {
        console.warn(`Layout "${layout.id}" uses 'find-one-dynamic' but no areaPrizes provided.`);
        return false;
      }
      
      // Find the winning symbol area index
      const winningAreaIndex = layout.scratchAreas.findIndex(a => a.id === layout.winningSymbolAreaId);
      if (winningAreaIndex === -1) {
        console.warn(`Layout "${layout.id}" has invalid winningSymbolAreaId: ${layout.winningSymbolAreaId}`);
        return false;
      }
      
      // Check if the winning symbol area has been revealed
      if (!revealedAreas.has(layout.winningSymbolAreaId)) {
        // Player hasn't revealed the winning symbol yet
        return false;
      }
      
      // Get the winning symbol from the designated area
      const winningSymbol = areaPrizes[winningAreaIndex].emoji;
      
      // Check if any other revealed area (excluding the winning symbol area) matches the winning symbol
      for (let i = 0; i < layout.scratchAreas.length; i++) {
        const areaId = layout.scratchAreas[i].id;
        // Skip the winning symbol area itself
        if (areaId === layout.winningSymbolAreaId) continue;
        // Check if this area is revealed and matches the winning symbol
        if (revealedAreas.has(areaId) && areaPrizes[i].emoji === winningSymbol) {
          return true;
        }
      }
      
      return false;
    }
    
    case 'total-value-threshold': {
      if (!layout.valueThreshold) {
        console.warn(`Layout "${layout.id}" uses 'total-value-threshold' but has no valueThreshold set.`);
        return false;
      }
      const revealed = getRevealedPrizes();
      const totalValue = revealed.reduce((sum, prize) => {
        return sum + getPrizeGoldValue(prize);
      }, 0);
      return totalValue >= layout.valueThreshold;
    }

    // Legacy win conditions (deprecated but maintained for backwards compatibility)
    case 'reveal-all-areas':
      // All areas must be revealed
      return revealedAreas.size === layout.scratchAreas.length;
    
    case 'reveal-any-area':
      // At least one area revealed
      return revealedAreas.size > 0;
    
    case 'match-symbols':
      // Check if symbols match according to reveal mechanic (legacy)
      if (!matchData) return false;
      if (layout.revealMechanic === 'match-three') {
        return matchData.matches >= 3;
      }
      if (layout.revealMechanic === 'match-two') {
        return matchData.matches >= 2;
      }
      return false;
    
    case 'progressive-reveal': {
      // Last area must be revealed
      const lastAreaId = layout.scratchAreas[layout.scratchAreas.length - 1].id;
      return revealedAreas.has(lastAreaId);
    }
    
    default:
      return false;
  }
}

/**
 * Determine what prize information to show in each area based on reveal mechanic.
 * 
 * For the new 'independent' mechanic, the prize passed should be the specific
 * prize for that area (from areaPrizes[areaIndex]).
 * 
 * @param layout - The ticket layout
 * @param areaIndex - Index of the scratch area
 * @param prize - The prize for this specific area
 * @returns Display information for the prize
 */
export function getPrizeDisplayForArea(
  layout: TicketLayout,
  areaIndex: number,
  prize: Prize
): { emoji: string; name: string; value: string } {
  switch (layout.revealMechanic) {
    case 'independent':
      // Each area shows its own prize with emoji only (for matching games)
      // or full info for no-win-condition tickets
      if (layout.winCondition === 'no-win-condition' || 
          layout.winCondition === 'total-value-threshold' ||
          layout.winCondition === 'find-one') {
        return {
          emoji: prize.emoji,
          name: prize.name,
          value: prize.value,
        };
      }
      // For find-one-dynamic, show full info for winning symbol area, emoji only for others
      if (layout.winCondition === 'find-one-dynamic') {
        const areaId = layout.scratchAreas[areaIndex].id;
        if (areaId === layout.winningSymbolAreaId) {
          // Winning symbol area shows full prize info
          return {
            emoji: prize.emoji,
            name: prize.name,
            value: prize.value,
          };
        }
        // Other areas just show emoji for matching
        return {
          emoji: prize.emoji,
          name: '',
          value: '',
        };
      }
      // For matching games, just show emoji to keep it clean
      return {
        emoji: prize.emoji,
        name: '',
        value: '',
      };
    
    // Legacy reveal mechanics (deprecated)
    case 'reveal-all':
      // Show same prize in all areas
      return {
        emoji: prize.emoji,
        name: prize.name,
        value: prize.value,
      };
    
    case 'reveal-one':
      // Only show prize in first/main area
      return {
        emoji: prize.emoji,
        name: prize.name,
        value: prize.value,
      };
    
    case 'progressive':
      // Show different parts in different areas
      if (areaIndex === 0) {
        return { emoji: prize.emoji, name: '', value: '' };
      } else if (areaIndex === 1) {
        return { emoji: prize.emoji, name: prize.name, value: '' };
      } else {
        return { emoji: prize.emoji, name: prize.name, value: prize.value };
      }
    
    case 'match-three':
    case 'match-two':
      // Show emoji in each area (could be different for non-winning tickets)
      return {
        emoji: prize.emoji,
        name: '',
        value: '',
      };
    
    default:
      return {
        emoji: prize.emoji,
        name: prize.name,
        value: prize.value,
      };
  }
}

/**
 * Validate betting configuration for a ticket layout.
 * Returns an array of validation error messages.
 * 
 * @param bettingConfig - Betting configuration to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateBettingConfig(bettingConfig?: BettingConfig): string[] {
  const errors: string[] = [];
  
  if (!bettingConfig) {
    return errors; // No betting config is valid (betting is optional)
  }
  
  if (!bettingConfig.enabled) {
    return errors; // Disabled betting config doesn't need validation
  }
  
  // Check that betOptions array exists and has exactly 3 options
  if (!bettingConfig.betOptions || bettingConfig.betOptions.length !== 3) {
    errors.push('ERROR: Betting config must have exactly 3 bet options when enabled.');
    return errors;
  }
  
  // Validate each bet option
  const orders = new Set<number>();
  for (const option of bettingConfig.betOptions) {
    if (option.betAmount <= 0) {
      errors.push(`ERROR: Bet amount must be positive (found: ${option.betAmount}).`);
    }
    if (option.minPrizeThreshold < 0) {
      errors.push(`ERROR: Min prize threshold must be non-negative (found: ${option.minPrizeThreshold}).`);
    }
    if (option.winMultiplier <= 0) {
      errors.push(`ERROR: Win multiplier must be positive (found: ${option.winMultiplier}).`);
    }
    if (option.order < 1 || option.order > 3) {
      errors.push(`ERROR: Bet option order must be 1, 2, or 3 (found: ${option.order}).`);
    }
    if (orders.has(option.order)) {
      errors.push(`ERROR: Duplicate bet option order: ${option.order}.`);
    }
    orders.add(option.order);
  }
  
  // Check that all orders 1, 2, 3 are present
  if (!orders.has(1) || !orders.has(2) || !orders.has(3)) {
    errors.push('ERROR: Bet options must have orders 1, 2, and 3.');
  }
  
  return errors;
}

/**
 * Calculate the final prize value after applying a bet bonus.
 * 
 * @param baseValue - The base prize value before betting bonus
 * @param betOption - The bet option that was selected
 * @param isWinner - Whether the ticket is a winning ticket
 * @returns The final value after applying bet effects
 */
export function calculateBettingBonus(
  baseValue: number,
  betOption: BetOption,
  isWinner: boolean
): { finalValue: number; bonusApplied: boolean; refundAmount: number } {
  // If not a winner
  if (!isWinner) {
    const refundAmount = betOption.isRefundable ? betOption.betAmount : 0;
    return {
      finalValue: refundAmount,
      bonusApplied: false,
      refundAmount,
    };
  }
  
  // Check if prize meets the minimum threshold for this bet
  const meetsThreshold = baseValue >= betOption.minPrizeThreshold;
  
  if (meetsThreshold) {
    // Apply multiplier to the prize value
    const finalValue = baseValue * betOption.winMultiplier;
    return {
      finalValue,
      bonusApplied: true,
      refundAmount: 0,
    };
  }
  
  // Winner but didn't meet threshold - return base value
  return {
    finalValue: baseValue,
    bonusApplied: false,
    refundAmount: 0,
  };
}

/**
 * Get bet options sorted by their display order.
 * 
 * @param bettingConfig - The betting configuration
 * @returns Array of bet options sorted by order (1, 2, 3)
 */
export function getSortedBetOptions(bettingConfig: BettingConfig): BetOption[] {
  return [...bettingConfig.betOptions].sort((a, b) => a.order - b.order);
}

