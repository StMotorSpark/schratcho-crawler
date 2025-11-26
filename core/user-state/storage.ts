/**
 * Storage Adapter Module
 * 
 * Provides a consistent interface for data persistence that works
 * across web (localStorage) and can be extended for React Native.
 */

import type { UserData } from './types';

/**
 * Storage key used for user data.
 */
const STORAGE_KEY = 'schratcho_crawler_user_data';

/**
 * Interface for storage adapters to implement.
 */
export interface StorageAdapter {
  load(): UserData | null;
  save(data: UserData): boolean;
  clear(): void;
}

/**
 * Check if we're in a browser environment with localStorage available.
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Web storage adapter using localStorage.
 */
export const webStorageAdapter: StorageAdapter = {
  load(): UserData | null {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, user data will not persist');
      return null;
    }

    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as UserData;
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
      return null;
    }
  },

  save(data: UserData): boolean {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, user data will not persist');
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save user data to localStorage:', error);
      return false;
    }
  },

  clear(): void {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear user data from localStorage:', error);
    }
  },
};

/**
 * Current storage adapter in use.
 * Can be swapped out for different platforms (e.g., React Native).
 */
let currentAdapter: StorageAdapter = webStorageAdapter;

/**
 * Set a custom storage adapter (useful for React Native or testing).
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  currentAdapter = adapter;
}

/**
 * Get the current storage adapter.
 */
export function getStorageAdapter(): StorageAdapter {
  return currentAdapter;
}

/**
 * Load user data from storage.
 */
export function loadUserData(): UserData | null {
  return currentAdapter.load();
}

/**
 * Save user data to storage.
 */
export function saveUserData(data: UserData): boolean {
  return currentAdapter.save(data);
}

/**
 * Clear all user data from storage.
 */
export function clearUserData(): void {
  currentAdapter.clear();
}
