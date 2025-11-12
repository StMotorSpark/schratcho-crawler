# Schratcho Crawler

A web and mobile game combining scratch-off tickets with rogue-like progression and dungeon crawler mechanics.

## Current Status

This project is currently in the **demo phase**. The scratch-off ticket demo has been enhanced with improved styling, multiple scratch areas, and sound effects.

## Demo: Scratch-Off Ticket

The current demo showcases an interactive scratch-off ticket experience using CSS Masking:

### Features

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

## Project Structure

```
schratcho-crawler/
├── src/
│   ├── components/
│   │   ├── ScratchTicketCSS.tsx      # CSS Masking scratch-off implementation
│   │   ├── Settings.tsx              # Settings modal component
│   │   └── Settings.css              # Settings modal styles
│   ├── utils/
│   │   ├── ticketLayouts.ts          # Ticket layout configuration system
│   │   ├── prizes.ts                 # Prize definitions and randomization
│   │   ├── sounds.ts                 # Sound effects using Web Audio API
│   │   └── capabilities.ts           # Browser capability detection
│   ├── App.tsx                       # Main application component
│   ├── App.css                       # Application styles
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
├── kickstart-prompts/                # Project planning and issue documentation
├── TICKET_LAYOUTS.md                 # Guide for creating custom ticket layouts
├── index.html                        # HTML entry point
├── package.json                      # Project configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── README.md                         # This file
```

## Implementation Details

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
- React Native implementation
- Touch-optimized UI
- Mobile-specific performance optimizations

## License

ISC

## Contributing

This project is currently in early development. Contribution guidelines will be added as the project matures.
