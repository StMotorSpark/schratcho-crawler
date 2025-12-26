/**
 * Game Data Context
 * 
 * Provides centralized access to game data (tickets, scratchers, prizes, stores)
 * fetched from the backend API with automatic caching and offline support.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { TicketLayout } from '../../core/mechanics/ticketLayouts';
import type { Scratcher } from '../../core/mechanics/scratchers';
import type { Prize } from '../../core/mechanics/prizes';
import type { Store } from '../../core/mechanics/stores';
import { fetchAllGameData, checkHealth, ApiError } from '../utils/apiClient';

/**
 * Game data structure with indexed maps for easy lookup
 */
interface GameData {
  tickets: TicketLayout[];
  ticketsById: Record<string, TicketLayout>;
  scratchers: Scratcher[];
  scratchersById: Record<string, Scratcher>;
  prizes: Prize[];
  prizesById: Record<string, Prize>;
  stores: Store[];
  storesById: Record<string, Store>;
}

/**
 * Context state
 */
interface GameDataContextState {
  data: GameData | null;
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  isHealthy: boolean;
  refetch: () => Promise<void>;
}

const GameDataContext = createContext<GameDataContextState | undefined>(undefined);

// Cache keys for localStorage
const CACHE_KEY = 'schratcho-game-data';
const CACHE_TIMESTAMP_KEY = 'schratcho-game-data-timestamp';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Load cached data from localStorage
 */
function loadCachedData(): { data: GameData | null; timestamp: number | null } {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cachedData && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - timestamp < CACHE_TTL) {
        return {
          data: JSON.parse(cachedData),
          timestamp,
        };
      }
    }
  } catch (error) {
    console.error('Error loading cached data:', error);
  }
  
  return { data: null, timestamp: null };
}

/**
 * Save data to localStorage cache
 */
function saveCachedData(data: GameData): void {
  try {
    const timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving cached data:', error);
  }
}

/**
 * Provider component props
 */
interface GameDataProviderProps {
  children: ReactNode;
}

/**
 * Game Data Provider Component
 * 
 * Fetches game data from the API on mount and provides it to child components.
 * Implements caching with 24hr TTL and offline support.
 */
export function GameDataProvider({ children }: GameDataProviderProps) {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isHealthy, setIsHealthy] = useState(true);

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if backend is healthy
      const healthy = await checkHealth();
      setIsHealthy(healthy);
      
      if (!healthy) {
        // Backend not available, try to use cached data
        const { data: cachedData, timestamp } = loadCachedData();
        
        if (cachedData) {
          console.log('Backend unavailable, using cached data');
          setData(cachedData);
          setLastFetchTime(timestamp);
          setError('Backend unavailable. Using cached data.');
          setLoading(false);
          return;
        }
        
        throw new Error('Backend server is not available and no cached data exists.');
      }
      
      // Fetch fresh data from API
      const gameData = await fetchAllGameData();
      
      // Transform the data to match our expected structure with indexed maps
      const tickets = Array.isArray(gameData.tickets) ? gameData.tickets : [];
      const scratchers = Array.isArray(gameData.scratchers) ? gameData.scratchers : [];
      const prizes = Array.isArray(gameData.prizes) ? gameData.prizes : [];
      const stores = Array.isArray(gameData.stores) ? gameData.stores : [];
      
      const transformedData: GameData = {
        tickets,
        ticketsById: Object.fromEntries(tickets.map(t => [t.id, t])),
        scratchers,
        scratchersById: Object.fromEntries(scratchers.map(s => [s.id, s])),
        prizes,
        prizesById: Object.fromEntries(prizes.map(p => [p.id, p])),
        stores,
        storesById: Object.fromEntries(stores.map(s => [s.id, s])),
      };
      
      setData(transformedData);
      setLastFetchTime(Date.now());
      setIsHealthy(true);
      
      // Cache the data for offline use
      saveCachedData(transformedData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching game data:', err);
      
      // Try to use cached data as fallback
      const { data: cachedData, timestamp } = loadCachedData();
      
      if (cachedData) {
        console.log('Error fetching data, using cached data');
        setData(cachedData);
        setLastFetchTime(timestamp);
        setError(err instanceof ApiError ? err.message : 'Failed to fetch data. Using cached data.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to fetch game data and no cached data is available.');
      }
      
      setLoading(false);
    }
  }, []);

  /**
   * Fetch data on mount
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const contextValue: GameDataContextState = {
    data,
    loading,
    error,
    lastFetchTime,
    isHealthy,
    refetch: fetchData,
  };

  return (
    <GameDataContext.Provider value={contextValue}>
      {children}
    </GameDataContext.Provider>
  );
}

/**
 * Hook to access game data context
 */
export function useGameData() {
  const context = useContext(GameDataContext);
  
  if (context === undefined) {
    throw new Error('useGameData must be used within a GameDataProvider');
  }
  
  return context;
}
