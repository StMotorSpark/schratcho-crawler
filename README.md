# Schratcho Crawler

A web and mobile game combining scratch-off tickets with rogue-like progression and dungeon crawler mechanics.

## Current Status

This project is currently in the **demo phase**. The scratch-off ticket demo has been enhanced with improved styling, multiple scratch areas, and sound effects.

## Demo: Scratch-Off Ticket

The current demo showcases an interactive scratch-off ticket experience using CSS Masking:

### Features

- **Dynamic Scratcher Types**: Choose from multiple scratcher tools with different graphics and behaviors
- **Scratcher Selector**: Select your preferred scratcher before scratching (Gold Coin, Magic Brush, Finger, Golden Key, Mega Eraser, Fire Sword)
- **Dynamic Ticket Layouts**: Flexible system for defining custom ticket layouts via configuration
- **Multiple Layout Types**: Choose from Classic (3 horizontal), Grid (3x3), or Single Area layouts
- **CSS Masking Implementation**: Smooth, performant scratch-off effect using CSS masking
- **Configurable Scratch Areas**: Position, size, and reveal thresholds are fully configurable
- **Prize Reveal Mechanics**: Support for different reveal strategies (reveal-all, match-three, progressive)
- **Win Conditions**: Configurable win conditions based on ticket type
- **Sound Effects**: Realistic scratching sounds and celebratory win sound with iOS support
- **Random Prizes**: 10 different prize types with unique emojis and values
- **Interactive Scratching**: Mouse and touch support for scratching
- **Completion Detection**: Automatically detects when win conditions are met
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Layout Selector**: Switch between different ticket layouts in real-time
- **New Ticket Button**: Generate new tickets anytime without page refresh
- **Enhanced Styling**: Game-themed design with vibrant colors and animations
- **Settings Menu**: View browser capabilities and game information
- **Capability Detection**: Automatic detection of haptic and audio support

### Available Ticket Layouts

- **Classic Ticket**: Three horizontal scratch areas - reveal all to win (original demo layout)
- **Grid Ticket**: 3x3 grid of areas for match-style games
- **Single Area Ticket**: One large scratch area covering the entire ticket
- **Goblin Gold**: Fantasy-themed ticket with custom artwork featuring a goblin treasure hunter and 10 scratch areas arranged in a 2x5 grid for match-three gameplay

### Available Scratcher Types

- **🪙 Gold Coin**: Classic scratcher with medium scratch radius (25px)
- **🖌️ Magic Brush**: Wide brush for faster scratching (35px radius)
- **👆 Finger**: Precise finger scratching (20px radius)
- **🔑 Golden Key**: Small key for strategic scratching (15px radius)
- **🧽 Mega Eraser**: Massive eraser for quick reveals (50px radius)
- **⚔️ Fire Sword**: Game-themed sword with medium-large radius (30px)

Each scratcher has unique visual styles with different gradient overlays for a varied gameplay experience.

### Available Prizes

- 🏆 Grand Prize - $1000
- 🪙 Gold Coins - 500 Coins
- 💎 Diamond - 100 Gems
- 🎁 Treasure Chest - $500
- 🧪 Magic Potion - +50 HP
- ⭐ Lucky Star - $250
- 🔑 Golden Key - Unlock Special Level
- ⚔️ Fire Sword - +25 Attack
- 🛡️ Shield - +25 Defense
- 👑 Crown - $100

## Tech Stack

### Web Version
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS Masking** - CSS-based reveal effects
- **Web Audio API** - Sound effects generation

### Future: Mobile Version
- React Native
- Expo
- Jest
- Detox

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173/
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run with local network access
npm run build -- --host
```

### Linting

```bash
# Run TypeScript type checking
npm run lint
```

### Deployment

#### Manual Deployment to GitHub Pages

The project includes a manual deployment workflow that allows you to deploy any branch or commit to GitHub Pages for testing and preview purposes.

**To deploy:**

1. Go to the [Actions tab](https://github.com/StMotorSpark/schratcho-crawler/actions) in the GitHub repository
2. Select the "Manual Deploy to GitHub Pages" workflow from the left sidebar
3. Click the "Run workflow" button
4. Enter the branch name or commit SHA you want to deploy (default is `main`)
5. Click "Run workflow" to start the deployment

**After deployment:**

- The workflow will build the project and deploy it to GitHub Pages
- The deployed site will be available at: `https://stmotorspark.github.io/schratcho-crawler/`
- Each deployment replaces the previous one (GitHub Pages only maintains one active deployment)
- The deployment URL will be shown in the workflow run output

**Requirements:**

- GitHub Pages must be enabled for the repository (configured to deploy from GitHub Actions)
- The workflow requires `contents: read`, `pages: write`, and `id-token: write` permissions

## Developer Tools

### Ticket Layout Designer

A visual GUI tool for designing custom scratch-off ticket layouts without writing code:

```bash
cd tools/layout-designer
npm install
npm run dev
```

**Features:**
- Visual drag-and-drop layout design
- Image upload for ticket backgrounds
- Interactive scratch area editor
- TypeScript/JSON code generation
- No deployment needed - runs locally

📖 **Full Documentation**: See [LAYOUT_DESIGNER.md](LAYOUT_DESIGNER.md)

## Project Structure

The project is now organized to support both web and mobile development with shared core logic:

```
schratcho-crawler/
├── core/                             # Shared game logic (web + mobile)
│   ├── mechanics/                    # Platform-agnostic game mechanics
│   │   ├── prizes.ts                 # Prize definitions and randomization
│   │   ├── ticketLayouts.ts          # Ticket layout configuration system
│   │   ├── scratchers.ts             # Scratcher type configuration system
│   │   ├── sounds.ts                 # Sound effects using Web Audio API
│   │   └── capabilities.ts           # Browser/device capability detection
│   ├── game-logic/                   # Game-specific logic (future)
│   └── README.md                     # Core documentation
├── web/                              # React web application
│   ├── components/
│   │   ├── ScratchTicketCSS.tsx      # CSS Masking scratch-off implementation
│   │   ├── Settings.tsx              # Settings modal component
│   │   └── Settings.css              # Settings modal styles
│   ├── App.tsx                       # Main application component
│   ├── App.css                       # Application styles
│   ├── main.tsx                      # Application entry point
│   ├── index.css                     # Global styles
│   └── README.md                     # Web app documentation
├── mobile/                           # React Native app (placeholder)
│   ├── app/                          # Main app screens (future)
│   ├── components/                   # React Native UI components
│   │   └── ExampleTicketComponent.tsx # Example showing shared code usage
│   ├── package.json                  # Mobile dependencies (placeholder)
│   └── README.md                     # Mobile app documentation
├── tools/                            # Development tools
│   └── layout-designer/              # Ticket Layout Designer GUI tool
│       ├── src/                      # Tool source code
│       ├── package.json              # Tool dependencies
│       └── README.md                 # Tool documentation
├── kickstart-prompts/                # Project planning and issue documentation
├── LAYOUT_DESIGNER.md                # Ticket Layout Designer guide
├── TICKET_LAYOUTS.md                 # Guide for creating custom ticket layouts
├── SCRATCHERS.md                     # Guide for creating custom scratchers
├── IOS_COMPATIBILITY.md              # iOS-specific considerations
├── index.html                        # HTML entry point
├── package.json                      # Project configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── README.md                         # This file
```

### Key Directories

- **`/core`** - Shared code used by both web and mobile apps
  - **`/core/mechanics`** - Game mechanics (prizes, tickets, scratchers, sounds)
  - **`/core/game-logic`** - Future game-specific logic (progression, combat, etc.)
- **`/web`** - React web application (Vite + TypeScript)
- **`/mobile`** - React Native mobile app structure (placeholder for future development)

## Implementation Details

### Dynamic Scratcher System

The scratcher system provides customizable tools for scratching tickets:

- **Configuration-Based**: Scratchers defined via TypeScript objects with full type safety
- **Visual Customization**: Each scratcher has unique symbols, colors, and gradients
- **Behavior Customization**: Configurable scratch radius for different gameplay styles
- **Extensible Design**: Easy to add new scratcher types with unique properties
- **Real-time Selection**: Players can switch scratchers without restarting tickets

See [SCRATCHERS.md](./SCRATCHERS.md) for a complete guide on creating custom scratchers.

### Dynamic Ticket Layout System

The ticket layout system provides a flexible architecture for defining different ticket types:

- **Configuration-Based**: Ticket layouts defined via TypeScript objects with full type safety
- **Dynamic Positioning**: Scratch areas positioned using percentage-based coordinates
- **Multiple Reveal Mechanics**: Support for reveal-all, match-three, progressive, and more
- **Flexible Win Conditions**: Configurable conditions for what constitutes a winning ticket
- **Extensible Design**: Easy to add new layouts, mechanics, and win conditions

See [TICKET_LAYOUTS.md](./TICKET_LAYOUTS.md) for a complete guide on creating custom ticket layouts.

### CSS Masking Approach

The CSS Masking implementation uses native CSS masking features with configurable scratch areas:

- **Dynamic Area Count**: Support for any number of scratch areas (1-9+ tested)
- **Absolute Positioning**: Areas positioned dynamically based on layout configuration
- **Dynamic Masking**: Creates separate canvas masks for each area, updated on each scratch action
- **Visual Design**: Game-themed styling with vibrant gradients and borders
- **Hardware Acceleration**: Leverages GPU-accelerated CSS rendering for smooth performance

### Sound Effects

The Web Audio API generates realistic sound effects:

- **Scratch Sound**: Short burst of noise that plays during scratching (throttled to avoid overwhelming)
- **Win Sound**: Celebratory chord progression (C-E-G major chord) that plays when all areas are revealed
- **iOS Compatibility**: AudioContext automatically resumes on user interaction (required for iOS)
- **Graceful Degradation**: Sounds fail silently if Web Audio API is not available

### Settings Menu

The settings menu provides browser capability information:

- **Haptic Feedback Detection**: Shows if Vibration API is supported (note: not available on iOS)
- **Sound Effects Detection**: Shows if Web Audio API is available
- **User Guidance**: Provides helpful notes about iOS limitations and requirements
- **Responsive Modal**: Game-themed design that works on all screen sizes

### Performance

The implementation is optimized for smooth performance:

- Target: 60fps during interaction
- Pixel checking: Every 10th pixel for reveal calculation
- Touch events: `preventDefault()` to avoid scroll interference
- Sound throttling: Scratch sounds limited to every 50ms
- Efficient state management: React state updates batched for performance

## Shared Core Architecture

The project uses a shared core architecture that enables code reuse between web and mobile platforms:

### Benefits

1. **Code Reusability** - Game mechanics written once, used everywhere
2. **Consistency** - Identical behavior across platforms
3. **Maintainability** - Bug fixes apply to all platforms
4. **Type Safety** - Shared TypeScript types across platforms
5. **Independent Testing** - Test logic without UI dependencies

### How It Works

Both the web and mobile apps import from `/core/mechanics`:

```typescript
// In web/App.tsx or mobile components
import { getRandomPrize, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout, TICKET_LAYOUTS } from '../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES } from '../core/mechanics/scratchers';

// Use the shared logic
const prize = getRandomPrize();        // Works on both web and mobile
const layout = getTicketLayout('classic');  // Same across platforms
const scratcher = getScratcher('coin');     // Consistent behavior
```

### Adding New Features

When adding features:

1. **Shared Logic** - Put in `/core/mechanics` or `/core/game-logic`
2. **Platform-Specific UI** - Put in `/web` or `/mobile`
3. **Use TypeScript** - For type safety across the codebase
4. **Document** - Add to relevant README files

See `/core/README.md` for detailed information on the shared architecture.

## Future Development

### Phase 2: Rogue-Like Progression
- Player progression system
- Unlockable tickets and abilities
- Level advancement
- Persistent stats (attack, defense, HP)

### Phase 3: Dungeon Crawler
- Dungeon exploration via scratch-off mechanics
- Enemy encounters
- Loot system
- Risk/reward mechanics

### Mobile Version

The mobile app structure is in place and ready for React Native development:

- **Shared Mechanics** - Imports game logic from `/core/mechanics`
- **Example Components** - Template showing how to use shared code
- **React Native Ready** - Structure prepared for Expo or React Native CLI
- **Touch-optimized UI** - Mobile-specific components (to be implemented)
- **Platform APIs** - Native haptics, storage, and device features

To start mobile development:
1. Set up React Native in `/mobile` directory
2. Import mechanics from `/core/mechanics`
3. Build mobile-specific UI components
4. Test on iOS and Android devices

See `/mobile/README.md` for details on mobile setup and development.

## License

ISC

## Contributing

This project is currently in early development. Contribution guidelines will be added as the project matures.
