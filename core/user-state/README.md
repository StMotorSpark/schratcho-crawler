# User State Tracking System

This module provides a comprehensive system for tracking user state, including progress, sessions, achievements, and analytics for the Schratcho Crawler game.

## Overview

The user state tracking system is designed to:

1. **Track User Progress** - Maintain user state values like gold, tickets, and achievements
2. **Manage Sessions** - Track user sessions with timeout logic (30 minutes of inactivity)
3. **Provide Analytics** - Log key user actions for analysis
4. **Support Personalization** - Enable personalized experiences based on tracked data
5. **Persist Data** - Store user data across browser sessions using localStorage

## Installation & Usage

### Basic Usage

```typescript
import {
  initializeUserState,
  getUserState,
  addGold,
  spendGold,
  purchaseTicket,
  checkAndUnlockAchievements,
} from './core/user-state';

// Initialize on app start (loads existing data or creates new)
initializeUserState();

// Get current user state
const { currentGold, totalTicketsScratched } = getUserState();

// Add gold from a prize win
addGold(100);

// Spend gold (returns false if insufficient funds)
if (spendGold(50)) {
  console.log('Gold spent successfully!');
}

// Purchase a ticket with gold
if (purchaseTicket(25)) {
  console.log('Ticket purchased!');
}

// Check for new achievements after actions
const newAchievements = checkAndUnlockAchievements();
if (newAchievements.length > 0) {
  console.log('Unlocked:', newAchievements);
}
```

## Core Concepts

### User State

The `UserState` interface defines the trackable user values:

```typescript
interface UserState {
  currentGold: number;           // Current gold balance
  availableTickets: number;      // Number of tickets available
  unlockedScratchers: string[];  // IDs of unlocked scratchers
  unlockedTicketTypes: string[]; // IDs of unlocked ticket types
  totalTicketsScratched: number; // Lifetime tickets scratched
  totalGoldEarned: number;       // Lifetime gold earned
  totalGoldSpent: number;        // Lifetime gold spent
  highestWin: number;            // Highest single ticket win
}
```

### Sessions

Sessions are automatically managed:

- A new session starts when the user opens the game
- Sessions end after 30 minutes of inactivity
- Session data includes tickets scratched, gold earned/spent during that session
- Up to 50 sessions are kept in history

```typescript
import { getCurrentSession, getSessionHistory, endSession } from './core/user-state';

// Get current session
const session = getCurrentSession();
console.log(`Session started: ${new Date(session.startTime)}`);
console.log(`Gold earned this session: ${session.goldEarned}`);

// Get session history
const history = getSessionHistory();
console.log(`Total sessions: ${history.length}`);

// Manually end a session (normally happens automatically)
endSession();
```

### Achievements

Achievements are predefined milestones that can be unlocked:

```typescript
import {
  checkAndUnlockAchievements,
  isAchievementUnlocked,
  getAchievementProgress,
  getAllAchievementDefinitions,
} from './core/user-state';

// Check if specific achievement is unlocked
if (isAchievementUnlocked('first-scratch')) {
  console.log('First scratch achievement unlocked!');
}

// Get progress towards an achievement (0-1)
const progress = getAchievementProgress('gold-hoarder');
console.log(`Progress: ${(progress * 100).toFixed(0)}%`);

// Get all achievement definitions
const achievements = getAllAchievementDefinitions();
achievements.forEach(a => {
  console.log(`${a.icon} ${a.name}: ${a.description}`);
});
```

#### Available Achievements

| ID | Name | Description | Requirement |
|---|---|---|---|
| `first-scratch` | First Scratch | Complete your first scratch ticket | 1 ticket |
| `gold-hoarder` | Gold Hoarder | Accumulate 1000 gold | 1000 gold balance |
| `lucky-streak` | Lucky Streak | Win 100 gold or more on a single ticket | 100+ gold win |
| `scratch-master` | Scratch Master | Complete 10 scratch tickets | 10 tickets |
| `scratch-legend` | Scratch Legend | Complete 100 scratch tickets | 100 tickets |
| `big-winner` | Big Winner | Win 500 gold or more on a single ticket | 500+ gold win |
| `jackpot` | Jackpot! | Win the grand prize (1000+ gold) | 1000+ gold win |
| `collector` | Collector | Unlock 3 different scratchers | 3 scratchers |
| `ticket-variety` | Ticket Variety | Unlock 3 different ticket types | 3 ticket types |

### Analytics

Basic analytics logging is included for tracking key user actions:

```typescript
import {
  logEvent,
  getEvents,
  getEventsByType,
  getAnalyticsSummary,
  addEventListener,
} from './core/user-state';

// Log a custom event
logEvent('ticket_complete', { prizeName: 'Grand Prize', goldValue: 1000 });

// Get all events
const events = getEvents();

// Get events of a specific type
const ticketEvents = getEventsByType('ticket_complete');

// Get summary statistics
const summary = getAnalyticsSummary();
console.log(`Total events: ${summary.totalEvents}`);
console.log(`Sessions: ${summary.sessionCount}`);
console.log(`Tickets scratched: ${summary.ticketCount}`);

// Listen for events in real-time
const removeListener = addEventListener((event) => {
  console.log(`Event: ${event.type}`, event.data);
});

// Remove listener when done
removeListener();
```

#### Event Types

| Event Type | Description | Data Fields |
|---|---|---|
| `session_start` | User started a new session | `sessionId` |
| `session_end` | Session ended | `sessionId`, `duration`, `ticketsScratched`, `goldEarned`, `goldSpent` |
| `ticket_start` | User started scratching a ticket | `layoutId`, `scratcherId` |
| `ticket_complete` | User completed a ticket | `layoutId`, `scratcherId`, `prizeValue`, `prizeName` |
| `gold_earned` | Gold was added | `amount` |
| `gold_spent` | Gold was spent | `amount` |
| `ticket_purchase` | User purchased a ticket | `cost` |
| `achievement_unlock` | Achievement was unlocked | `achievementId` |

### Prize Effects

Prizes can have effects that modify user state:

```typescript
import type { Prize, PrizeEffect, StateEffect } from './core/mechanics/prizes';
import { createGoldEffect, createTicketEffect } from './core/mechanics/prizes';

// Example prize with effects
const grandPrize: Prize = {
  name: 'Grand Prize',
  value: '1000 Gold',
  emoji: '🏆',
  effects: {
    stateEffects: [createGoldEffect(1000)],
    achievementId: 'jackpot',
  },
};

// State effects can be additive, subtractive, set, or multiply
const customEffect: StateEffect = {
  field: 'currentGold',
  operation: 'add',  // 'add' | 'subtract' | 'set' | 'multiply'
  value: 500,
};
```

## Storage

User data is persisted using localStorage. The storage adapter can be swapped for different platforms:

```typescript
import { setStorageAdapter, type StorageAdapter } from './core/user-state';

// Custom storage adapter (e.g., for React Native)
const customAdapter: StorageAdapter = {
  load: () => {
    // Load data from your storage
    return null;
  },
  save: (data) => {
    // Save data to your storage
    return true;
  },
  clear: () => {
    // Clear storage
  },
};

setStorageAdapter(customAdapter);
```

### Data Reset

Users can reset all their data:

```typescript
import { resetUserData } from './core/user-state';

// Reset all user data (starts fresh)
resetUserData();
```

## Architecture

```
core/user-state/
├── index.ts           # Public exports
├── types.ts           # Type definitions
├── userState.ts       # Core state management
├── storage.ts         # Storage adapter
├── analytics.ts       # Analytics logging
├── achievements.ts    # Achievement definitions and logic
└── README.md          # This documentation
```

## Future Enhancements

The system is designed to be extensible for future features:

1. **Backend Synchronization** - The storage adapter can be extended to sync with a backend API
2. **Advanced Analytics** - Events can be sent to analytics services
3. **New Achievements** - Additional achievements can be added by extending the `ACHIEVEMENTS` object
4. **New State Fields** - The `UserState` interface can be extended with new fields
5. **React Native Support** - A React Native storage adapter can be implemented

## Privacy Considerations

- All data is stored locally on the user's device
- No personally identifiable information is collected
- Analytics events are anonymous
- Users can reset all data at any time
