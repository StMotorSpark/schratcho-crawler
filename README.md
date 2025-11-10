# Schratcho Crawler

A web and mobile game combining scratch-off tickets with rogue-like progression and dungeon crawler mechanics.

## Current Status

This project is currently in the **demo phase**. The scratch-off ticket demo has been enhanced with improved styling, multiple scratch areas, and sound effects.

## Demo: Scratch-Off Ticket

The current demo showcases an interactive scratch-off ticket experience using CSS Masking:

### Features

- **CSS Masking Implementation**: Smooth, performant scratch-off effect using CSS masking
- **Multiple Scratch Areas**: Three separate areas to scratch, all must be revealed to win
- **Sound Effects**: Realistic scratching sounds and celebratory win sound
- **Random Prizes**: 10 different prize types with unique emojis and values
- **Interactive Scratching**: Mouse and touch support for scratching
- **Completion Detection**: Automatically detects when all areas are revealed
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **New Ticket Button**: Generate new tickets anytime without page refresh
- **Enhanced Styling**: Game-themed design with vibrant colors and animations

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
```

### Linting

```bash
# Run TypeScript type checking
npm run lint
```

## Project Structure

```
schratcho-crawler/
├── src/
│   ├── components/
│   │   └── ScratchTicketCSS.tsx      # CSS Masking scratch-off implementation
│   ├── utils/
│   │   ├── prizes.ts                 # Prize definitions and randomization
│   │   └── sounds.ts                 # Sound effects using Web Audio API
│   ├── App.tsx                       # Main application component
│   ├── App.css                       # Application styles
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML entry point
├── package.json                      # Project configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── README.md                         # This file
```

## Implementation Details

### CSS Masking Approach

The CSS Masking implementation uses native CSS masking features with multiple scratch areas:

- **Three Independent Areas**: Each area has its own scratch mask that must be revealed
- **Dynamic Masking**: Creates separate canvas masks for each area, updated on each scratch action
- **Visual Design**: Game-themed styling with vibrant gradients and borders
- **Hardware Acceleration**: Leverages GPU-accelerated CSS rendering for smooth performance

### Sound Effects

The Web Audio API generates realistic sound effects:

- **Scratch Sound**: Short burst of noise that plays during scratching (throttled to avoid overwhelming)
- **Win Sound**: Celebratory chord progression (C-E-G major chord) that plays when all areas are revealed
- **Graceful Degradation**: Sounds fail silently if Web Audio API is not available

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
