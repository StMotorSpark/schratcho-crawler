# Core - Shared Game Logic

This directory contains all shared code that can be used by both the web and mobile versions of Schratcho Crawler.

## Structure

```
core/
├── mechanics/           # Platform-agnostic game mechanics
│   ├── prizes.ts       # Prize definitions and randomization
│   ├── ticketLayouts.ts # Ticket layout configuration system
│   ├── scratchers.ts   # Scratcher type definitions
│   ├── sounds.ts       # Sound effect management
│   └── capabilities.ts # Device/browser capability detection
├── game-logic/         # Game-specific logic (future)
└── README.md          # This file
```

## Purpose

The `/core` directory serves as a shared codebase that both web and mobile applications can import. This approach:

1. **Eliminates Code Duplication** - Write game logic once, use everywhere
2. **Ensures Consistency** - Both platforms behave identically
3. **Simplifies Maintenance** - Bug fixes and features apply to all platforms
4. **Enables Testing** - Test core logic independently of UI

## Mechanics (`/core/mechanics`)

Contains platform-agnostic implementations of game mechanics. All helper functions support dynamic data from the backend API while maintaining backward compatibility with hardcoded fallback data.

### Dynamic Data Support

All helper functions in the mechanics package now accept optional data parameters, enabling three modes of operation:

1. **Backend API Mode**: Pass data fetched from the backend API
2. **Cached Mode**: Pass data loaded from localStorage cache
3. **Fallback Mode**: Omit data parameter to use hardcoded defaults

This design ensures the game works seamlessly whether the backend is available, offline with cache, or completely offline.

**Example:**
```typescript
import { useGameData } from '@/contexts/GameDataContext';
import { getPrizeById } from '@/core/mechanics/prizes';

// In component
const { data: gameData } = useGameData();

// Works with backend data, cached data, or hardcoded fallback
const prize = getPrizeById('grand-prize', gameData?.prizes);
```

### `prizes.ts`
- Prize type definitions
- Prize randomization logic
- Prize display formatting
- All functions accept optional `prizesData` parameter

**Example Usage:**
```typescript
import { getRandomPrize, getPrizeById, type Prize } from '@/core/mechanics/prizes';

// Without backend data (uses hardcoded prizes)
const prize: Prize = getRandomPrize();

// With backend data
const apiPrizes = await fetchPrizes();
const prize2 = getRandomPrize(apiPrizes);
const specificPrize = getPrizeById('diamond', apiPrizes);

console.log(`You won: ${prize.emoji} ${prize.name} - ${prize.value}`);
```

### `ticketLayouts.ts`
- Ticket layout configuration system
- Scratch area positioning
- Win condition evaluation
- Prize reveal mechanics
- All functions accept optional `ticketsData` and `prizesData` parameters

**Example Usage:**
```typescript
import { getTicketLayout, generateAreaPrizes } from '@/core/mechanics/ticketLayouts';

// Without backend data (uses TICKET_LAYOUTS constant)
const layout = getTicketLayout('classic');

// With backend data
const apiTickets = await fetchTickets();
const apiPrizes = await fetchPrizes();
const layout2 = getTicketLayout('classic', apiTickets);
const prizes = generateAreaPrizes(layout2, apiPrizes);

console.log(`Layout: ${layout.name} with ${layout.scratchAreas.length} areas`);
```

### `scratchers.ts`
- Scratcher tool definitions
- Visual properties (symbol, colors, gradients)
- Behavior properties (scratch radius)
- All functions accept optional `scratchersData` parameter

**Example Usage:**
```typescript
import { getScratcher, getScratchers } from '@/core/mechanics/scratchers';

// Without backend data (uses SCRATCHER_TYPES constant)
const scratcher = getScratcher('coin');

// With backend data
const apiScratchers = await fetchScratchers();
const scratcher2 = getScratcher('coin', apiScratchers);
const allScratchers = getScratchers(apiScratchers);

console.log(`Using: ${scratcher.symbol} ${scratcher.name}`);
```

### `stores.ts`
- Store configuration and management
- Store unlock requirements
- Ticket availability per store
- All functions accept optional `storesData` and `ticketsData` parameters

**Example Usage:**
```typescript
import { getStoreById, getStoreTickets, getUnlockedStores } from '@/core/mechanics/stores';

// Without backend data (uses DEFAULT_STORES constant)
const store = getStoreById('starter-market');
const tickets = getStoreTickets('starter-market');

// With backend data
const apiStores = await fetchStores();
const apiTickets = await fetchTickets();
const store2 = getStoreById('starter-market', apiStores);
const tickets2 = getStoreTickets('starter-market', apiStores, apiTickets);
const unlockedStores = getUnlockedStores(totalGold, apiStores);
```

### `sounds.ts`
- Sound effect generation using Web Audio API
- Scratch sounds
- Win sounds
- Platform-specific audio handling

**Example Usage:**
```typescript
import { soundManager } from '@/core/mechanics/sounds';

soundManager.playScratch(); // Play scratch sound
soundManager.playWin();     // Play win sound
```

### `capabilities.ts`
- Browser/device capability detection
- Haptic feedback support
- Audio support
- Platform-specific feature availability

**Example Usage:**
```typescript
import { detectCapabilities } from '@/core/mechanics/capabilities';

const caps = detectCapabilities();
console.log(`Haptic feedback: ${caps.hasHapticFeedback}`);
console.log(`Sound effects: ${caps.hasSound}`);
```

## Game Logic (`/core/game-logic`)

**Status**: Placeholder for future development

This directory will contain game-specific logic such as:
- Player progression system
- Level management
- Inventory system
- Combat/encounter mechanics
- Save/load functionality

## Usage Guidelines

### In Web App (`/web`)

```typescript
// Import from core/mechanics
import { getRandomPrize } from '../core/mechanics/prizes';
```

### In Mobile App (`/mobile`)

```typescript
// Import from core/mechanics
import { getRandomPrize } from '../core/mechanics/prizes';
```

### Adding New Mechanics

When adding new game mechanics:

1. **Create in `/core/mechanics`** if it's platform-agnostic
2. **Use TypeScript** for type safety
3. **Export types and functions** explicitly
4. **Document with JSDoc comments**
5. **Keep it pure** - avoid platform-specific code
6. **Test independently** before integrating

### Platform-Specific Considerations

Some mechanics may need platform-specific implementations:

- **Sounds**: Web Audio API (web) vs React Native Sound libraries (mobile)
- **Haptics**: Vibration API (web) vs React Native Haptics (mobile)
- **Storage**: localStorage (web) vs AsyncStorage (mobile)

For these cases:
1. Define the interface in `/core/mechanics`
2. Implement platform-specific versions in `/web` or `/mobile`
3. Use dependency injection or conditional imports

## Testing

Core mechanics should be testable independently of any UI framework:

```typescript
// Example test
import { getRandomPrize } from './prizes';

test('getRandomPrize returns valid prize', () => {
  const prize = getRandomPrize();
  expect(prize).toHaveProperty('name');
  expect(prize).toHaveProperty('value');
  expect(prize).toHaveProperty('emoji');
});
```

## Benefits of This Structure

1. **Code Reusability** - Write once, run on web and mobile
2. **Type Safety** - Shared TypeScript types across platforms
3. **Easier Refactoring** - Changes propagate to all platforms
4. **Independent Testing** - Test logic without UI dependencies
5. **Clear Separation** - Business logic separated from presentation
6. **Future-Proof** - Easy to add new platforms (desktop, CLI, etc.)
