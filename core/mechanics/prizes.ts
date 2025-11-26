import type { PrizeEffect, StateEffect } from '../user-state/types';

/**
 * Represents a prize that can be won from a scratch ticket.
 */
export interface Prize {
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
 * All available prizes with their effects.
 */
const prizes: Prize[] = [
  {
    name: 'Grand Prize',
    value: '1000 Gold',
    emoji: '🏆',
    effects: {
      stateEffects: [createGoldEffect(1000)],
      achievementId: 'jackpot',
    },
  },
  {
    name: 'Gold Coins',
    value: '500 Gold',
    emoji: '🪙',
    effects: {
      stateEffects: [createGoldEffect(500)],
      achievementId: 'big-winner',
    },
  },
  {
    name: 'Diamond',
    value: '100 Gold',
    emoji: '💎',
    effects: {
      stateEffects: [createGoldEffect(100)],
      achievementId: 'lucky-streak',
    },
  },
  {
    name: 'Treasure Chest',
    value: '250 Gold',
    emoji: '🎁',
    effects: {
      stateEffects: [createGoldEffect(250)],
    },
  },
  {
    name: 'Magic Potion',
    value: '50 Gold',
    emoji: '🧪',
    effects: {
      stateEffects: [createGoldEffect(50)],
    },
  },
  {
    name: 'Lucky Star',
    value: '150 Gold',
    emoji: '⭐',
    effects: {
      stateEffects: [createGoldEffect(150)],
    },
  },
  {
    name: 'Golden Key',
    value: 'Free Ticket',
    emoji: '🔑',
    effects: {
      stateEffects: [createTicketEffect(1)],
    },
  },
  {
    name: 'Fire Sword',
    value: '75 Gold',
    emoji: '⚔️',
    effects: {
      stateEffects: [createGoldEffect(75)],
    },
  },
  {
    name: 'Shield',
    value: '25 Gold',
    emoji: '🛡️',
    effects: {
      stateEffects: [createGoldEffect(25)],
    },
  },
  {
    name: 'Crown',
    value: '200 Gold',
    emoji: '👑',
    effects: {
      stateEffects: [createGoldEffect(200)],
    },
  },
];

/**
 * Get a random prize.
 */
export function getRandomPrize(): Prize {
  return prizes[Math.floor(Math.random() * prizes.length)];
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
