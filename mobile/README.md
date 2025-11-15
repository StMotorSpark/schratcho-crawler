# Schratcho Crawler - Mobile

React Native implementation of Schratcho Crawler game.

## Status

This is a **placeholder structure** for the future React Native mobile app. The mobile implementation is planned but not yet developed.

## Purpose

This folder demonstrates how the mobile app will be structured and how it will share code with the web version through the `/core` directory.

## Planned Structure

```
mobile/
├── app/                    # Main application screens
├── components/             # React Native UI components
├── package.json           # Mobile-specific dependencies
└── README.md              # This file
```

## Using Shared Core Mechanics

The mobile app will import shared game mechanics and logic from the `/core` directory:

```typescript
// Example: Importing shared mechanics in a React Native component
import { getRandomPrize, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout, TICKET_LAYOUTS } from '../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES } from '../core/mechanics/scratchers';

// Your React Native component can now use these shared utilities
const MyComponent = () => {
  const prize = getRandomPrize();
  const layout = getTicketLayout('classic');
  // ... rest of your component
};
```

## Future Development

When implementing the mobile version:

1. **Install React Native dependencies** - Set up Expo or bare React Native
2. **Create mobile-specific UI components** - Adapt web components for React Native
3. **Import core mechanics** - Use the shared code from `/core/mechanics`
4. **Add game-specific logic** - Import from `/core/game-logic` when available
5. **Test on devices** - Ensure touch interactions work properly

## Key Differences from Web

- **UI Framework**: React Native instead of React DOM
- **Styling**: React Native StyleSheet instead of CSS
- **Touch Handling**: React Native gesture responders
- **Platform APIs**: Native platform capabilities (haptics, storage, etc.)

## Shared Code

The following are shared between web and mobile through `/core`:

- **Game Mechanics** (`/core/mechanics`):
  - Prize system and randomization
  - Ticket layout configurations
  - Scratcher type definitions
  - Sound effect management (may need platform-specific implementations)
  - Browser/device capability detection

- **Game Logic** (`/core/game-logic`):
  - (Future) Player progression
  - (Future) Level management
  - (Future) Inventory system
  - (Future) Combat/encounter logic
