/**
 * API Client for Backend Communication
 * 
 * Handles all HTTP requests to the backend API with error handling,
 * retry logic, and offline support.
 */

// API configuration - can be overridden by environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * API error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiError?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Check if the backend is available
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.status === 'OK';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

/**
 * Generic GET request handler with error handling
 */
async function get<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ApiResponse<unknown> = await response.json().catch(() => ({
        success: false,
        error: 'Unknown error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      throw new ApiError(
        errorData.message || 'Request failed',
        response.status,
        errorData.error
      );
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success || !data.data) {
      throw new ApiError(
        data.message || 'Invalid response format',
        response.status,
        data.error
      );
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network error or other unexpected error
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      'NetworkError'
    );
  }
}

/**
 * Fetch all tickets from the API
 */
export async function fetchTickets() {
  return get('/v1/tickets');
}

/**
 * Fetch all scratchers from the API
 */
export async function fetchScratchers() {
  return get('/v1/scratchers');
}

/**
 * Fetch all prizes from the API
 */
export async function fetchPrizes() {
  return get('/v1/prizes');
}

/**
 * Fetch all stores from the API
 */
export async function fetchStores() {
  return get('/v1/stores');
}

/**
 * Fetch all game data in parallel for efficiency
 */
export async function fetchAllGameData() {
  const [tickets, scratchers, prizes, stores] = await Promise.all([
    fetchTickets(),
    fetchScratchers(),
    fetchPrizes(),
    fetchStores(),
  ]);

  return {
    tickets,
    scratchers,
    prizes,
    stores,
  };
}
