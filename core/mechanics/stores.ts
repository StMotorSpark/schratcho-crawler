/**
 * Store Configuration System
 * 
 * Defines the multi-store concept where different stores offer different
 * selections of scratch-off tickets. Stores can be locked and require
 * a certain amount of total gold to unlock.
 */

import type { TicketLayout } from './ticketLayouts';
import { TICKET_LAYOUTS, getTicketGoldCost } from './ticketLayouts';

/**
 * Store configuration defining available tickets and unlock requirements
 */
export interface Store {
  /** Unique identifier for the store */
  id: string;
  /** Display name of the store */
  name: string;
  /** Description of the store's theme or offerings */
  description: string;
  /** Total gold amount required to unlock this store (0 = unlocked by default) */
  unlockRequirement: number;
  /** IDs of ticket layouts available in this store */
  ticketIds: string[];
  /** Emoji icon for the store */
  icon: string;
}

/**
 * Get price range for a store's tickets
 */
export function getStorePriceRange(store: Store): { min: number; max: number } {
  const prices = store.ticketIds
    .map(id => TICKET_LAYOUTS[id])
    .filter(Boolean)
    .map(layout => getTicketGoldCost(layout));
  
  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

/**
 * Get display text for price range
 */
export function getPriceRangeText(store: Store): string {
  const { min, max } = getStorePriceRange(store);
  
  if (min === max) {
    return `${min} gold`;
  }
  
  return `${min}-${max} gold`;
}

/**
 * Default stores configuration
 * 
 * Stores are organized by the cost/price range of the tickets they offer, from affordable starter tickets to high-stakes premium tickets.
 */
export const DEFAULT_STORES: Store[] = [
  {
    id: 'starter-market',
    name: 'Starter Market',
    description: 'Affordable tickets perfect for beginners',
    unlockRequirement: 0, // Unlocked by default
    ticketIds: ['classic', 'single'], // 5 gold tickets
    icon: '🏪',
  },
  {
    id: 'main-bazaar',
    name: 'Main Bazaar',
    description: 'Mid-range tickets with better odds',
    unlockRequirement: 100, // Unlocked at 100 total gold
    ticketIds: ['grid', 'goblin-gold'], // 10 gold tickets
    icon: '🎪',
  },
  {
    id: 'premium-parlor',
    name: 'Premium Parlor',
    description: 'High-stakes tickets for experienced players',
    unlockRequirement: 500, // Unlocked at 500 total gold
    ticketIds: ['test-two-column', 'test-hand', 'test-dynamic-symbol', 'betting-example'], // Special/advanced tickets
    icon: '🏛️',
  },
];

/**
 * Get a store by ID
 */
export function getStoreById(storeId: string): Store | undefined {
  return DEFAULT_STORES.find(store => store.id === storeId);
}

/**
 * Get all tickets for a store
 */
export function getStoreTickets(storeId: string): TicketLayout[] {
  const store = getStoreById(storeId);
  if (!store) {
    return [];
  }
  
  return store.ticketIds
    .map(id => TICKET_LAYOUTS[id])
    .filter(Boolean);
}

/**
 * Check if a store is unlocked based on total gold earned
 */
export function isStoreUnlocked(store: Store, totalGoldEarned: number): boolean {
  return totalGoldEarned >= store.unlockRequirement;
}

/**
 * Get all unlocked stores based on total gold earned
 */
export function getUnlockedStores(totalGoldEarned: number): Store[] {
  return DEFAULT_STORES.filter(store => isStoreUnlocked(store, totalGoldEarned));
}

/**
 * Get all locked stores based on total gold earned
 */
export function getLockedStores(totalGoldEarned: number): Store[] {
  return DEFAULT_STORES.filter(store => !isStoreUnlocked(store, totalGoldEarned));
}
