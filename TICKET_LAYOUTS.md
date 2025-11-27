# Ticket Layout Configuration Guide

This guide explains how to create and configure custom ticket layouts for the Schratcho Crawler game.

## Overview

The ticket layout system provides a flexible way to define different types of scratch-off tickets with:
- **Configurable scratch areas**: Position, size, and shape of each scratchable region
- **Independent prizes**: Each scratch area contains its own unique prize
- **Win conditions**: What constitutes a winning ticket (matching, thresholds, etc.)

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

### New Architecture: Independent Prizes Per Area

The current system generates **one prize per scratch area**. This enables:
- Authentic scratch-off mechanics where players discover different prizes under each area
- True matching gameplay (match-two, match-three, etc.)
- More engaging ticket designs with varied prizes
- Simple, intuitive win conditions

### Layout Components

A ticket layout consists of:
1. **Scratch Areas**: Regions that can be scratched to reveal content
2. **Reveal Mechanic**: Use `'independent'` for one prize per area (recommended)
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
  revealMechanic: RevealMechanic;     // Use 'independent' for new tickets
  winCondition: WinCondition;         // What counts as a win
  ticketWidth: number;           // Ticket width in pixels (for reference)
  ticketHeight: number;          // Ticket height in pixels (for reference)
  goldCost?: number;             // Cost in gold to purchase (default: 5)
  prizeConfigs?: PrizeConfig[];  // Prize pool configuration
  targetPrizeId?: string;        // For 'find-one' win condition
  valueThreshold?: number;       // For 'total-value-threshold' win condition
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

The reveal mechanic determines how prizes are displayed in each scratch area:

### `independent` (Recommended)

Each scratch area contains its own unique prize. This is the recommended mechanic for all new tickets.

```typescript
revealMechanic: 'independent'
```

**Benefits**:
- Authentic scratch-off experience
- Each area shows different prizes
- Enables true match-based gameplay
- More engaging and varied tickets

**Display behavior**:
- For matching games (`match-two`, `match-three`, `match-all`): Shows only emoji
- For other conditions: Shows emoji, name, and value

### Legacy Mechanics (Deprecated)

The following mechanics are maintained for backward compatibility but should not be used for new tickets:

- `reveal-all`: Same prize in all areas
- `reveal-one`: Prize in only one area
- `progressive`: Different parts of prize in different areas
- `match-three`, `match-two`: Legacy matching (use `independent` with new win conditions instead)

## Win Conditions

Win conditions determine what makes a ticket a winner. The new conditions work with arrays of prizes (one per scratch area):

### `no-win-condition`
Player always "wins" - just reveals what they got. Good for budget tickets.

```typescript
winCondition: 'no-win-condition'
```

**Use case**: Budget tickets, always-win tickets, simple reveal tickets.

### `match-two`
Player wins when two revealed areas have matching prize emojis.

```typescript
winCondition: 'match-two'
```

**Use case**: Easy matching games, two-column layouts.

### `match-three`
Player wins when three revealed areas have matching prize emojis.

```typescript
winCondition: 'match-three'
```

**Use case**: Classic match-3 gameplay, grid layouts.

### `match-all`
Player wins when ALL areas have matching prize emojis. Jackpot condition!

```typescript
winCondition: 'match-all'
```

**Use case**: Jackpot tickets, high-risk/high-reward gameplay.

### `find-one`
Player wins when they reveal a specific prize (defined by `targetPrizeId`).

```typescript
winCondition: 'find-one',
targetPrizeId: 'diamond'  // Must find this prize to win
```

**Use case**: "Find the Diamond" style tickets.

### `total-value-threshold`
Player wins when the combined gold value of revealed prizes exceeds the threshold.

```typescript
winCondition: 'total-value-threshold',
valueThreshold: 100  // Must reveal prizes worth 100+ gold
```

**Use case**: "High Roller" tickets, accumulation-based gameplay.

### Legacy Win Conditions (Deprecated)

The following are maintained for backward compatibility:

- `reveal-all-areas`: Must scratch all areas
- `reveal-any-area`: Win on any reveal
- `match-symbols`: Legacy matching
- `progressive-reveal`: Win on final area

**Best paired with**: `progressive` mechanic

## Creating Custom Layouts

### Step 1: Define the Layout

Create a new `TicketLayout` object in `core/game-logic/tickets/`:

```typescript
export const MY_CUSTOM_TICKET: TicketLayout = {
  id: 'my-custom',
  name: 'My Custom Ticket',
  description: 'A custom ticket layout with match-3 gameplay',
  goldCost: 10,
  scratchAreas: [
    // Define your scratch areas here
  ],
  revealMechanic: 'independent',  // Recommended for all new tickets
  winCondition: 'match-three',    // Choose appropriate win condition
  ticketWidth: 500,
  ticketHeight: 300,
  prizeConfigs: [
    { prizeId: 'diamond', weight: 5 },
    { prizeId: 'gold-coins', weight: 3 },
    { prizeId: 'magic-potion', weight: 10 },
  ],
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

### Step 3: Configure Prizes

Define which prizes are available and their relative weights:

```typescript
prizeConfigs: [
  { prizeId: 'grand-prize', weight: 1 },   // Rare (1/20 = 5%)
  { prizeId: 'gold-coins', weight: 3 },    // Uncommon (3/20 = 15%)
  { prizeId: 'diamond', weight: 6 },       // Common (6/20 = 30%)
  { prizeId: 'shield', weight: 10 },       // Very common (10/20 = 50%)
]
```

### Step 4: Register the Layout

Add your layout to the `TICKET_LAYOUTS` registry in `core/mechanics/ticketLayouts.ts`:

```typescript
import { MY_CUSTOM_TICKET } from '../game-logic/tickets/my-custom';

export const TICKET_LAYOUTS: Record<string, TicketLayout> = {
  classic: CLASSIC_TICKET,
  grid: GRID_TICKET,
  single: SINGLE_AREA_TICKET,
  'my-custom': MY_CUSTOM_TICKET,  // Add your layout here
};
```

### Step 5: Use the Layout

In your component:

```typescript
import { getTicketLayout, generateAreaPrizes } from './core/mechanics/ticketLayouts';

const layout = getTicketLayout('my-custom');
const areaPrizes = generateAreaPrizes(layout);  // One prize per area
```

## Built-in Layouts

### Classic Ticket

Three horizontal areas with match-three gameplay.

```typescript
const layout = getTicketLayout('classic');
```

**Configuration**:
- 3 horizontal scratch areas
- `independent` mechanic
- `match-three` win condition
- Cost: 5 gold

### Grid Ticket

3x3 grid of scratch areas for match-three games.

```typescript
const layout = getTicketLayout('grid');
```

**Configuration**:
- 9 areas in a 3x3 grid
- `independent` mechanic
- `match-three` win condition
- Cost: 10 gold

### Single Area Ticket

One large scratch area - always wins!

```typescript
const layout = getTicketLayout('single');
```

**Configuration**:
- 1 large scratch area
- `independent` mechanic
- `no-win-condition` (always wins)
- Cost: 3 gold

### Goblin Gold Ticket

Fantasy-themed ticket with 10 scratch areas.

```typescript
const layout = getTicketLayout('goblin-gold');
```

**Configuration**:
- 10 areas in 2x5 grid
- `independent` mechanic
- `match-three` win condition
- Custom background image
- Cost: 15 gold

## Examples

### Example 1: Match-Two Column Layout

```typescript
export const TWO_COLUMN_TICKET: TicketLayout = {
  id: 'two-column',
  name: 'Two Column Ticket',
  description: 'Two side-by-side scratch areas - match two to win',
  goldCost: 5,
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
  revealMechanic: 'independent',
  winCondition: 'match-two',  // Win when both columns match!
  ticketWidth: 500,
  ticketHeight: 300,
  prizeConfigs: [
    { prizeId: 'diamond', weight: 5 },
    { prizeId: 'gold-coins', weight: 3 },
    { prizeId: 'shield', weight: 10 },
  ],
};
```

### Example 2: Budget Ticket (Always Wins)

```typescript
export const BUDGET_TICKET: TicketLayout = {
  id: 'budget',
  name: 'Budget Ticket',
  description: 'Single centered scratch area - always wins!',
  goldCost: 3,
  scratchAreas: [
    {
      id: 'center',
      topPercent: 0.2,
      leftPercent: 0.2,
      widthPercent: 0.6,
      heightPercent: 0.6,
      canvasWidth: 240,
      canvasHeight: 180,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'no-win-condition',  // Always wins!
  ticketWidth: 500,
  ticketHeight: 300,
  prizeConfigs: [
    { prizeId: 'magic-potion', weight: 10 },
    { prizeId: 'shield', weight: 15 },
  ],
};
```

### Example 3: Find The Diamond

```typescript
export const FIND_DIAMOND_TICKET: TicketLayout = {
  id: 'find-diamond',
  name: 'Find The Diamond',
  description: 'Find the hidden diamond to win big!',
  goldCost: 8,
  scratchAreas: [
    // 5 areas in a row
    { id: 'area-1', topPercent: 0.3, leftPercent: 0.05, widthPercent: 0.15, heightPercent: 0.4, canvasWidth: 100, canvasHeight: 100, revealThreshold: 50 },
    { id: 'area-2', topPercent: 0.3, leftPercent: 0.22, widthPercent: 0.15, heightPercent: 0.4, canvasWidth: 100, canvasHeight: 100, revealThreshold: 50 },
    { id: 'area-3', topPercent: 0.3, leftPercent: 0.39, widthPercent: 0.15, heightPercent: 0.4, canvasWidth: 100, canvasHeight: 100, revealThreshold: 50 },
    { id: 'area-4', topPercent: 0.3, leftPercent: 0.56, widthPercent: 0.15, heightPercent: 0.4, canvasWidth: 100, canvasHeight: 100, revealThreshold: 50 },
    { id: 'area-5', topPercent: 0.3, leftPercent: 0.73, widthPercent: 0.15, heightPercent: 0.4, canvasWidth: 100, canvasHeight: 100, revealThreshold: 50 },
  ],
  revealMechanic: 'independent',
  winCondition: 'find-one',
  targetPrizeId: 'diamond',  // Must find this to win
  ticketWidth: 500,
  ticketHeight: 300,
  prizeConfigs: [
    { prizeId: 'diamond', weight: 2 },      // Rare - the target!
    { prizeId: 'magic-potion', weight: 10 },
    { prizeId: 'shield', weight: 15 },
  ],
};
```

### Example 4: High Roller Threshold

```typescript
export const HIGH_ROLLER_TICKET: TicketLayout = {
  id: 'high-roller',
  name: 'High Roller',
  description: 'Reveal prizes worth 100+ gold to win!',
  goldCost: 20,
  scratchAreas: [
    // 3x2 grid
    { id: 'area-1', topPercent: 0.1, leftPercent: 0.05, widthPercent: 0.28, heightPercent: 0.35, canvasWidth: 120, canvasHeight: 90, revealThreshold: 50 },
    { id: 'area-2', topPercent: 0.1, leftPercent: 0.36, widthPercent: 0.28, heightPercent: 0.35, canvasWidth: 120, canvasHeight: 90, revealThreshold: 50 },
    { id: 'area-3', topPercent: 0.1, leftPercent: 0.67, widthPercent: 0.28, heightPercent: 0.35, canvasWidth: 120, canvasHeight: 90, revealThreshold: 50 },
    { id: 'area-4', topPercent: 0.55, leftPercent: 0.05, widthPercent: 0.28, heightPercent: 0.35, canvasWidth: 120, canvasHeight: 90, revealThreshold: 50 },
    { id: 'area-5', topPercent: 0.55, leftPercent: 0.36, widthPercent: 0.28, heightPercent: 0.35, canvasWidth: 120, canvasHeight: 90, revealThreshold: 50 },
    { id: 'area-6', topPercent: 0.55, leftPercent: 0.67, widthPercent: 0.28, heightPercent: 0.35, canvasWidth: 120, canvasHeight: 90, revealThreshold: 50 },
  ],
  revealMechanic: 'independent',
  winCondition: 'total-value-threshold',
  valueThreshold: 100,  // Must reveal 100+ gold worth
  ticketWidth: 500,
  ticketHeight: 300,
  prizeConfigs: [
    { prizeId: 'grand-prize', weight: 1 },  // 1000 gold
    { prizeId: 'gold-coins', weight: 2 },   // 500 gold
    { prizeId: 'treasure-chest', weight: 3 }, // 250 gold
    { prizeId: 'diamond', weight: 5 },      // 100 gold
    { prizeId: 'magic-potion', weight: 10 }, // 50 gold
    { prizeId: 'shield', weight: 15 },      // 25 gold
  ],
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
- For matching conditions, ensure enough areas can match
- For `find-one`, verify `targetPrizeId` is in `prizeConfigs`
- For `total-value-threshold`, ensure prizes can reach the threshold
- Check reveal threshold isn't too high

## API Reference

### Functions

#### `getTicketLayout(id: string): TicketLayout`
Retrieves a ticket layout by ID.

```typescript
const layout = getTicketLayout('classic');
```

#### `generateAreaPrizes(layout: TicketLayout): Prize[]`
Generates an array of prizes, one for each scratch area.

```typescript
const areaPrizes = generateAreaPrizes(layout);
// Returns array with one prize per scratch area
```

#### `evaluateWinCondition(layout: TicketLayout, revealedAreas: Set<string>, areaPrizes?: Prize[]): boolean`
Evaluates if the current ticket state is a winner.

```typescript
const isWinner = evaluateWinCondition(
  layout,
  new Set(['area-1', 'area-2', 'area-3']),
  areaPrizes,  // Array of prizes for each area
);
```

#### `getPrizeDisplayForArea(layout: TicketLayout, areaIndex: number, prize: Prize): { emoji: string; name: string; value: string }`
Determines what prize information to display in a specific area.

```typescript
const areaPrize = areaPrizes[0];  // Get the prize for this specific area
const display = getPrizeDisplayForArea(layout, 0, areaPrize);
// Returns: { emoji: '🏆', name: 'Grand Prize', value: '1000 Gold' }
```

#### `countPrizeMatches(prizes: Prize[]): Record<string, number>`
Counts how many times each prize emoji appears.

```typescript
const matches = countPrizeMatches(revealedPrizes);
// Returns: { '🏆': 2, '💎': 1 }
```

#### `getMaxMatchCount(prizes: Prize[]): number`
Gets the highest number of matching prizes.

```typescript
const maxMatches = getMaxMatchCount(revealedPrizes);
// Returns: 2 (if two prizes match)
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
