# Ticket Layout Designer Tool

## Overview

The **Ticket Layout Designer** is a local GUI tool that allows developers to visually create and configure scratch-off ticket layouts for Schratcho Crawler. This tool streamlines the process of designing complex ticket layouts by providing an interactive visual interface instead of manually writing configuration code.

## Location

The tool is located in the `/tools/layout-designer/` directory.

## Key Features

✅ **Visual Layout Design**: Draw scratch areas directly on your ticket image with click-and-drag  
✅ **Image Upload**: Upload ticket background images and automatically detect dimensions  
✅ **Interactive Editor**: Click and drag to create areas, click to select and edit properties  
✅ **Configuration Options**: Set reveal mechanics, win conditions, and area properties  
✅ **Code Generation**: Export as TypeScript or JSON for immediate integration  
✅ **Real-time Preview**: See your layout as you design it  
✅ **No Deployment Required**: Runs completely locally on your development machine  

## Getting Started

### Installation

From the project root:

```bash
cd tools/layout-designer
npm install
```

### Running the Tool

```bash
npm run dev
```

The tool will start a local development server at `http://localhost:5173/`

### Building (Optional)

To build a production version:

```bash
npm run build
```

The built files will be in `tools/layout-designer/dist/`

## How to Use the Tool

### Step 1: Basic Configuration

1. **Layout ID**: Enter a unique identifier (e.g., `treasure-map-ticket`)
   - Must be valid for use in code (no spaces, use kebab-case)
   
2. **Layout Name**: Enter a display name (e.g., `Treasure Map Ticket`)
   - This is shown to users in the game
   
3. **Description**: Provide a brief description
   - Example: "A pirate-themed ticket with hidden treasure locations"

### Step 2: Upload Ticket Image

1. Click the **"Upload Ticket Image"** button
2. Select your ticket background image (PNG, JPG, or other image formats)
3. The tool automatically detects and sets the image dimensions
4. The image appears on the canvas for you to work with

**Tip**: Use high-quality images (500x300px or larger) for best results.

### Step 3: Configure Game Mechanics

Choose the appropriate mechanics for your ticket type:

#### Reveal Mechanics

| Mechanic | Description | Best For |
|----------|-------------|----------|
| `reveal-all` | Same prize shown in all areas | Classic tickets where consistency matters |
| `reveal-one` | Prize only in one specific area | Single-area tickets |
| `match-three` | Win if 3 symbols match | Grid-style match games |
| `match-two` | Win if 2 symbols match | Easier match games |
| `progressive` | Each area reveals part of the prize | Building suspense gradually |

#### Win Conditions

| Condition | Description | Best Paired With |
|-----------|-------------|------------------|
| `reveal-all-areas` | Must scratch all areas to win | `reveal-all` |
| `reveal-any-area` | Win when any single area is revealed | `reveal-one` |
| `match-symbols` | Win if symbols match | `match-three`, `match-two` |
| `progressive-reveal` | Win when final area is revealed | `progressive` |

### Step 4: Draw Scratch Areas

#### Creating New Areas

1. **Click and drag** on the canvas to draw a rectangle
2. Release the mouse to create the scratch area
3. The area appears with a red border and label

#### Selecting and Editing Areas

1. **Click** on an existing area to select it (turns blue)
2. Edit properties in the left panel:
   - **Area ID**: Unique identifier for the area
   - **Reveal Threshold**: Percentage of scratching needed (0-100)
   - **Canvas Width**: Width for the scratch mask canvas
   - **Canvas Height**: Height for the scratch mask canvas

#### Deleting Areas

1. Select the area you want to delete
2. Click the **"Delete Area"** button

#### Area Properties Explained

- **Reveal Threshold (%)**: How much of the area must be scratched to be considered "revealed"
  - Lower = easier (e.g., 30% = reveals after light scratching)
  - Higher = harder (e.g., 70% = requires thorough scratching)
  - Standard: 50%

- **Canvas Width/Height**: Dimensions of the internal scratch mask canvas
  - Larger = better quality but more memory
  - Should be proportional to the display area size
  - Typical range: 100-400 pixels

### Step 5: Export Configuration

The tool generates code in two formats:

#### TypeScript Export

**Use this to integrate directly into the game code:**

1. Click **"Copy TypeScript"** to copy to clipboard, or
2. Click **"Download .ts"** to download as a file

The generated TypeScript code looks like:

```typescript
import type { TicketLayout } from './ticketLayouts';

export const MY_CUSTOM_TICKET: TicketLayout = {
  id: 'my-custom',
  name: 'My Custom Ticket',
  description: 'A custom ticket layout',
  scratchAreas: [
    // ... area configurations
  ],
  revealMechanic: 'reveal-all',
  winCondition: 'reveal-all-areas',
  ticketWidth: 500,
  ticketHeight: 300,
};
```

#### JSON Export

**Use this for dynamic loading or configuration files:**

1. Click **"Copy JSON"** to copy to clipboard, or
2. Click **"Download .json"** to download as a file

### Step 6: Integrate with the Game

#### Option A: Add to Core Mechanics (Recommended)

1. Copy the generated TypeScript code
2. Create a new file in `core/game-logic/tickets/` (e.g., `myCustomTicket.ts`)
3. Paste the code
4. Import and register in `core/mechanics/ticketLayouts.ts`:

```typescript
import { MY_CUSTOM_TICKET } from '../game-logic/tickets/myCustomTicket';

export const TICKET_LAYOUTS: Record<string, TicketLayout> = {
  classic: CLASSIC_TICKET,
  grid: GRID_TICKET,
  'my-custom': MY_CUSTOM_TICKET,  // Add your layout here
};
```

5. Use in your game:

```typescript
import { getTicketLayout } from '../core/mechanics/ticketLayouts';

const layout = getTicketLayout('my-custom');
```

#### Option B: Dynamic JSON Loading (Advanced)

1. Save the JSON file in a `public/layouts/` directory
2. Load dynamically at runtime:

```typescript
const response = await fetch('/layouts/my-custom.json');
const layout: TicketLayout = await response.json();
```

## Design Guidelines

### Canvas Size Recommendations

| Area Size | Canvas Width | Canvas Height | Use Case |
|-----------|--------------|---------------|----------|
| Small | 100-150px | 100-150px | Small icons, symbols |
| Medium | 150-250px | 150-250px | Standard scratch areas |
| Large | 250-400px | 250-400px | Large prize reveals |

**Rule of Thumb**: Canvas dimensions should be roughly proportional to the display area size on screen.

### Reveal Threshold Guidelines

| Threshold | Difficulty | User Experience |
|-----------|------------|-----------------|
| 30-40% | Easy | Quick reveals, low frustration |
| 45-55% | Medium | Balanced gameplay |
| 60-70% | Hard | Requires thorough scratching |
| 70%+ | Very Hard | Completionist players |

**Recommendation**: Start with 50% and adjust based on playtesting feedback.

### Layout Design Best Practices

1. **Start Simple**
   - Begin with 1-3 areas for your first designs
   - Add complexity gradually

2. **Mobile-Friendly**
   - Ensure areas are at least 60-80px wide for finger scratching
   - Leave 10-20px gaps between areas for clarity

3. **Visual Hierarchy**
   - Place important areas in prominent positions
   - Use size to indicate importance

4. **Performance**
   - Limit to 9 or fewer areas for best performance
   - Use appropriate canvas sizes (don't over-sample)

5. **Consistency**
   - Match reveal mechanic to win condition
   - Ensure mechanics align with player expectations

### Recommended Combinations

| Layout Type | Areas | Reveal Mechanic | Win Condition | Use Case |
|-------------|-------|-----------------|---------------|----------|
| Classic | 3 horizontal | `reveal-all` | `reveal-all-areas` | Traditional scratch tickets |
| Grid | 3x3 | `match-three` | `match-symbols` | Match-style games |
| Single | 1 large | `reveal-one` | `reveal-any-area` | Simple instant reveals |
| Progressive | 3-5 | `progressive` | `progressive-reveal` | Story-driven reveals |
| Dual Column | 2 vertical | `reveal-all` | `reveal-all-areas` | Side-by-side comparison |

## Examples

### Example 1: Classic Three-Row Ticket

**Configuration:**
- Layout ID: `classic-three`
- Reveal Mechanic: `reveal-all`
- Win Condition: `reveal-all-areas`
- 3 horizontal areas covering full width

**Use Case**: Traditional lottery-style scratch ticket

### Example 2: Match-3 Grid

**Configuration:**
- Layout ID: `match-grid`
- Reveal Mechanic: `match-three`
- Win Condition: `match-symbols`
- 9 areas in a 3x3 grid

**Use Case**: Symbol-matching puzzle game

### Example 3: Progressive Story Ticket

**Configuration:**
- Layout ID: `treasure-hunt`
- Reveal Mechanic: `progressive`
- Win Condition: `progressive-reveal`
- 5 areas revealing story elements

**Use Case**: Narrative-driven experience

## Troubleshooting

### Issue: Canvas doesn't show my image

**Solution:**
- Ensure image file is a valid format (PNG, JPG, GIF)
- Try refreshing the page
- Check browser console for errors

### Issue: Exported code doesn't work in game

**Solution:**
- Verify all required fields are filled
- Check that area IDs are unique
- Ensure percentages don't cause overlaps
- Validate that layout ID is valid JavaScript identifier

### Issue: Areas are too small/large in game

**Solution:**
- Adjust canvas dimensions in the area editor
- Remember: canvas size affects rendering quality, not display size
- Display size is controlled by `widthPercent` and `heightPercent`

### Issue: Scratching doesn't feel responsive

**Solution:**
- Adjust reveal threshold (lower = more responsive)
- Increase canvas size for better mask resolution
- Check that reveal mechanic matches win condition

## Technical Details

### Technology Stack

- **React 19.2**: Modern UI framework
- **TypeScript 5.9**: Type-safe development
- **Vite 7.2**: Fast build tool and dev server
- **HTML5 Canvas**: Interactive drawing and preview
- **100% Client-Side**: No backend or server required

### Browser Requirements

- Modern browsers with HTML5 Canvas support
- Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript enabled

### No Internet Required

The tool runs completely offline once installed. Perfect for:
- Air-gapped development environments
- Offline work
- Privacy-sensitive projects

## Future Enhancements

Potential features for future versions:

- [ ] Undo/Redo functionality
- [ ] Snap-to-grid for precise alignment
- [ ] Copy/paste areas
- [ ] Preset templates library
- [ ] Shape masks (circles, polygons, custom shapes)
- [ ] Live preview with actual game rendering
- [ ] Batch export multiple layouts
- [ ] Import existing layouts for editing
- [ ] Collaboration features (export/import projects)
- [ ] Animation timeline editor

## Support

### Questions or Issues?

1. Check the tool's README: `tools/layout-designer/README.md`
2. Review the main project README: `README.md`
3. Check ticket layout documentation: `TICKET_LAYOUTS.md`
4. Open an issue on GitHub

### Contributing

If you'd like to contribute improvements to the Layout Designer tool:

1. Make changes in `tools/layout-designer/`
2. Test thoroughly with `npm run dev` and `npm run build`
3. Update documentation as needed
4. Submit a pull request

## Conclusion

The Ticket Layout Designer streamlines the process of creating custom scratch-off ticket layouts. With its visual interface and instant code generation, you can quickly prototype and deploy new ticket types without manually writing complex configuration code.

Happy designing! 🎫✨
