# Schratcho Crawler - Architecture Overview

This document provides a high-level overview of the project's architecture after the restructuring to support both web and mobile platforms.

## Architecture Goals

1. **Code Reusability** - Share game mechanics between web and mobile
2. **Separation of Concerns** - Separate business logic from UI
3. **Type Safety** - Consistent TypeScript types across platforms
4. **Maintainability** - Single source of truth for game logic
5. **Scalability** - Easy to add new platforms or features

## Folder Structure

```
schratcho-crawler/
├── core/                    # Shared code (web + mobile)
│   ├── mechanics/          # Platform-agnostic game mechanics
│   └── game-logic/         # Game-specific logic (future)
├── web/                    # React web app
├── mobile/                 # React Native app (placeholder)
└── [config files]          # Build, lint, and deployment configs
```

## Architecture Layers

### Layer 1: Core Mechanics (`/core/mechanics`)

**Purpose**: Platform-agnostic game mechanics that work identically on all platforms.

**Contents**:
- `prizes.ts` - Prize definitions and randomization
- `ticketLayouts.ts` - Ticket layout system with scratch areas and win conditions
- `scratchers.ts` - Scratcher tool definitions and properties
- `sounds.ts` - Sound effect generation (may need platform adapters)
- `capabilities.ts` - Device/browser capability detection

**Key Characteristics**:
- No platform-specific code
- Pure TypeScript/JavaScript
- Fully typed with TypeScript
- Testable independently

**Example**:
```typescript
// core/mechanics/prizes.ts
export interface Prize {
  name: string;
  value: string;
  emoji: string;
}

export function getRandomPrize(): Prize {
  // Implementation...
}
```

### Layer 2: Core Game Logic (`/core/game-logic`)

**Purpose**: Higher-level game systems that build on core mechanics.

**Status**: Placeholder for future development

**Planned Contents**:
- Player progression (XP, leveling, stats)
- Inventory system
- Combat/encounter mechanics
- Level management
- Save/load functionality

**Example (Future)**:
```typescript
// core/game-logic/player/progression.ts
import { Prize } from '../../mechanics/prizes';

export interface PlayerStats {
  level: number;
  xp: number;
  hp: number;
  attack: number;
  defense: number;
}

export function gainXP(player: PlayerStats, amount: number): PlayerStats {
  // Implementation...
}
```

### Layer 3: Platform UI (`/web` and `/mobile`)

**Purpose**: Platform-specific UI implementations that use core logic.

**Web** (`/web`):
- React components
- CSS styling
- Web-specific APIs (Web Audio, Vibration)
- Vite build configuration

**Mobile** (`/mobile`):
- React Native components (future)
- React Native StyleSheet
- Native APIs (haptics, storage)
- Expo or React Native CLI setup

**Key Characteristics**:
- Imports from `/core`
- Platform-specific UI code
- Platform-specific APIs
- Independent build processes

**Example**:
```typescript
// web/App.tsx
import { getRandomPrize, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout } from '../core/mechanics/ticketLayouts';

function App() {
  const [prize, setPrize] = useState<Prize>(getRandomPrize());
  const layout = getTicketLayout('classic');
  // ... render UI
}
```

## Data Flow

```
User Interaction (web or mobile)
         ↓
Platform UI Layer (/web or /mobile)
         ↓
Core Game Logic (/core/game-logic) [future]
         ↓
Core Mechanics (/core/mechanics)
         ↓
Result back to UI
```

## Import Patterns

### In Web Components
```typescript
// Importing from core mechanics
import { getRandomPrize } from '../core/mechanics/prizes';
import { getScratcher } from '../core/mechanics/scratchers';
```

### In Mobile Components (Future)
```typescript
// Same imports work in mobile
import { getRandomPrize } from '../core/mechanics/prizes';
import { getScratcher } from '../core/mechanics/scratchers';
```

### In Core Game Logic (Future)
```typescript
// Game logic builds on mechanics
import { getRandomPrize, Prize } from '../mechanics/prizes';

export function generateBattleReward(enemyLevel: number): Prize {
  const basePrize = getRandomPrize();
  // Apply game logic modifications
  return basePrize;
}
```

## Type Safety

All layers share TypeScript types:

```typescript
// Defined in core/mechanics/prizes.ts
export interface Prize {
  name: string;
  value: string;
  emoji: string;
}

// Used in web/App.tsx
const [prize, setPrize] = useState<Prize>(getRandomPrize());

// Used in mobile (future)
const [prize, setPrize] = useState<Prize>(getRandomPrize());
```

## Platform-Specific Considerations

Some features may need platform-specific implementations:

### Sound Effects
- **Web**: Web Audio API (`core/mechanics/sounds.ts`)
- **Mobile**: React Native Sound library (adapter needed)

### Haptics
- **Web**: Vibration API
- **Mobile**: React Native Haptics

### Storage
- **Web**: localStorage
- **Mobile**: AsyncStorage

**Solution**: Define interfaces in `/core` and implement platform-specific versions in `/web` or `/mobile`.

## Testing Strategy

### Core Mechanics Tests
```typescript
// Test independently of UI
import { getRandomPrize } from './prizes';

test('getRandomPrize returns valid prize', () => {
  const prize = getRandomPrize();
  expect(prize).toHaveProperty('name');
  expect(prize).toHaveProperty('value');
  expect(prize).toHaveProperty('emoji');
});
```

### UI Tests
- Web: Browser-based tests (Playwright, Vitest)
- Mobile: Device tests (Detox, Jest)

## Adding New Features

### New Core Mechanic
1. Add to `/core/mechanics/` or `/core/game-logic/`
2. Export types and functions
3. Use in both `/web` and `/mobile`

### New UI Feature
1. Implement in `/web` or `/mobile`
2. Use existing core mechanics
3. Keep platform-specific code isolated

## Build Process

### Web Build
```bash
npm run build  # Uses Vite to build /web
```

### Mobile Build (Future)
```bash
cd mobile
npm run build  # Uses Metro bundler
```

## Deployment

### Web
- GitHub Pages (via workflow)
- Static hosting (Netlify, Vercel)
- Deploy `/dist` folder

### Mobile (Future)
- App Store (iOS)
- Google Play (Android)
- TestFlight/Firebase for testing

## Benefits of This Architecture

1. **DRY Principle** - Don't Repeat Yourself, write logic once
2. **Consistent Behavior** - Same mechanics work identically everywhere
3. **Easy Testing** - Test core logic independently
4. **Clear Boundaries** - Separation between business logic and UI
5. **Future-Proof** - Easy to add new platforms (desktop app, CLI, etc.)
6. **Type Safety** - TypeScript ensures type consistency across all layers
7. **Maintainable** - Changes to game logic propagate automatically

## Migration Notes

### Changes from Previous Structure

**Before**:
```
src/
├── components/
└── utils/  # Game mechanics mixed with app
```

**After**:
```
core/mechanics/  # Shared game mechanics
web/             # Web-specific UI
mobile/          # Mobile-specific UI (placeholder)
```

### Import Path Updates

All imports updated from:
```typescript
import { getRandomPrize } from './utils/prizes';
```

To:
```typescript
import { getRandomPrize } from '../core/mechanics/prizes';
```

## Future Enhancements

1. **Monorepo Tools** - Consider Nx or Turborepo for better multi-package management
2. **Shared Components** - Create UI component library shared between web and mobile
3. **API Layer** - Add backend integration in `/core` or separate package
4. **State Management** - Consider Redux/Zustand in shared core
5. **Testing Infrastructure** - Add comprehensive test suites for core mechanics

## Resources

- `/core/README.md` - Core architecture details
- `/web/README.md` - Web app documentation
- `/mobile/README.md` - Mobile app documentation
- `TICKET_LAYOUTS.md` - Guide for ticket layouts
- `SCRATCHERS.md` - Guide for scratcher types
