# Overview
The current implementation of the scratch-off mechanic uses a hybrid approach where a hidden `<canvas>` is used to track the scratch state, which is then converted to a Data URL (`toDataURL()`) and applied as a CSS `mask-image` to an overlay `<div>`.

While this approach allowed for easy styling of the scratch overlay, our analysis has identified significant performance bottlenecks, particularly on mobile devices:
1.  **Performance**: Converting the canvas to a Data URL on every frame (during a scratch event) is computationally expensive and causes garbage collection stutter.
2.  **Flickering**: The asynchronous nature of updating the DOM with a new image source can cause visual flickering on some devices.
3.  **Complexity**: The `ScratchTicketCSS.tsx` component has become monolithic, handling UI rendering, canvas manipulation, input handling, and game logic simultaneously.

We need to refactor this to use a more performant direct Canvas rendering approach and clean up the code architecture.

# Requirements

1.  **Replace CSS Masking with Direct Canvas Rendering**:
    *   Instead of updating a CSS mask, render the "scratch overlay" (the image/gradient that gets scratched away) directly onto a `<canvas>` element.
    *   Use the Canvas API's `globalCompositeOperation = 'destination-out'` to "erase" pixels from this visible canvas when the user scratches.
    *   This removes the need for `toDataURL()` and DOM updates during the scratch interaction, leading to 60fps performance.

2.  **Refactor `ScratchTicketCSS.tsx`**:
    *   Break down the monolithic component.
    *   Extract the "scratchable surface" logic into a reusable React Hook (e.g., `useScratchCanvas`) or a dedicated sub-component.
    *   Separate the **Game Logic** (checking win conditions, tracking revealed percentage) from the **Rendering/Interaction Logic** (handling touch events, drawing lines).

3.  **Optimize Canvas Management**:
    *   Ensure canvas elements are sized correctly and memory is managed efficiently.
    *   Avoid re-creating canvas elements unnecessarily on every render.

4.  **Maintain Visual Fidelity**:
    *   The visual output should look identical (or better) to the current version.
    *   Support the existing `Scratcher` types (brush size, shape) and `TicketLayout` configurations.

5.  **Mobile Optimization**:
    *   Ensure touch events are handled passively where appropriate to prevent scrolling while scratching.
    *   Verify that the "flickering" issue is resolved.

# Out of Scope
- Changing the game rules or win conditions.
- Adding new ticket types (unless needed for testing).
- Backend integration.

# Definition of Done
- [ ] `ScratchTicketCSS.tsx` is refactored and significantly smaller/cleaner.
- [ ] The CSS `mask-image` implementation is removed.
- [ ] A visible `<canvas>` is used for the scratch overlay.
- [ ] Scratching feels smooth (60fps) on both desktop and mobile simulators.
- [ ] No visual flickering occurs during scratching.
- [ ] Existing "Goblin Gold" and "Classic" tickets still work exactly as before.
