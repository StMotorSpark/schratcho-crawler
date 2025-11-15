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

Contains platform-agnostic implementations of game mechanics:

### `prizes.ts`
- Prize type definitions
- Prize randomization logic
- Prize display formatting

**Example Usage:**
```typescript
import { getRandomPrize, type Prize } from '@/core/mechanics/prizes';

const prize: Prize = getRandomPrize();
console.log(`You won: ${prize.emoji} ${prize.name} - ${prize.value}`);
```

### `ticketLayouts.ts`
- Ticket layout configuration system
- Scratch area positioning
- Win condition evaluation
- Prize reveal mechanics

**Example Usage:**
```typescript
import { getTicketLayout, TICKET_LAYOUTS } from '@/core/mechanics/ticketLayouts';

const layout = getTicketLayout('classic');
console.log(`Layout: ${layout.name} with ${layout.scratchAreas.length} areas`);
```

### `scratchers.ts`
- Scratcher tool definitions
- Visual properties (symbol, colors, gradients)
- Behavior properties (scratch radius)

**Example Usage:**
```typescript
import { getScratcher, SCRATCHER_TYPES } from '@/core/mechanics/scratchers';

const scratcher = getScratcher('coin');
console.log(`Using: ${scratcher.symbol} ${scratcher.name}`);
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
