# Scratcher Configuration Guide

This guide explains how to create and configure custom scratcher types for the Schratcho Crawler game.

## Overview

Scratchers are the tools players use to reveal prizes on scratch-off tickets. The game supports multiple scratcher types, each with unique visual styles and scratching behaviors. Scratchers are defined in `src/utils/scratchers.ts` and can be easily customized or extended.

## Scratcher Interface

Each scratcher is defined by the `Scratcher` interface:

```typescript
interface Scratcher {
  /** Unique identifier for this scratcher */
  id: string;
  
  /** Display name for this scratcher */
  name: string;
  
  /** Description of this scratcher */
  description: string;
  
  /** Emoji or symbol to display as the scratcher cursor/token */
  symbol: string;
  
  /** Scratch radius in pixels (size of the scratch area per action) */
  scratchRadius: number;
  
  /** Visual style for the scratcher overlay */
  style?: {
    /** Background color/gradient for the scratch overlay */
    overlayColor?: string;
    
    /** Pattern or texture for the overlay */
    overlayPattern?: string;
  };
}
```

## Built-in Scratcher Types

The game comes with six pre-configured scratcher types:

### 1. Gold Coin (Default)
- **ID**: `coin`
- **Symbol**: 🪙
- **Scratch Radius**: 25px (medium)
- **Overlay Color**: Purple gradient (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
- **Description**: Classic coin scratcher with balanced scratch area

### 2. Magic Brush
- **ID**: `brush`
- **Symbol**: 🖌️
- **Scratch Radius**: 35px (large)
- **Overlay Color**: Pink gradient (`linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`)
- **Description**: Wide brush for faster scratching and quick reveals

### 3. Finger
- **ID**: `finger`
- **Symbol**: 👆
- **Scratch Radius**: 20px (small)
- **Overlay Color**: Blue gradient (`linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`)
- **Description**: Precise finger scratching for controlled reveals

### 4. Golden Key
- **ID**: `key`
- **Symbol**: 🔑
- **Scratch Radius**: 15px (very small)
- **Overlay Color**: Pink-yellow gradient (`linear-gradient(135deg, #fa709a 0%, #fee140 100%)`)
- **Description**: Small key for strategic, precise scratching

### 5. Mega Eraser
- **ID**: `eraser`
- **Symbol**: 🧽
- **Scratch Radius**: 50px (very large)
- **Overlay Color**: Cyan-purple gradient (`linear-gradient(135deg, #30cfd0 0%, #330867 100%)`)
- **Description**: Massive eraser for quick reveals and fast gameplay

### 6. Fire Sword
- **ID**: `sword`
- **Symbol**: ⚔️
- **Scratch Radius**: 30px (medium-large)
- **Overlay Color**: Teal-pink gradient (`linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)`)
- **Description**: Game-themed sword scratcher with style

## Creating a Custom Scratcher

### Step 1: Define Your Scratcher

Add your scratcher definition to `src/utils/scratchers.ts`:

```typescript
export const MY_CUSTOM_SCRATCHER: Scratcher = {
  id: 'custom',
  name: 'My Custom Tool',
  description: 'A unique scratcher with special properties',
  symbol: '✨', // Choose an emoji or symbol
  scratchRadius: 30, // Choose a radius (10-60 recommended)
  style: {
    overlayColor: 'linear-gradient(135deg, #ff0000 0%, #0000ff 100%)',
    overlayPattern: 'SCRATCH', // Or custom text
  },
};
```

### Step 2: Register Your Scratcher

Add your scratcher to the `SCRATCHER_TYPES` registry:

```typescript
export const SCRATCHER_TYPES: Record<string, Scratcher> = {
  coin: COIN_SCRATCHER,
  brush: BRUSH_SCRATCHER,
  finger: FINGER_SCRATCHER,
  key: KEY_SCRATCHER,
  eraser: ERASER_SCRATCHER,
  sword: SWORD_SCRATCHER,
  custom: MY_CUSTOM_SCRATCHER, // Add your scratcher here
};
```

### Step 3: Test Your Scratcher

Your scratcher will automatically appear in the scratcher selector dropdown in the game UI. Test it with different ticket layouts to ensure it behaves as expected.

## Configuration Guidelines

### Scratch Radius

The `scratchRadius` property controls how much area is revealed with each scratch action:

- **10-15px**: Very precise, strategic scratching (like the Golden Key)
- **20-25px**: Balanced, standard scratching (like Finger or Gold Coin)
- **30-35px**: Fast, efficient scratching (like Fire Sword or Magic Brush)
- **40-50px**: Very fast, large area reveals (like Mega Eraser)
- **50+px**: Extremely fast, instant reveals (use sparingly for special scratchers)

### Overlay Colors

The `overlayColor` property accepts any valid CSS background value:

**Solid Colors:**
```typescript
overlayColor: '#667eea'
overlayColor: 'rgb(102, 126, 234)'
```

**Linear Gradients (Recommended):**
```typescript
overlayColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
overlayColor: 'linear-gradient(to right, red, blue)'
```

**Radial Gradients:**
```typescript
overlayColor: 'radial-gradient(circle, #667eea, #764ba2)'
```

**Tips:**
- Use gradients for more visually appealing overlays
- Choose colors that provide good contrast with the ticket content
- Consider using themed colors that match your scratcher's symbol
- Test on different screen sizes to ensure readability

### Overlay Pattern

The `overlayPattern` property is displayed as text on the scratch overlay:

```typescript
overlayPattern: 'SCRATCH'  // Default
overlayPattern: 'REVEAL'   // Alternative
overlayPattern: '⭐ WIN ⭐' // With emojis
overlayPattern: ''         // Empty for no text
```

### Symbol Selection

Choose emojis that visually represent your scratcher's theme:

- **Tools**: 🔧🔨🪛🗝️🔑🪚
- **Magic**: ✨🎩🪄⭐💫
- **Weapons**: ⚔️🗡️🏹🛡️
- **Nature**: 🌟🔥💧🌿🍃
- **Objects**: 💎🪙🎁🎯🎲

## Advanced Customization

### Game Progression Integration

For future game progression features, you can add custom properties to scratchers:

```typescript
export interface AdvancedScratcher extends Scratcher {
  unlockLevel?: number;      // Level required to unlock
  cost?: number;             // Cost to purchase/use
  durability?: number;       // Number of uses before wearing out
  specialAbility?: string;   // Special effect or ability
}
```

### Dynamic Scratcher Properties

You can create scratchers with dynamic behavior by calculating properties at runtime:

```typescript
export function createRandomScratcher(): Scratcher {
  const radius = 15 + Math.floor(Math.random() * 35); // 15-50px
  return {
    id: 'random',
    name: 'Random Scratcher',
    description: 'Changes every time',
    symbol: '🎲',
    scratchRadius: radius,
    style: {
      overlayColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
      overlayPattern: 'LUCKY',
    },
  };
}
```

## Best Practices

1. **Unique IDs**: Always use unique IDs for each scratcher to avoid conflicts
2. **Descriptive Names**: Use clear, descriptive names that players will understand
3. **Appropriate Radius**: Match the scratch radius to the scratcher's theme and intended gameplay style
4. **Consistent Style**: Maintain visual consistency with the game's aesthetic
5. **Test Thoroughly**: Test your scratcher with all ticket layouts (Classic, Grid, Single Area)
6. **Accessibility**: Ensure overlay colors have sufficient contrast for readability
7. **Performance**: Very large scratch radii (60+) may impact performance on older devices

## Troubleshooting

### Scratcher Not Appearing

- Verify the scratcher is added to the `SCRATCHER_TYPES` registry
- Check that the `id` is unique and doesn't conflict with existing scratchers
- Ensure the file is saved and the development server has reloaded

### Overlay Color Not Showing

- Verify the CSS gradient syntax is correct
- Test with a simple solid color first: `overlayColor: '#ff0000'`
- Check browser console for CSS errors

### Scratch Radius Too Small/Large

- Adjust the `scratchRadius` value in increments of 5px
- Test on actual devices, not just emulators
- Consider the ticket layout - smaller areas may need smaller radii

## Examples

### Example 1: Speed Scratcher
```typescript
export const SPEED_SCRATCHER: Scratcher = {
  id: 'speed',
  name: 'Lightning Bolt',
  description: 'Ultra-fast scratching for speed runs',
  symbol: '⚡',
  scratchRadius: 45,
  style: {
    overlayColor: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    overlayPattern: 'FAST',
  },
};
```

### Example 2: Precision Scratcher
```typescript
export const PRECISION_SCRATCHER: Scratcher = {
  id: 'precision',
  name: 'Laser Pointer',
  description: 'Pinpoint accuracy for careful players',
  symbol: '🔴',
  scratchRadius: 10,
  style: {
    overlayColor: 'linear-gradient(135deg, #ff0000 0%, #8b0000 100%)',
    overlayPattern: 'AIM',
  },
};
```

### Example 3: Themed Scratcher
```typescript
export const CHRISTMAS_SCRATCHER: Scratcher = {
  id: 'christmas',
  name: 'Candy Cane',
  description: 'Holiday-themed scratcher',
  symbol: '🎄',
  scratchRadius: 25,
  style: {
    overlayColor: 'repeating-linear-gradient(45deg, #ff0000, #ff0000 10px, #ffffff 10px, #ffffff 20px)',
    overlayPattern: '🎅 HO HO 🎅',
  },
};
```

## Related Documentation

- [Ticket Layouts Guide](./TICKET_LAYOUTS.md) - Learn about configuring ticket layouts
- [Main README](./README.md) - General project documentation
- [iOS Compatibility](./IOS_COMPATIBILITY.md) - Platform-specific considerations

## Contributing

When contributing new scratchers:

1. Follow the existing code style and conventions
2. Test your scratcher thoroughly on multiple devices
3. Update this documentation with your new scratcher details
4. Include screenshots in your pull request showing the scratcher in action
5. Ensure TypeScript compilation succeeds (`npm run lint`)
6. Verify the production build works (`npm run build`)

## Future Enhancements

Planned features for the scratcher system:

- Scratcher animations during use
- Particle effects for special scratchers
- Sound effects per scratcher type
- Unlockable scratchers through gameplay
- Scratcher upgrade system
- Custom scratcher creation UI
- Scratcher inventory management
