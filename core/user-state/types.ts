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
  /** Active inventory tab selection (Core, Hand, Crawl) */
  activeInventoryTab?: string;
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
 * Target for hand effect operations.
 * - 'prior': Previous ticket in the hand
 * - 'next': Next ticket in the hand
 * - 'hand': Entire hand value
 * - 'self': The ticket with this effect
 */
export type HandEffectTarget = 'prior' | 'next' | 'hand' | 'self';

/**
 * Type of hand effect operation.
 * - 'multiply': Multiply target value by amount
 * - 'add': Add amount to target value
 * - 'subtract': Subtract amount from target value
 * - 'set': Set target value to amount
 * - 'diff': Calculate difference between prior and next, apply conditional logic
 */
export type HandEffectOperation = 'multiply' | 'add' | 'subtract' | 'set' | 'diff';

/**
 * Conditional operation for diff effects.
 * Used when comparing prior and next ticket values.
 */
export interface HandEffectCondition {
  /** Comparison type: 'greater' if prior > next, 'less' if prior < next, 'equal' if equal */
  type: 'greater' | 'less' | 'equal';
  /** Target to apply effect to when condition is met */
  target: HandEffectTarget;
  /** Operation to perform */
  operation: HandEffectOperation;
  /** Amount to use in operation */
  amount: number;
}

/**
 * Defines an effect that modifies hand calculations.
 * Hand effects change how the total hand value is calculated,
 * rather than directly adding gold to the hand.
 */
export interface HandEffect {
  /** Type of operation to perform */
  operation: HandEffectOperation;
  /** Target of the effect (what to modify) */
  target: HandEffectTarget;
  /** Amount/multiplier to use in operation */
  amount: number;
  /** Conditional logic for diff operations */
  conditions?: HandEffectCondition[];
}

/**
 * Calculation state for a hand ticket showing the effect result.
 */
export interface HandTicketCalculation {
  /** Whether this calculation has been completed */
  complete: boolean;
  /** The effect that was applied (if any) */
  appliedEffect?: HandEffect;
  /** Current calculated value contribution */
  calculatedValue: number;
  /** Any notes about the calculation (e.g., "Prior > Next", "Missing next ticket") */
  notes?: string;
}

/**
 * Represents a ticket in a hand with its associated prize information.
 */
export interface HandTicket {
  /** Layout ID of the ticket */
  layoutId: string;
  /** Prize ID won from this ticket */
  prizeId: string;
  /** Gold value of the prize (base value before hand effects) */
  goldValue: number;
  /** Timestamp when ticket was added to hand */
  addedAt: number;
  /** Hand effect from the prize (if any) - modifies hand calculations */
  handEffect?: HandEffect;
  /** Calculation state for this ticket */
  calculation?: HandTicketCalculation;
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
  /** Hand effect to apply (modifies hand calculations instead of direct gold) */
  handEffect?: HandEffect;
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
  activeInventoryTab: 'Core', // Default to Core tab
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
