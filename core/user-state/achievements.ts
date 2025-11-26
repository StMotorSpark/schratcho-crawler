/**
 * Achievements Module
 * 
 * Defines the available achievements and provides utilities
 * for checking and unlocking achievements.
 */

import type { Achievement, UserState } from './types';
import { unlockAchievement, isAchievementUnlocked, getUserState } from './userState';

/**
 * Achievement definitions.
 */
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlocked' | 'unlockedAt'>> = {
  'first-scratch': {
    id: 'first-scratch',
    name: 'First Scratch',
    description: 'Complete your first scratch ticket',
    icon: '🎫',
  },
  'gold-hoarder': {
    id: 'gold-hoarder',
    name: 'Gold Hoarder',
    description: 'Accumulate 1000 gold',
    icon: '🪙',
  },
  'lucky-streak': {
    id: 'lucky-streak',
    name: 'Lucky Streak',
    description: 'Win 100 gold or more on a single ticket',
    icon: '⭐',
  },
  'scratch-master': {
    id: 'scratch-master',
    name: 'Scratch Master',
    description: 'Complete 10 scratch tickets',
    icon: '🏆',
  },
  'scratch-legend': {
    id: 'scratch-legend',
    name: 'Scratch Legend',
    description: 'Complete 100 scratch tickets',
    icon: '👑',
  },
  'big-winner': {
    id: 'big-winner',
    name: 'Big Winner',
    description: 'Win 500 gold or more on a single ticket',
    icon: '💎',
  },
  'jackpot': {
    id: 'jackpot',
    name: 'Jackpot!',
    description: 'Win the grand prize (1000+ gold)',
    icon: '🎰',
  },
  'collector': {
    id: 'collector',
    name: 'Collector',
    description: 'Unlock 3 different scratchers',
    icon: '🎨',
  },
  'ticket-variety': {
    id: 'ticket-variety',
    name: 'Ticket Variety',
    description: 'Unlock 3 different ticket types',
    icon: '🎟️',
  },
  'dedicated-player': {
    id: 'dedicated-player',
    name: 'Dedicated Player',
    description: 'Play in 10 different sessions',
    icon: '📅',
  },
};

/**
 * Get an achievement definition by ID.
 */
export function getAchievementDefinition(
  id: string
): Omit<Achievement, 'unlocked' | 'unlockedAt'> | undefined {
  return ACHIEVEMENTS[id];
}

/**
 * Get all achievement definitions.
 */
export function getAllAchievementDefinitions(): Omit<Achievement, 'unlocked' | 'unlockedAt'>[] {
  return Object.values(ACHIEVEMENTS);
}

/**
 * Check and unlock any achievements based on current user state.
 * Returns array of newly unlocked achievement IDs.
 */
export function checkAndUnlockAchievements(): string[] {
  const state = getUserState();
  const newlyUnlocked: string[] = [];

  // First Scratch
  if (!isAchievementUnlocked('first-scratch') && state.totalTicketsScratched >= 1) {
    if (unlockAchievement({ ...ACHIEVEMENTS['first-scratch'], unlocked: false })) {
      newlyUnlocked.push('first-scratch');
    }
  }

  // Gold Hoarder
  if (!isAchievementUnlocked('gold-hoarder') && state.currentGold >= 1000) {
    if (unlockAchievement({ ...ACHIEVEMENTS['gold-hoarder'], unlocked: false })) {
      newlyUnlocked.push('gold-hoarder');
    }
  }

  // Lucky Streak
  if (!isAchievementUnlocked('lucky-streak') && state.highestWin >= 100) {
    if (unlockAchievement({ ...ACHIEVEMENTS['lucky-streak'], unlocked: false })) {
      newlyUnlocked.push('lucky-streak');
    }
  }

  // Scratch Master
  if (!isAchievementUnlocked('scratch-master') && state.totalTicketsScratched >= 10) {
    if (unlockAchievement({ ...ACHIEVEMENTS['scratch-master'], unlocked: false })) {
      newlyUnlocked.push('scratch-master');
    }
  }

  // Scratch Legend
  if (!isAchievementUnlocked('scratch-legend') && state.totalTicketsScratched >= 100) {
    if (unlockAchievement({ ...ACHIEVEMENTS['scratch-legend'], unlocked: false })) {
      newlyUnlocked.push('scratch-legend');
    }
  }

  // Big Winner
  if (!isAchievementUnlocked('big-winner') && state.highestWin >= 500) {
    if (unlockAchievement({ ...ACHIEVEMENTS['big-winner'], unlocked: false })) {
      newlyUnlocked.push('big-winner');
    }
  }

  // Jackpot
  if (!isAchievementUnlocked('jackpot') && state.highestWin >= 1000) {
    if (unlockAchievement({ ...ACHIEVEMENTS['jackpot'], unlocked: false })) {
      newlyUnlocked.push('jackpot');
    }
  }

  // Collector
  if (!isAchievementUnlocked('collector') && state.unlockedScratchers.length >= 3) {
    if (unlockAchievement({ ...ACHIEVEMENTS['collector'], unlocked: false })) {
      newlyUnlocked.push('collector');
    }
  }

  // Ticket Variety
  if (!isAchievementUnlocked('ticket-variety') && state.unlockedTicketTypes.length >= 3) {
    if (unlockAchievement({ ...ACHIEVEMENTS['ticket-variety'], unlocked: false })) {
      newlyUnlocked.push('ticket-variety');
    }
  }

  return newlyUnlocked;
}

/**
 * Get progress towards an achievement.
 * Returns a value between 0 and 1.
 */
export function getAchievementProgress(achievementId: string): number {
  const state: UserState = getUserState();

  switch (achievementId) {
    case 'first-scratch':
      return Math.min(1, state.totalTicketsScratched);
    case 'gold-hoarder':
      return Math.min(1, state.currentGold / 1000);
    case 'lucky-streak':
      return Math.min(1, state.highestWin / 100);
    case 'scratch-master':
      return Math.min(1, state.totalTicketsScratched / 10);
    case 'scratch-legend':
      return Math.min(1, state.totalTicketsScratched / 100);
    case 'big-winner':
      return Math.min(1, state.highestWin / 500);
    case 'jackpot':
      return Math.min(1, state.highestWin / 1000);
    case 'collector':
      return Math.min(1, state.unlockedScratchers.length / 3);
    case 'ticket-variety':
      return Math.min(1, state.unlockedTicketTypes.length / 3);
    default:
      return 0;
  }
}
