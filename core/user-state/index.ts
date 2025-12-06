/**
 * User State Module
 * 
 * This module provides a comprehensive system for tracking user state,
 * including progress, sessions, achievements, and analytics.
 * 
 * ## Usage
 * 
 * ```typescript
 * import {
 *   initializeUserState,
 *   getUserState,
 *   addGold,
 *   spendGold,
 *   purchaseTicket,
 *   checkAndUnlockAchievements,
 * } from './core/user-state';
 * 
 * // Initialize on app start
 * initializeUserState();
 * 
 * // Get current gold balance
 * const { currentGold } = getUserState();
 * 
 * // Add gold from a prize
 * addGold(100);
 * 
 * // Purchase a ticket
 * if (purchaseTicket(50)) {
 *   console.log('Ticket purchased!');
 * }
 * 
 * // Check for new achievements
 * const newAchievements = checkAndUnlockAchievements();
 * ```
 */

// Export types
export type {
  UserState,
  UserData,
  Achievement,
  Session,
  StateEffect,
  StateValueOperation,
  PrizeEffect,
  AnalyticsEvent,
  AnalyticsEventType,
  Hand,
  HandTicket,
  HandEffect,
  HandEffectTarget,
  HandEffectOperation,
  HandEffectCondition,
  HandTicketCalculation,
} from './types';

export {
  DEFAULT_USER_STATE,
  USER_DATA_VERSION,
  SESSION_TIMEOUT_MS,
  MAX_SESSION_HISTORY,
  MAX_HAND_SIZE,
  DEFAULT_SCRATCHER_ID,
} from './types';

// Export user state management
export {
  initializeUserState,
  getUserData,
  getUserState,
  updateState,
  applyStateEffect,
  addGold,
  spendGold,
  canAfford,
  purchaseTicket,
  useTicket,
  purchaseTicketForLayout,
  useTicketForLayout,
  getOwnedTicketsForLayout,
  hasTicketForLayout,
  subscribeToUserState,
  recordTicketScratched,
  unlockAchievement,
  getAchievements,
  isAchievementUnlocked,
  applyPrizeEffects,
  startSession,
  endSession,
  getCurrentSession,
  getSessionHistory,
  resetUserData,
  // Hand management
  getCurrentHand,
  hasHand,
  isHandFull,
  getHandSize,
  getHandTotalValue,
  getCalculatedHand,
  addTicketToHand,
  cashOutHand,
  clearHand,
  // Scratcher preference
  getSelectedScratcherId,
  setSelectedScratcherId,
} from './userState';

// Export storage utilities
export {
  loadUserData,
  saveUserData,
  clearUserData,
  setStorageAdapter,
  getStorageAdapter,
  type StorageAdapter,
} from './storage';

// Export analytics
export {
  logEvent,
  getEvents,
  getEventsByType,
  getEventsByTimeRange,
  addEventListener,
  clearEvents,
  getAnalyticsSummary,
} from './analytics';

// Export achievements
export {
  ACHIEVEMENTS,
  getAchievementDefinition,
  getAllAchievementDefinitions,
  checkAndUnlockAchievements,
  getAchievementProgress,
} from './achievements';
