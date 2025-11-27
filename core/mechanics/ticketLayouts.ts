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
import { getRandomPrizeForLayout, getRandomPrize as getLegacyRandomPrize } from './prizes';
import { GOBLIN_GOLD_TICKET } from '../game-logic/tickets/basic-goblinGold/goblinGoldLayout';
import { TEST_TWO_COLUMN_TICKET } from '../game-logic/tickets/test-two-column';

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
 * Prize reveal mechanics determine how prizes are displayed across scratch areas
 */
export type RevealMechanic = 
  | 'reveal-all'      // Same prize revealed in all areas
  | 'reveal-one'      // Prize only revealed in one specific area
  | 'match-three'     // Win if all three areas match
  | 'match-two'       // Win if any two areas match
  | 'progressive';    // Each area reveals part of the prize info

/**
 * Win conditions determine what counts as a winning ticket
 */
export type WinCondition = 
  | 'reveal-all-areas'     // Must scratch all areas to win
  | 'reveal-any-area'      // Win when any single area is revealed
  | 'match-symbols'        // Win if symbols match according to reveal mechanic
  | 'progressive-reveal';  // Win when final area is revealed

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
  /** Gold cost to purchase this ticket type (default: 5, 0 = free) */
  goldCost?: number;
  /** 
   * Prize configurations for this ticket layout.
   * Defines which prizes are available and their relative weights.
   * If not specified, falls back to legacy global prize pool.
   */
  prizeConfigs?: PrizeConfig[];
}

/**
 * Default classic ticket layout (3 horizontal areas)
 * This replicates the current demo behavior
 */
export const CLASSIC_TICKET: TicketLayout = {
  id: 'classic',
  name: 'Classic Scratch Ticket',
  description: 'Three horizontal scratch areas - reveal all to win',
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
  revealMechanic: 'reveal-all',
  winCondition: 'reveal-all-areas',
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
 */
export const GRID_TICKET: TicketLayout = {
  id: 'grid',
  name: 'Grid Ticket',
  description: 'Nine areas in a 3x3 grid - match three to win',
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
  revealMechanic: 'match-three',
  winCondition: 'match-symbols',
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
 */
export const SINGLE_AREA_TICKET: TicketLayout = {
  id: 'single',
  name: 'Single Area Ticket',
  description: 'One large scratch area - reveal to win',
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
  revealMechanic: 'reveal-one',
  winCondition: 'reveal-any-area',
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
 * Evaluate if a ticket is a winner based on win condition
 */
export function evaluateWinCondition(
  layout: TicketLayout,
  revealedAreas: Set<string>,
  matchData?: { symbols: string[]; matches: number }
): boolean {
  switch (layout.winCondition) {
    case 'reveal-all-areas':
      // All areas must be revealed
      return revealedAreas.size === layout.scratchAreas.length;
    
    case 'reveal-any-area':
      // At least one area revealed
      return revealedAreas.size > 0;
    
    case 'match-symbols':
      // Check if symbols match according to reveal mechanic
      if (!matchData) return false;
      if (layout.revealMechanic === 'match-three') {
        return matchData.matches >= 3;
      }
      if (layout.revealMechanic === 'match-two') {
        return matchData.matches >= 2;
      }
      return false;
    
    case 'progressive-reveal':
      // Last area must be revealed
      const lastAreaId = layout.scratchAreas[layout.scratchAreas.length - 1].id;
      return revealedAreas.has(lastAreaId);
    
    default:
      return false;
  }
}

/**
 * Determine what prize information to show in each area based on reveal mechanic
 */
export function getPrizeDisplayForArea(
  layout: TicketLayout,
  areaIndex: number,
  prize: Prize
): { emoji: string; name: string; value: string } {
  switch (layout.revealMechanic) {
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
