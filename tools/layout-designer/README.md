# Ticket Layout Designer

A visual GUI tool for designing and configuring scratch-off ticket layouts for Schratcho Crawler.

## Features

- **Visual Layout Design**: Draw scratch areas directly on your ticket image
- **Image Upload**: Upload ticket background images and automatically detect dimensions
- **Interactive Editor**: Click and drag to create scratch areas, click to select and edit
- **Configuration Options**: Set reveal mechanics, win conditions, and area properties
- **Code Generation**: Export as TypeScript or JSON for integration with the game
- **Real-time Preview**: See your layout as you design it
- **Load Existing Layouts**: Import and edit existing layout files from your core folder
- **Testing & Debugging**: Simulate ticket scratching and validate win conditions
- **Core Integration**: Direct save to core game logic folder with version tracking

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
cd tools/layout-designer
npm install
```

### Running the Tool

```bash
npm run dev
```

The tool will open at `http://localhost:5173/`

## How to Use

### 1. Set Basic Information

- **Layout ID**: Unique identifier (e.g., `my-custom-ticket`)
- **Layout Name**: Display name (e.g., `My Custom Ticket`)
- **Description**: Brief description of the layout

### 2. Upload Ticket Image

1. Click "Upload Ticket Image"
2. Select your ticket background image (PNG, JPG, etc.)
3. The tool will automatically detect image dimensions

### 3. Configure Game Mechanics

Choose the appropriate mechanics for your ticket:

**Reveal Mechanics:**
- `reveal-all`: Same prize shown in all areas (classic tickets)
- `reveal-one`: Prize only in one area
- `match-three`: Match 3 symbols to win
- `match-two`: Match 2 symbols to win
- `progressive`: Each area reveals part of the prize

**Win Conditions:**
- `reveal-all-areas`: Must scratch all areas
- `reveal-any-area`: Win when any area is revealed
- `match-symbols`: Win if symbols match
- `progressive-reveal`: Win when last area is revealed

### 4. Draw Scratch Areas

1. Click and drag on the canvas to draw a rectangle
2. Release to create a new scratch area
3. Click on an existing area to select and edit it
4. Adjust properties in the left panel:
   - Area ID
   - Reveal Threshold (percentage of scratching needed)
   - Canvas dimensions (for rendering quality)
5. Delete selected areas with the "Delete Area" button

### 5. Test Your Layout (NEW!)

Before exporting, test your layout using the interactive testing panel:

1. Click "▶ Show Test Panel" in the right sidebar
2. Click on areas to simulate scratching them
3. The panel shows:
   - 🔒 = Area not revealed
   - ✓ = Area revealed
   - 🎉 WINNER! = Win condition met
   - ❌ Not a winner yet = Keep scratching
4. Click "🔄 Reset Test" to start over

**Why Test?**
- Validate win conditions work correctly
- Ensure reveal mechanics match expectations
- Catch configuration issues before exporting

### 6. Export Configuration

**Save to Core (Recommended):**
- Click "💾 Download for Core" to get a file ready for core integration
- Save to `core/game-logic/tickets/[layoutId]Layout.ts`
- Includes version tracking, timestamps, and integration instructions

**TypeScript Export:**
- Click "Copy TypeScript" to copy code to clipboard
- Click "Download .ts" to download as a TypeScript file
- Add the exported code to `core/mechanics/ticketLayouts.ts` or a separate file

**JSON Export:**
- Click "Copy JSON" to copy JSON to clipboard
- Click "Download .json" to download as a JSON file
- Use JSON for dynamic loading or configuration files

### 7. Load Existing Layouts (NEW!)

You can now edit existing ticket layouts:

1. Click "📂 Load Existing Layout" button
2. Select a `.ts` or `.json` file from `core/game-logic/tickets/`
3. The tool loads all layout data
4. Make your changes and save

**Use Cases:**
- Update existing ticket designs
- Create variations of successful tickets
- Fix bugs in existing layouts
- Adjust thresholds based on playtesting

### 8. Integrate with Game

1. Copy the generated TypeScript code
2. Add it to your project (e.g., `core/game-logic/tickets/`)
3. Import and register in `core/mechanics/ticketLayouts.ts`:

```typescript
import { MY_CUSTOM_TICKET } from '../game-logic/tickets/my-custom-ticket';

export const TICKET_LAYOUTS: Record<string, TicketLayout> = {
  classic: CLASSIC_TICKET,
  grid: GRID_TICKET,
  'my-custom': MY_CUSTOM_TICKET,  // Add your layout
};
```

4. Use in your game:

```typescript
const layout = getTicketLayout('my-custom');
```

## Tips for Good Layout Design

### Canvas Size Guidelines

- Small areas: 100-200px
- Medium areas: 200-300px
- Large areas: 300-400px
- Higher resolution = better quality but more memory

### Reveal Threshold

- **30-40%**: Easy (quick reveals)
- **50%**: Standard (balanced)
- **60-70%**: Hard (thorough scratching required)

### Layout Best Practices

1. **Start Simple**: Begin with 1-3 areas
2. **Test on Mobile**: Ensure areas are finger-friendly (min ~80px wide)
3. **Leave Gaps**: Small gaps between areas improve clarity
4. **Match Mechanics**: Ensure reveal mechanic matches win condition
5. **Performance**: Limit to 9 or fewer areas for best performance

### Recommended Combinations

| Layout Type | Reveal Mechanic | Win Condition |
|-------------|----------------|---------------|
| Classic (3 horizontal) | `reveal-all` | `reveal-all-areas` |
| Grid (3x3) | `match-three` | `match-symbols` |
| Single area | `reveal-one` | `reveal-any-area` |
| Progressive | `progressive` | `progressive-reveal` |

## Troubleshooting

### Canvas Not Updating
- Refresh the page and try again
- Ensure image loaded successfully

### Exported Code Doesn't Work
- Check that all required fields are filled
- Verify area percentages don't overlap incorrectly
- Ensure IDs are unique and valid JavaScript identifiers

### Areas Too Small/Large
- Adjust canvas dimensions in the area editor
- Remember: canvas size affects rendering quality, not display size

## Development

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Type Checking

```bash
npm run lint
```

## Technical Details

- **Framework**: React 19.2 + TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Canvas API**: HTML5 Canvas for interactive drawing
- **No Backend**: Completely client-side, no server required

## Recent Updates

**Version 2.0 (2025-11-24)**
- ✅ Added interactive testing and debugging panel
- ✅ Added ability to load existing layouts for editing
- ✅ Added "Save to Core" feature with version tracking
- ✅ Improved export with auto-generated integration instructions
- ✅ Added win condition validation in real-time

## Future Enhancements

Potential features for future versions:

- [ ] Undo/Redo functionality
- [ ] Snap-to-grid for precise alignment
- [ ] Copy/paste areas
- [ ] Preset templates
- [ ] Shape masks (circles, polygons)
- [ ] Preview with actual game rendering
- [ ] Batch export multiple layouts
- [ ] Auto-save drafts to browser storage

## Questions or Issues?

For questions or issues with the Layout Designer, please refer to the main project README or open an issue on GitHub.
