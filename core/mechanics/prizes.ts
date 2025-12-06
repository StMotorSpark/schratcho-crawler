import type { PrizeEffect, StateEffect, HandEffect, HandEffectCondition } from '../user-state/types';
import {NO_PRIZE_PRIZE} from '../game-logic/prizes/no-prize';

/**
 * Represents a prize that can be won from a scratch ticket.
 */
export interface Prize {
  /** Unique identifier for this prize (used for prize association) */
  id: string;
  /** Display name of the prize */
  name: string;
  /** Display value of the prize (for UI) */
  value: string;
  /** Emoji icon for the prize */
  emoji: string;
  /** Optional effects to apply to user state when this prize is won */
  effects?: PrizeEffect;
}

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

/**
 * Helper to create a gold prize effect.
 */
export function createGoldEffect(amount: number): StateEffect {
  return {
    field: 'currentGold',
    operation: 'add',
    value: amount,
  };
}

/**
 * Helper to create a ticket prize effect.
 */
export function createTicketEffect(amount: number): StateEffect {
  return {
    field: 'availableTickets',
    operation: 'add',
    value: amount,
  };
}

/**
 * Helper to create a hand effect that adds gold to hand value.
 */
export function createHandAddGoldEffect(amount: number): HandEffect {
  return {
    operation: 'add',
    target: 'hand',
    amount,
  };
}

/**
 * Helper to create a hand effect that multiplies a target value.
 */
export function createHandMultiplyEffect(
  target: 'prior' | 'next' | 'hand' | 'self',
  multiplier: number
): HandEffect {
  return {
    operation: 'multiply',
    target,
    amount: multiplier,
  };
}

/**
 * Helper to create a hand effect with diff conditional logic.
 */
export function createHandDiffEffect(
  conditions: HandEffectCondition[]
): HandEffect {
  return {
    operation: 'diff',
    target: 'self', // diff doesn't use target directly
    amount: 0,
    conditions,
  };
}

/**
 * All available prizes with their effects.
 * Each prize has a unique ID for explicit association with ticket layouts.
 */
const prizes: Prize[] = [
  {
    id: 'grand-prize',
    name: 'Grand Prize',
    value: '1000 Gold',
    emoji: '🏆',
    effects: {
      stateEffects: [createGoldEffect(1000)],
      achievementId: 'jackpot',
    },
  },
  {
    id: 'gold-coins',
    name: 'Gold Coins',
    value: '500 Gold',
    emoji: '🪙',
    effects: {
      stateEffects: [createGoldEffect(500)],
      achievementId: 'big-winner',
    },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    value: '100 Gold',
    emoji: '💎',
    effects: {
      stateEffects: [createGoldEffect(100)],
      achievementId: 'lucky-streak',
    },
  },
  {
    id: 'treasure-chest',
    name: 'Treasure Chest',
    value: '250 Gold',
    emoji: '🎁',
    effects: {
      stateEffects: [createGoldEffect(250)],
    },
  },
  {
    id: 'magic-potion',
    name: 'Magic Potion',
    value: '50 Gold',
    emoji: '🧪',
    effects: {
      stateEffects: [createGoldEffect(50)],
    },
  },
  {
    id: 'lucky-star',
    name: 'Lucky Star',
    value: '150 Gold',
    emoji: '⭐',
    effects: {
      stateEffects: [createGoldEffect(150)],
    },
  },
  {
    id: 'golden-key',
    name: 'Golden Key',
    value: 'Free Ticket',
    emoji: '🔑',
    effects: {
      stateEffects: [createTicketEffect(1)],
    },
  },
  {
    id: 'fire-sword',
    name: 'Fire Sword',
    value: '75 Gold',
    emoji: '⚔️',
    effects: {
      stateEffects: [createGoldEffect(75)],
    },
  },
  {
    id: 'shield',
    name: 'Shield',
    value: '25 Gold',
    emoji: '🛡️',
    effects: {
      stateEffects: [createGoldEffect(25)],
    },
  },
  {
    id: 'crown',
    name: 'Crown',
    value: '200 Gold',
    emoji: '👑',
    effects: {
      stateEffects: [createGoldEffect(200)],
    },
  },
  // Hand effect prizes - these modify hand calculations instead of adding gold directly
  {
    id: 'hand-gold-boost',
    name: 'Gold Boost',
    value: '+100 to Hand',
    emoji: '💰',
    effects: {
      handEffect: createHandAddGoldEffect(100),
    },
  },
  {
    id: 'hand-prior-multiply',
    name: 'Prior Boost',
    value: '×1.5 Prior',
    emoji: '⚡',
    effects: {
      handEffect: createHandMultiplyEffect('prior', 1.5),
    },
  },
  {
    id: 'hand-diff-conditional',
    name: 'Risk & Reward',
    value: 'Diff Effect',
    emoji: '🎲',
    effects: {
      handEffect: createHandDiffEffect([
        {
          type: 'greater',
          target: 'next',
          operation: 'multiply',
          amount: 2,
        },
        {
          type: 'less',
          target: 'hand',
          operation: 'subtract',
          amount: 200,
        },
      ]),
    },
  },
  {
    id: 'hand-mega-multiplier',
    name: 'Mega Multiplier',
    value: '×10 Hand',
    emoji: '💎',
    effects: {
      handEffect: createHandMultiplyEffect('hand', 10),
    },
  },
  NO_PRIZE_PRIZE,
];

/**
 * Get a prize by its ID.
 * @param id - The prize ID to look up
 * @returns The prize if found, undefined otherwise
 */
export function getPrizeById(id: string): Prize | undefined {
  return prizes.find((p) => p.id === id);
}

/**
 * Get a random prize from the global pool (legacy behavior).
 * @deprecated Use getRandomPrizeForLayout for layout-specific prize selection.
 */
export function getRandomPrize(): Prize {
  return prizes[Math.floor(Math.random() * prizes.length)];
}

/**
 * Get a random prize based on a ticket layout's prize configuration.
 * Uses weighted random selection based on prize weights.
 * 
 * @param prizeConfigs - Array of prize configurations with weights
 * @returns A randomly selected prize based on weights
 * @throws Error if no valid prizes are configured or all prizes have zero weight
 * 
 * ## Weight System
 * - Weights are relative, so [1, 1, 1] gives equal probability
 * - Higher weights = higher chance of selection
 * - Weights of 0 or less are excluded and trigger console warnings
 * 
 * ## Example
 * ```typescript
 * const prizes = [
 *   { prizeId: 'grand-prize', weight: 1 },   // ~10%
 *   { prizeId: 'gold-coins', weight: 4 },    // ~40%
 *   { prizeId: 'diamond', weight: 5 },       // ~50%
 * ];
 * const prize = getRandomPrizeForLayout(prizes);
 * ```
 */
export function getRandomPrizeForLayout(prizeConfigs: PrizeConfig[]): Prize {
  // Validate prize configurations
  if (!prizeConfigs || prizeConfigs.length === 0) {
    throw new Error('No prize configurations provided for layout. Each ticket layout must have explicit prize associations.');
  }

  // Filter and validate prizes
  const validConfigs: Array<{ prize: Prize; weight: number }> = [];
  
  for (const config of prizeConfigs) {
    const prize = getPrizeById(config.prizeId);
    
    if (!prize) {
      console.warn(`Prize with ID "${config.prizeId}" not found. Skipping this prize configuration.`);
      continue;
    }
    
    if (config.weight <= 0) {
      console.warn(`Prize "${config.prizeId}" has non-positive weight (${config.weight}). Skipping this prize.`);
      continue;
    }
    
    validConfigs.push({ prize, weight: config.weight });
  }

  if (validConfigs.length === 0) {
    throw new Error('No valid prizes available for selection. Check that prize IDs exist and weights are positive.');
  }

  // Calculate total weight
  const totalWeight = validConfigs.reduce((sum, config) => sum + config.weight, 0);
  
  // Select prize based on weighted random
  let random = Math.random() * totalWeight;
  
  for (const config of validConfigs) {
    random -= config.weight;
    if (random <= 0) {
      return config.prize;
    }
  }
  
  // Fallback (should not reach here, but just in case due to floating point)
  return validConfigs[validConfigs.length - 1].prize;
}

/**
 * Validate prize configurations for a ticket layout.
 * Returns an array of warning/error messages.
 * 
 * @param prizeConfigs - Array of prize configurations to validate
 * @returns Array of validation messages (empty if all valid)
 */
export function validatePrizeConfigs(prizeConfigs: PrizeConfig[]): string[] {
  const messages: string[] = [];

  if (!prizeConfigs || prizeConfigs.length === 0) {
    messages.push('ERROR: No prize configurations provided. Ticket layouts require explicit prize associations.');
    return messages;
  }

  let hasValidPrize = false;

  for (const config of prizeConfigs) {
    const prize = getPrizeById(config.prizeId);
    
    if (!prize) {
      messages.push(`ERROR: Prize with ID "${config.prizeId}" does not exist.`);
      continue;
    }
    
    if (config.weight <= 0) {
      messages.push(`WARNING: Prize "${config.prizeId}" has non-positive weight (${config.weight}).`);
    } else {
      hasValidPrize = true;
    }
  }

  if (!hasValidPrize) {
    messages.push('ERROR: No valid prizes with positive weights configured.');
  }

  return messages;
}

/**
 * Get all available prizes.
 */
export function getAllPrizes(): Prize[] {
  return [...prizes];
}

/**
 * Calculate the gold value from a prize (if any).
 */
export function getPrizeGoldValue(prize: Prize): number {
  if (!prize.effects?.stateEffects) return 0;
  
  const goldEffect = prize.effects.stateEffects.find(
    (e) => e.field === 'currentGold' && e.operation === 'add'
  );
  
  return typeof goldEffect?.value === 'number' ? goldEffect.value : 0;
}
