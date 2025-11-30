/**
 * User State Tracking Types
 * 
 * This module defines the core types for user state tracking,
 * including user progress, sessions, achievements, and analytics.
 */

/**
 * Default scratcher ID used when no selection has been made.
 */
export const DEFAULT_SCRATCHER_ID = 'coin';

/**
 * Represents the core user state values that are tracked and persisted.
 */
export interface UserState {
  /** Current gold balance */
  currentGold: number;
  /** Number of available tickets the user can use (deprecated, use ownedTickets) */
  availableTickets: number;
  /** Tickets owned by layout ID (layout-specific ticket tracking) */
  ownedTickets: Record<string, number>;
  /** IDs of scratchers the user has unlocked */
  unlockedScratchers: string[];
  /** IDs of ticket types the user has unlocked */
  unlockedTicketTypes: string[];
  /** Total tickets scratched */
  totalTicketsScratched: number;
  /** Total gold earned (lifetime) */
  totalGoldEarned: number;
  /** Total gold spent (lifetime) */
  totalGoldSpent: number;
  /** Highest single ticket win */
  highestWin: number;
  /** Currently selected scratcher ID (optional for backward compatibility) */
  selectedScratcherId?: string;
}

/**
 * Represents an achievement that can be unlocked.
 */
export interface Achievement {
  /** Unique identifier for this achievement */
  id: string;
  /** Display name */
  name: string;
  /** Description of how to unlock */
  description: string;
  /** Emoji icon for display */
  icon: string;
  /** Whether this achievement has been unlocked */
  unlocked: boolean;
  /** Timestamp when unlocked (if unlocked) */
  unlockedAt?: number;
}

/**
 * Represents a single user session.
 */
export interface Session {
  /** Unique session ID */
  id: string;
  /** Timestamp when session started */
  startTime: number;
  /** Timestamp when session ended (if ended) */
  endTime?: number;
  /** Number of tickets scratched during this session */
  ticketsScratched: number;
  /** Gold earned during this session */
  goldEarned: number;
  /** Gold spent during this session */
  goldSpent: number;
}

/**
 * Represents a ticket in a hand with its associated prize information.
 */
export interface HandTicket {
  /** Layout ID of the ticket */
  layoutId: string;
  /** Prize ID won from this ticket */
  prizeId: string;
  /** Gold value of the prize */
  goldValue: number;
  /** Timestamp when ticket was added to hand */
  addedAt: number;
}

/**
 * Represents a hand of tickets that can be cashed out together.
 * Players can collect up to 5 tickets in a hand for a combined payout.
 */
export interface Hand {
  /** Unique identifier for this hand */
  id: string;
  /** Tickets in the hand */
  tickets: HandTicket[];
  /** Timestamp when the hand was created */
  createdAt: number;
}

/**
 * Maximum number of tickets allowed in a hand.
 */
export const MAX_HAND_SIZE = 5;

/**
 * Represents the full persisted user data.
 */
export interface UserData {
  /** Version of the data schema for migrations */
  version: number;
  /** Core user state values */
  state: UserState;
  /** Map of achievement ID to achievement data */
  achievements: Record<string, Achievement>;
  /** Current session (if active) */
  currentSession: Session | null;
  /** Past sessions (limited history) */
  sessionHistory: Session[];
  /** Current hand of tickets (if any) */
  currentHand: Hand | null;
  /** Timestamp of last activity */
  lastActivityTime: number;
  /** Timestamp when user data was created */
  createdAt: number;
}

/**
 * Defines how a value should be applied to user state.
 */
export type StateValueOperation = 
  | 'add'      // Add to current value
  | 'subtract' // Subtract from current value
  | 'set'      // Set to specific value
  | 'multiply'; // Multiply current value

/**
 * Defines an effect that modifies user state.
 */
export interface StateEffect {
  /** The state field to modify */
  field: keyof UserState;
  /** The operation to perform */
  operation: StateValueOperation;
  /** The value to apply */
  value: number | string | string[];
}

/**
 * Prize effect that can be applied when a ticket is resolved.
 */
export interface PrizeEffect {
  /** State effects to apply */
  stateEffects?: StateEffect[];
  /** Achievement ID to unlock (if any) */
  achievementId?: string;
}

/**
 * Analytics event types that can be logged.
 */
export type AnalyticsEventType =
  | 'session_start'
  | 'session_end'
  | 'ticket_start'
  | 'ticket_complete'
  | 'ticket_win'
  | 'ticket_purchase'
  | 'achievement_unlock'
  | 'gold_earned'
  | 'gold_spent'
  | 'scratcher_unlocked'
  | 'ticket_type_unlocked'
  | 'ticket_added_to_hand'
  | 'hand_cashed_out'
  | 'hand_cleared';

/**
 * Represents an analytics event.
 */
export interface AnalyticsEvent {
  /** Type of event */
  type: AnalyticsEventType;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Additional event data */
  data?: Record<string, unknown>;
}

/**
 * Default initial user state values.
 */
export const DEFAULT_USER_STATE: UserState = {
  currentGold: 100, // Start with some gold
  availableTickets: 3, // Start with a few tickets (deprecated)
  ownedTickets: {}, // Start with no layout-specific tickets
  unlockedScratchers: [DEFAULT_SCRATCHER_ID], // Default scratcher
  unlockedTicketTypes: ['classic'], // Default ticket type
  totalTicketsScratched: 0,
  totalGoldEarned: 0,
  totalGoldSpent: 0,
  highestWin: 0,
  selectedScratcherId: DEFAULT_SCRATCHER_ID, // Default selected scratcher
};

/**
 * Current data schema version for migrations.
 */
export const USER_DATA_VERSION = 1;

/**
 * Session timeout in milliseconds (30 minutes).
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Maximum number of sessions to keep in history.
 */
export const MAX_SESSION_HISTORY = 50;
