# Schratcho Crawler

A web and mobile game combining scratch-off tickets with rogue-like progression and dungeon crawler mechanics.

## Current Status

This project is currently in the **demo phase**. The initial scratch-off ticket demo has been implemented to test core mechanics and interactions.

## Demo: Scratch-Off Ticket

The current demo showcases two different technical approaches for implementing the scratch-off effect:

### Features

- **Dual Implementation**: Compare Canvas API vs CSS Masking approaches
- **Random Prizes**: 10 different prize types with unique emojis and values
- **Interactive Scratching**: Mouse and touch support for scratching
- **Completion Detection**: Automatically detects when enough of the ticket is revealed
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **New Ticket Button**: Generate new tickets without page refresh

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
- **Canvas API** - Hardware-accelerated rendering
- **CSS Masking** - CSS-based reveal effects

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
│   │   ├── ScratchTicketCanvas.tsx   # Canvas API implementation
│   │   └── ScratchTicketCSS.tsx      # CSS Masking implementation
│   ├── utils/
│   │   └── prizes.ts                 # Prize definitions and randomization
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

### Canvas API Approach

The Canvas implementation uses the HTML5 Canvas API to create an interactive scratch-off effect:

- Draws a textured silver surface with "SCRATCH HERE" text
- Uses `destination-out` composite operation to erase scratched areas
- Monitors pixel transparency to calculate reveal percentage
- Optimized with device pixel ratio for high-DPI displays

### CSS Masking Approach

The CSS Masking implementation uses native CSS masking features:

- Creates a dynamic mask using a hidden canvas
- Updates `mask-image` data URL on each scratch action
- Uses diagonal stripe pattern for visual appeal
- Leverages hardware-accelerated CSS rendering

### Performance

Both implementations are optimized for smooth performance:

- Target: 60fps during interaction
- Pixel checking: Every 10th pixel for reveal calculation
- Touch events: `preventDefault()` to avoid scroll interference
- Device pixel ratio: Adjusted for crisp rendering on high-DPI screens

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
