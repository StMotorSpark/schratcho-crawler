/**
 * User State Manager Module
 * 
 * Core module for managing user state including gold, tickets,
 * achievements, and sessions with automatic persistence.
 */

import type {
  UserData,
  UserState,
  Achievement,
  Session,
  StateEffect,
  PrizeEffect,
  Hand,
  HandTicket,
} from './types';
import {
  DEFAULT_USER_STATE,
  USER_DATA_VERSION,
  SESSION_TIMEOUT_MS,
  MAX_SESSION_HISTORY,
  MAX_HAND_SIZE,
  DEFAULT_SCRATCHER_ID,
} from './types';
import { loadUserData, saveUserData, clearUserData } from './storage';
import { logEvent } from './analytics';
import { calculateHandValue } from './handCalculations';

/**
 * Generate a unique ID for sessions.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create initial user data with defaults.
 */
function createInitialUserData(): UserData {
  const now = Date.now();
  return {
    version: USER_DATA_VERSION,
    state: { ...DEFAULT_USER_STATE },
    achievements: {},
    currentSession: null,
    sessionHistory: [],
    currentHand: null,
    lastActivityTime: now,
    createdAt: now,
  };
}

/**
 * The in-memory user data cache.
 */
let userData: UserData | null = null;

/**
 * Subscription listeners for state changes.
 */
type StateListener = (state: UserState) => void;
const stateListeners: Set<StateListener> = new Set();

/**
 * Subscribe to user state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToUserState(listener: StateListener): () => void {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

/**
 * Notify all listeners of state changes.
 */
function notifyStateChange(): void {
  if (userData) {
    const state = { ...userData.state };
    stateListeners.forEach((listener) => listener(state));
  }
}

/**
 * Ensures userData is initialized and returns it.
 * Throws if initialization fails (should never happen in normal flow).
 */
function ensureInitialized(): UserData {
  if (!userData) {
    initializeUserState();
  }
  if (!userData) {
    throw new Error('Failed to initialize user data');
  }
  return userData;
}

/**
 * Initialize the user state manager.
 * Loads existing data or creates new data if none exists.
 * Also handles session management based on inactivity.
 */
export function initializeUserState(): UserData {
  // Load existing data or create new
  const loadedData = loadUserData();
  const now = Date.now();

  if (loadedData) {
    userData = loadedData;

    // Check if current session should be ended due to timeout
    if (userData.currentSession) {
      const timeSinceLastActivity = now - userData.lastActivityTime;
      if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
        // End the previous session due to timeout
        endSession();
      }
    }
  } else {
    userData = createInitialUserData();
  }

  // Start a new session if we don't have one
  if (!userData.currentSession) {
    startSession();
  }

  // Update last activity time
  userData.lastActivityTime = now;
  persist();

  return userData;
}

/**
 * Get the current user data.
 * Initializes if not already initialized.
 */
export function getUserData(): UserData {
  if (!userData) {
    return initializeUserState();
  }
  updateActivity();
  return userData;
}

/**
 * Get the current user state values.
 */
export function getUserState(): UserState {
  return getUserData().state;
}

/**
 * Update the last activity timestamp.
 */
function updateActivity(): void {
  if (userData) {
    userData.lastActivityTime = Date.now();
  }
}

/**
 * Persist current data to storage.
 */
function persist(): void {
  if (userData) {
    saveUserData(userData);
    notifyStateChange();
  }
}

/**
 * Start a new session.
 */
export function startSession(): void {
  if (!userData) {
    initializeUserState();
    return;
  }

  const now = Date.now();
  userData.currentSession = {
    id: generateId(),
    startTime: now,
    ticketsScratched: 0,
    goldEarned: 0,
    goldSpent: 0,
  };

  logEvent('session_start', { sessionId: userData.currentSession.id });
  persist();
}

/**
 * End the current session.
 */
export function endSession(): void {
  if (!userData || !userData.currentSession) {
    return;
  }

  const session = userData.currentSession;
  session.endTime = Date.now();

  // Log session end
  logEvent('session_end', {
    sessionId: session.id,
    duration: session.endTime - session.startTime,
    ticketsScratched: session.ticketsScratched,
    goldEarned: session.goldEarned,
    goldSpent: session.goldSpent,
  });

  // Add to session history
  userData.sessionHistory.unshift(session);

  // Trim history to max size
  if (userData.sessionHistory.length > MAX_SESSION_HISTORY) {
    userData.sessionHistory = userData.sessionHistory.slice(0, MAX_SESSION_HISTORY);
  }

  userData.currentSession = null;
  persist();
}

/**
 * Update a specific field in user state.
 */
export function updateState(
  field: keyof UserState,
  value: number | string | string[]
): void {
  const data = ensureInitialized();
  (data.state[field] as typeof value) = value;
  updateActivity();
  persist();
}

/**
 * Apply a state effect to user state.
 */
export function applyStateEffect(effect: StateEffect): void {
  const data = ensureInitialized();
  const currentValue = data.state[effect.field];

  switch (effect.operation) {
    case 'add':
      if (typeof currentValue === 'number' && typeof effect.value === 'number') {
        (data.state[effect.field] as number) = currentValue + effect.value;
      } else if (Array.isArray(currentValue) && typeof effect.value === 'string') {
        if (!currentValue.includes(effect.value)) {
          (data.state[effect.field] as string[]) = [...currentValue, effect.value];
        }
      }
      break;

    case 'subtract':
      if (typeof currentValue === 'number' && typeof effect.value === 'number') {
        (data.state[effect.field] as number) = Math.max(0, currentValue - effect.value);
      }
      break;

    case 'set':
      (data.state[effect.field] as typeof effect.value) = effect.value;
      break;

    case 'multiply':
      if (typeof currentValue === 'number' && typeof effect.value === 'number') {
        (data.state[effect.field] as number) = currentValue * effect.value;
      }
      break;
  }

  updateActivity();
  persist();
}

/**
 * Add gold to the user's balance.
 * Rounds up to ensure whole numbers.
 */
export function addGold(amount: number): void {
  const data = ensureInitialized();
  
  // Round up to whole number to avoid fractional gold
  const roundedAmount = Math.ceil(Math.max(0, amount));

  data.state.currentGold += roundedAmount;
  data.state.totalGoldEarned += roundedAmount;

  // Update highest win if applicable
  if (roundedAmount > data.state.highestWin) {
    data.state.highestWin = roundedAmount;
  }

  // Track in current session
  if (data.currentSession) {
    data.currentSession.goldEarned += roundedAmount;
  }

  logEvent('gold_earned', { amount: roundedAmount });
  updateActivity();
  persist();
}

/**
 * Spend gold from the user's balance.
 * Returns true if successful, false if insufficient funds.
 */
export function spendGold(amount: number): boolean {
  const data = ensureInitialized();

  if (data.state.currentGold < amount) {
    return false;
  }

  data.state.currentGold -= amount;
  data.state.totalGoldSpent += amount;

  // Track in current session
  if (data.currentSession) {
    data.currentSession.goldSpent += amount;
  }

  logEvent('gold_spent', { amount });
  updateActivity();
  persist();
  return true;
}

/**
 * Record that a ticket was scratched.
 */
export function recordTicketScratched(): void {
  const data = ensureInitialized();

  data.state.totalTicketsScratched++;

  if (data.currentSession) {
    data.currentSession.ticketsScratched++;
  }

  updateActivity();
  persist();
}

/**
 * Unlock an achievement.
 */
export function unlockAchievement(achievement: Achievement): boolean {
  const data = ensureInitialized();

  // Check if already unlocked
  if (data.achievements[achievement.id]?.unlocked) {
    return false;
  }

  data.achievements[achievement.id] = {
    ...achievement,
    unlocked: true,
    unlockedAt: Date.now(),
  };

  logEvent('achievement_unlock', { achievementId: achievement.id });
  updateActivity();
  persist();
  return true;
}

/**
 * Get all achievements.
 */
export function getAchievements(): Record<string, Achievement> {
  return getUserData().achievements;
}

/**
 * Check if an achievement is unlocked.
 */
export function isAchievementUnlocked(achievementId: string): boolean {
  const data = getUserData();
  return data.achievements[achievementId]?.unlocked ?? false;
}

/**
 * Apply prize effects to user state.
 */
export function applyPrizeEffects(prizeEffect: PrizeEffect): void {
  if (!prizeEffect) return;

  // Apply state effects
  if (prizeEffect.stateEffects) {
    for (const effect of prizeEffect.stateEffects) {
      applyStateEffect(effect);
    }
  }

  // Note: Achievement unlocking would need the full achievement definition
  // This is a simplified approach - in practice, achievements would be defined elsewhere
}

/**
 * Get session history.
 */
export function getSessionHistory(): Session[] {
  return getUserData().sessionHistory;
}

/**
 * Get the current session.
 */
export function getCurrentSession(): Session | null {
  return getUserData().currentSession;
}

/**
 * Reset all user data (for testing or user request).
 */
export function resetUserData(): void {
  clearUserData();
  userData = createInitialUserData();
  startSession();
  persist();
}

/**
 * Check if the user can afford a specific amount.
 */
export function canAfford(amount: number): boolean {
  return getUserState().currentGold >= amount;
}

/**
 * Purchase a ticket (deducts gold, adds ticket).
 * Returns true if successful.
 * @deprecated Use purchaseTicketForLayout instead
 */
export function purchaseTicket(cost: number): boolean {
  if (!canAfford(cost)) {
    return false;
  }

  if (spendGold(cost)) {
    const data = ensureInitialized();
    data.state.availableTickets++;
    logEvent('ticket_purchase', { cost });
    persist();
    return true;
  }

  return false;
}

/**
 * Use a ticket (deducts from available tickets).
 * Returns true if successful.
 * @deprecated Use useTicketForLayout instead
 */
export function useTicket(): boolean {
  const data = ensureInitialized();

  if (data.state.availableTickets < 1) {
    return false;
  }

  data.state.availableTickets--;
  logEvent('ticket_start', {});
  updateActivity();
  persist();
  return true;
}

/**
 * Ensure ownedTickets is initialized on user state.
 */
function ensureOwnedTicketsInitialized(data: UserData): void {
  if (!data.state.ownedTickets) {
    data.state.ownedTickets = {};
  }
}

/**
 * Get the number of tickets owned for a specific layout.
 */
export function getOwnedTicketsForLayout(layoutId: string): number {
  const data = ensureInitialized();
  ensureOwnedTicketsInitialized(data);
  return data.state.ownedTickets[layoutId] ?? 0;
}

/**
 * Purchase a ticket for a specific layout (deducts gold, adds ticket to layout).
 * Returns true if successful.
 */
export function purchaseTicketForLayout(layoutId: string, cost: number): boolean {
  if (!canAfford(cost)) {
    return false;
  }

  if (spendGold(cost)) {
    const data = ensureInitialized();
    ensureOwnedTicketsInitialized(data);
    data.state.ownedTickets[layoutId] = (data.state.ownedTickets[layoutId] ?? 0) + 1;
    logEvent('ticket_purchase', { layoutId, cost });
    persist();
    return true;
  }

  return false;
}

/**
 * Use a ticket for a specific layout (deducts from owned tickets).
 * Returns true if successful.
 */
export function useTicketForLayout(layoutId: string): boolean {
  const data = ensureInitialized();
  ensureOwnedTicketsInitialized(data);

  const ownedCount = data.state.ownedTickets[layoutId] ?? 0;
  if (ownedCount < 1) {
    return false;
  }

  data.state.ownedTickets[layoutId] = ownedCount - 1;
  logEvent('ticket_start', { layoutId });
  updateActivity();
  persist();
  return true;
}

/**
 * Check if the user has any tickets for a specific layout.
 */
export function hasTicketForLayout(layoutId: string): boolean {
  return getOwnedTicketsForLayout(layoutId) > 0;
}

// ==========================================
// Hand Management Functions
// ==========================================

/**
 * Get the current hand.
 * Returns null if no hand exists.
 */
export function getCurrentHand(): Hand | null {
  return getUserData().currentHand;
}

/**
 * Check if the user currently has a hand.
 */
export function hasHand(): boolean {
  return getCurrentHand() !== null;
}

/**
 * Check if the current hand is full (has MAX_HAND_SIZE tickets).
 */
export function isHandFull(): boolean {
  const hand = getCurrentHand();
  return hand !== null && hand.tickets.length >= MAX_HAND_SIZE;
}

/**
 * Get the number of tickets in the current hand.
 */
export function getHandSize(): number {
  const hand = getCurrentHand();
  return hand?.tickets.length ?? 0;
}

/**
 * Calculate the total gold value of all tickets in the current hand.
 * Takes into account hand effects that modify the calculation.
 */
export function getHandTotalValue(): number {
  const hand = getCurrentHand();
  if (!hand) return 0;
  const { totalValue } = calculateHandValue(hand.tickets);
  return totalValue;
}

/**
 * Get the calculated hand with all effects applied.
 * Returns the hand with updated calculation states for each ticket.
 */
export function getCalculatedHand(): Hand | null {
  const hand = getCurrentHand();
  if (!hand) return null;
  
  const { calculatedTickets } = calculateHandValue(hand.tickets);
  
  return {
    ...hand,
    tickets: calculatedTickets,
  };
}

/**
 * Create a new hand or add a ticket to the existing hand.
 * Returns true if successful, false if hand is full or ticket couldn't be added.
 */
export function addTicketToHand(ticket: HandTicket): boolean {
  const data = ensureInitialized();
  
  // Create a new hand if none exists
  if (!data.currentHand) {
    data.currentHand = {
      id: generateId(),
      tickets: [],
      createdAt: Date.now(),
    };
  }
  
  // Check if hand is full
  if (data.currentHand.tickets.length >= MAX_HAND_SIZE) {
    return false;
  }
  
  // Add ticket to hand
  data.currentHand.tickets.push(ticket);
  
  logEvent('ticket_added_to_hand', {
    handId: data.currentHand.id,
    layoutId: ticket.layoutId,
    prizeId: ticket.prizeId,
    goldValue: ticket.goldValue,
    handSize: data.currentHand.tickets.length,
  });
  
  updateActivity();
  persist();
  return true;
}

/**
 * Cash out the current hand.
 * Adds the total gold value to the user's balance and clears the hand.
 * Returns the total gold value cashed out, or 0 if no hand exists.
 */
export function cashOutHand(): number {
  const data = ensureInitialized();
  
  if (!data.currentHand || data.currentHand.tickets.length === 0) {
    return 0;
  }
  
  // Calculate total value including hand effects
  const { totalValue } = calculateHandValue(data.currentHand.tickets);
  
  const handId = data.currentHand.id;
  const ticketCount = data.currentHand.tickets.length;
  
  // Add gold to user's balance using addGold (handles rounding automatically)
  if (totalValue > 0) {
    addGold(totalValue);
  }
  
  // Clear the hand
  data.currentHand = null;
  
  logEvent('hand_cashed_out', {
    handId,
    totalValue,
    ticketCount,
  });
  
  updateActivity();
  persist();
  return totalValue;
}

/**
 * Clear the current hand without cashing out (discard hand).
 * Returns the tickets that were in the hand (for potential undo functionality).
 */
export function clearHand(): HandTicket[] {
  const data = ensureInitialized();
  
  if (!data.currentHand) {
    return [];
  }
  
  const tickets = [...data.currentHand.tickets];
  const handId = data.currentHand.id;
  
  data.currentHand = null;
  
  logEvent('hand_cleared', {
    handId,
    ticketCount: tickets.length,
  });
  
  updateActivity();
  persist();
  return tickets;
}

// ==========================================
// Scratcher Preference Functions
// ==========================================

/**
 * Get the currently selected scratcher ID.
 * Returns the persisted preference or the default scratcher if not set.
 */
export function getSelectedScratcherId(): string {
  const data = ensureInitialized();
  return data.state.selectedScratcherId ?? DEFAULT_SCRATCHER_ID;
}

/**
 * Set the selected scratcher ID.
 * Persists the selection for future sessions.
 */
export function setSelectedScratcherId(scratcherId: string): void {
  const data = ensureInitialized();
  data.state.selectedScratcherId = scratcherId;
  updateActivity();
  persist();
}
