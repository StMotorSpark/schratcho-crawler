# Ticket Layout Configuration Guide

This guide explains how to create and configure custom ticket layouts for the Schratcho Crawler game.

## Overview

The ticket layout system provides a flexible way to define different types of scratch-off tickets with:
- **Configurable scratch areas**: Position, size, and shape of each scratchable region
- **Prize reveal mechanics**: How prizes are displayed across different areas
- **Win conditions**: What constitutes a winning ticket

## Table of Contents

1. [Basic Concepts](#basic-concepts)
2. [Ticket Layout Structure](#ticket-layout-structure)
3. [Scratch Area Configuration](#scratch-area-configuration)
4. [Reveal Mechanics](#reveal-mechanics)
5. [Win Conditions](#win-conditions)
6. [Creating Custom Layouts](#creating-custom-layouts)
7. [Built-in Layouts](#built-in-layouts)
8. [Examples](#examples)

## Basic Concepts

### Layout Components

A ticket layout consists of:
1. **Scratch Areas**: Regions that can be scratched to reveal content
2. **Reveal Mechanic**: Determines what is shown in each area
3. **Win Condition**: Defines what makes a ticket a winner

### Coordinate System

- Positions use **percentage-based coordinates** (0-1 range)
- `0` represents the top/left edge
- `1` represents the bottom/right edge
- Example: `topPercent: 0.5` means 50% from the top

## Ticket Layout Structure

A `TicketLayout` object has the following structure:

```typescript
interface TicketLayout {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // Description of the layout
  scratchAreas: ScratchAreaConfig[];  // Array of scratch area configs
  revealMechanic: RevealMechanic;     // How prizes are revealed
  winCondition: WinCondition;         // What counts as a win
  ticketWidth: number;           // Ticket width in pixels (for reference)
  ticketHeight: number;          // Ticket height in pixels (for reference)
}
```

## Scratch Area Configuration

Each scratch area is defined by a `ScratchAreaConfig`:

```typescript
interface ScratchAreaConfig {
  id: string;              // Unique identifier for this area
  topPercent: number;      // Vertical position (0-1)
  leftPercent: number;     // Horizontal position (0-1)
  widthPercent: number;    // Width as percentage of ticket (0-1)
  heightPercent: number;   // Height as percentage of ticket (0-1)
  canvasWidth: number;     // Canvas width in pixels for mask
  canvasHeight: number;    // Canvas height in pixels for mask
  revealThreshold: number; // Percentage (0-100) to consider revealed
}
```

### Position and Size

- **Position**: Use `topPercent` and `leftPercent` to set the area's position
- **Size**: Use `widthPercent` and `heightPercent` to set the area's dimensions
- **Canvas Size**: Should be proportional to the display size for good quality

### Example: Centered Square Area

```typescript
{
  id: 'center-area',
  topPercent: 0.25,      // Start 25% from top
  leftPercent: 0.25,     // Start 25% from left
  widthPercent: 0.5,     // Take up 50% of width
  heightPercent: 0.5,    // Take up 50% of height
  canvasWidth: 200,      // 200x200 pixel canvas
  canvasHeight: 200,
  revealThreshold: 50    // 50% scratched = revealed
}
```

## Reveal Mechanics

Reveal mechanics determine how prizes are displayed across areas:

### `reveal-all`
Shows the same prize in all areas. Best for classic tickets where all areas must be revealed.

```typescript
revealMechanic: 'reveal-all'
```

**Use case**: Traditional scratch tickets where consistency builds anticipation.

### `reveal-one`
Shows the prize in only one area (typically the first/main area).

```typescript
revealMechanic: 'reveal-one'
```

**Use case**: Single-area tickets or tickets where only one area matters.

### `progressive`
Shows different parts of the prize in different areas progressively.

```typescript
revealMechanic: 'progressive'
```

**Progressive reveals**:
- Area 0: Shows only emoji
- Area 1: Shows emoji + name
- Area 2: Shows emoji + name + value

**Use case**: Building suspense by revealing information gradually.

### `match-three`
Shows symbols that must match to win. Typically used with grid layouts.

```typescript
revealMechanic: 'match-three'
```

**Use case**: Match-3 style games where three symbols must align.

### `match-two`
Similar to match-three but only requires two matching symbols.

```typescript
revealMechanic: 'match-two'
```

**Use case**: Lower difficulty matching games.

## Win Conditions

Win conditions determine what makes a ticket a winner:

### `reveal-all-areas`
Player must scratch all areas to win.

```typescript
winCondition: 'reveal-all-areas'
```

**Best paired with**: `reveal-all` mechanic

### `reveal-any-area`
Player wins as soon as any single area is revealed.

```typescript
winCondition: 'reveal-any-area'
```

**Best paired with**: `reveal-one` mechanic

### `match-symbols`
Player wins if symbols match according to the reveal mechanic.

```typescript
winCondition: 'match-symbols'
```

**Best paired with**: `match-three` or `match-two` mechanics

### `progressive-reveal`
Player wins when the last area is revealed.

```typescript
winCondition: 'progressive-reveal'
```

**Best paired with**: `progressive` mechanic

## Creating Custom Layouts

### Step 1: Define the Layout

Create a new `TicketLayout` object in `src/utils/ticketLayouts.ts`:

```typescript
export const MY_CUSTOM_TICKET: TicketLayout = {
  id: 'my-custom',
  name: 'My Custom Ticket',
  description: 'A custom ticket layout',
  scratchAreas: [
    // Define your scratch areas here
  ],
  revealMechanic: 'reveal-all',
  winCondition: 'reveal-all-areas',
  ticketWidth: 500,
  ticketHeight: 300,
};
```

### Step 2: Add Scratch Areas

Define each scratchable region:

```typescript
scratchAreas: [
  {
    id: 'area-1',
    topPercent: 0,
    leftPercent: 0,
    widthPercent: 0.5,
    heightPercent: 1,
    canvasWidth: 200,
    canvasHeight: 300,
    revealThreshold: 50,
  },
  {
    id: 'area-2',
    topPercent: 0,
    leftPercent: 0.5,
    widthPercent: 0.5,
    heightPercent: 1,
    canvasWidth: 200,
    canvasHeight: 300,
    revealThreshold: 50,
  },
]
```

### Step 3: Register the Layout

Add your layout to the `TICKET_LAYOUTS` registry:

```typescript
export const TICKET_LAYOUTS: Record<string, TicketLayout> = {
  classic: CLASSIC_TICKET,
  grid: GRID_TICKET,
  single: SINGLE_AREA_TICKET,
  'my-custom': MY_CUSTOM_TICKET,  // Add your layout here
};
```

### Step 4: Use the Layout

In your component:

```typescript
import { getTicketLayout } from './utils/ticketLayouts';

const layout = getTicketLayout('my-custom');
```

## Built-in Layouts

### Classic Ticket

Three horizontal areas - the original demo layout.

```typescript
const layout = getTicketLayout('classic');
```

**Configuration**:
- 3 horizontal scratch areas
- `reveal-all` mechanic
- `reveal-all-areas` win condition

### Grid Ticket

3x3 grid of scratch areas for match-style games.

```typescript
const layout = getTicketLayout('grid');
```

**Configuration**:
- 9 areas in a 3x3 grid
- `match-three` mechanic
- `match-symbols` win condition

### Single Area Ticket

One large scratch area covering the entire ticket.

```typescript
const layout = getTicketLayout('single');
```

**Configuration**:
- 1 large scratch area
- `reveal-one` mechanic
- `reveal-any-area` win condition

## Examples

### Example 1: Two Column Layout

```typescript
export const TWO_COLUMN_TICKET: TicketLayout = {
  id: 'two-column',
  name: 'Two Column Ticket',
  description: 'Two side-by-side scratch areas',
  scratchAreas: [
    {
      id: 'left-column',
      topPercent: 0,
      leftPercent: 0,
      widthPercent: 0.5,
      heightPercent: 1,
      canvasWidth: 200,
      canvasHeight: 270,
      revealThreshold: 50,
    },
    {
      id: 'right-column',
      topPercent: 0,
      leftPercent: 0.5,
      widthPercent: 0.5,
      heightPercent: 1,
      canvasWidth: 200,
      canvasHeight: 270,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'reveal-all',
  winCondition: 'reveal-all-areas',
  ticketWidth: 500,
  ticketHeight: 300,
};
```

### Example 2: Centered Circle (using a square approximation)

```typescript
export const CENTERED_TICKET: TicketLayout = {
  id: 'centered',
  name: 'Centered Ticket',
  description: 'Single centered scratch area',
  scratchAreas: [
    {
      id: 'center',
      topPercent: 0.2,    // 20% from top
      leftPercent: 0.2,   // 20% from left
      widthPercent: 0.6,  // 60% width
      heightPercent: 0.6, // 60% height
      canvasWidth: 240,
      canvasHeight: 180,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'reveal-one',
  winCondition: 'reveal-any-area',
  ticketWidth: 500,
  ticketHeight: 300,
};
```

### Example 3: Progressive Five Areas

```typescript
export const PROGRESSIVE_FIVE_TICKET: TicketLayout = {
  id: 'progressive-five',
  name: 'Progressive Five Areas',
  description: 'Five areas revealing prize information progressively',
  scratchAreas: [
    // Top area - just emoji
    {
      id: 'top',
      topPercent: 0,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 0.2,
      canvasWidth: 400,
      canvasHeight: 60,
      revealThreshold: 50,
    },
    // Middle three areas - shows name
    {
      id: 'mid-left',
      topPercent: 0.2,
      leftPercent: 0,
      widthPercent: 0.333,
      heightPercent: 0.6,
      canvasWidth: 130,
      canvasHeight: 180,
      revealThreshold: 50,
    },
    {
      id: 'mid-center',
      topPercent: 0.2,
      leftPercent: 0.333,
      widthPercent: 0.333,
      heightPercent: 0.6,
      canvasWidth: 130,
      canvasHeight: 180,
      revealThreshold: 50,
    },
    {
      id: 'mid-right',
      topPercent: 0.2,
      leftPercent: 0.666,
      widthPercent: 0.334,
      heightPercent: 0.6,
      canvasWidth: 130,
      canvasHeight: 180,
      revealThreshold: 50,
    },
    // Bottom area - shows value
    {
      id: 'bottom',
      topPercent: 0.8,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 0.2,
      canvasWidth: 400,
      canvasHeight: 60,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'progressive',
  winCondition: 'progressive-reveal',
  ticketWidth: 500,
  ticketHeight: 300,
};
```

## Tips and Best Practices

### Canvas Size

- Make canvas dimensions proportional to the display area
- Higher resolution = better quality but more memory
- Typical range: 100-400 pixels per dimension

### Reveal Threshold

- **50%**: Standard threshold, good balance
- **30-40%**: Easier, less scratching required
- **60-70%**: Harder, more complete scratching needed

### Layout Design

1. **Keep it simple**: Start with 1-3 areas, add complexity gradually
2. **Test on mobile**: Ensure areas are large enough for finger scratching
3. **Consider aspect ratio**: Maintain proportions across different screen sizes
4. **Leave gaps**: Small gaps between areas improve visual clarity

### Performance

- More areas = more canvas operations = higher memory usage
- Limit to 9 or fewer areas for best performance
- Use appropriate canvas sizes (don't over-sample)

## Troubleshooting

### Areas not appearing
- Check that percentages sum correctly (widthPercent + leftPercent ≤ 1)
- Verify canvas dimensions are positive numbers

### Areas overlapping unexpectedly
- Check position and size calculations
- Ensure percentages don't exceed 1.0

### Scratching not working
- Verify canvas dimensions match the area size proportionally
- Check that the area has a valid maskCanvas

### Win condition not triggering
- Ensure win condition matches reveal mechanic
- Check reveal threshold isn't too high
- Verify all areas are properly configured

## API Reference

### Functions

#### `getTicketLayout(id: string): TicketLayout`
Retrieves a ticket layout by ID.

```typescript
const layout = getTicketLayout('classic');
```

#### `evaluateWinCondition(layout: TicketLayout, revealedAreas: Set<string>, matchData?: { symbols: string[]; matches: number }): boolean`
Evaluates if the current ticket state is a winner.

```typescript
const isWinner = evaluateWinCondition(
  layout,
  new Set(['area-1', 'area-2']),
);
```

#### `getPrizeDisplayForArea(layout: TicketLayout, areaIndex: number, prize: Prize): { emoji: string; name: string; value: string }`
Determines what prize information to display in a specific area.

```typescript
const display = getPrizeDisplayForArea(layout, 0, prize);
// Returns: { emoji: '🏆', name: 'Grand Prize', value: '$1000' }
```

## Future Enhancements

Potential additions to the layout system:

1. **Shape masks**: Support for circular, triangular, or custom shapes
2. **Animations**: Different reveal animations per area
3. **Interactive elements**: Areas that trigger special effects
4. **Dynamic generation**: Procedurally generated layouts
5. **Theme support**: Different visual styles per layout
6. **Difficulty levels**: Adjust thresholds based on player skill

## Questions?

For more information or assistance with custom layouts, please refer to the main README.md or open an issue on GitHub.
