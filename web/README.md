# Web App

React web application for Schratcho Crawler.

## Overview

This directory contains the web-specific implementation of Schratcho Crawler using React, TypeScript, and Vite. The web app imports shared game mechanics from `/core` and implements web-specific UI components.

## Structure

```
web/
├── components/              # React components
│   ├── ScratchTicketCSS.tsx # Main scratch ticket component
│   ├── Settings.tsx         # Settings modal
│   └── Settings.css         # Settings styles
├── App.tsx                  # Main application component
├── App.css                  # Application styles
├── main.tsx                 # Application entry point
├── index.css                # Global styles
└── README.md               # This file
```

## Development

### Starting the Dev Server

```bash
npm run dev
```

The app will be available at http://localhost:5173/

### Building for Production

```bash
npm run build
```

### Previewing Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run lint
```

## Using Shared Core Mechanics

The web app imports game mechanics from `/core`:

```typescript
// In web components
import { getRandomPrize, type Prize } from '../core/mechanics/prizes';
import { getTicketLayout, TICKET_LAYOUTS } from '../core/mechanics/ticketLayouts';
import { getScratcher, SCRATCHER_TYPES } from '../core/mechanics/scratchers';
```

## Key Components

### `App.tsx`
Main application component that:
- Manages ticket state (prize, completion)
- Handles layout and scratcher selection
- Provides UI for creating new tickets
- Shows settings modal

### `ScratchTicketCSS.tsx`
Core scratch ticket component that:
- Implements CSS masking for scratch-off effect
- Handles mouse and touch events
- Manages multiple scratch areas
- Detects win conditions
- Plays sound effects

### `Settings.tsx`
Settings modal that:
- Displays browser capabilities
- Shows haptic and audio support status
- Provides helpful information for users

## CSS Architecture

The web app uses plain CSS with:
- **CSS Masking** for scratch-off effects
- **Hardware Acceleration** via transforms
- **Responsive Design** for mobile and desktop
- **Game-themed Styling** with vibrant colors

## Platform-Specific Features

### Web Audio API
Sound effects are implemented using the Web Audio API:
- Scratch sounds during interaction
- Win sounds on completion
- iOS-compatible (resumes on user interaction)

### CSS Masking
Scratch-off effect uses native CSS masking:
- Canvas-based mask generation
- Dynamic mask updates
- GPU-accelerated rendering

### Touch Support
Full touch event support:
- Touch and mouse events
- Prevents scroll interference
- Smooth interaction on mobile browsers

## Performance Considerations

- **60fps target** during interactions
- **Throttled sound effects** to avoid overwhelming
- **Efficient pixel checking** (every 10th pixel)
- **Batched state updates** for smooth rendering

## Adding New Features

When adding features to the web app:

1. **Use Core Mechanics** - Import from `/core/mechanics` instead of duplicating
2. **Keep UI Separate** - Game logic goes in `/core`, UI goes in `/web`
3. **Follow React Patterns** - Use hooks, functional components
4. **Maintain Type Safety** - Use TypeScript types from core
5. **Test in Browser** - Verify on desktop and mobile browsers

## Browser Support

The web app supports:
- **Modern browsers** - Chrome, Firefox, Safari, Edge
- **Mobile browsers** - iOS Safari, Chrome Mobile
- **CSS Masking** - Required for scratch-off effect
- **Web Audio API** - Optional, degrades gracefully

## Deployment

The web app can be deployed to:
- **GitHub Pages** - Via manual workflow
- **Netlify/Vercel** - Static site hosting
- **Any static host** - Just deploy the `dist/` folder

See main README.md for deployment instructions.
