# Overview
With recent changes, we now have a structured project that separates core mechanics and game logic from platform-specific implementations (web and mobile), but we do not have a strong example of how game assets and logic will be structured or used across platforms. Ahead of diving into the core game development, we would like to demonstrate the use of game assets (ticket images, sound effects) and their integration with core mechanics will work.

# Additional Contexts
- We have added an example ticket asset that we would like to see as a working example of a game logic that directly uses core mechanics.
    - We have added an art asset for the ticket `core/game-logic/tickets/basic-goblinGold/basic-goblinGold-ticketAsset.png` that contains the art for a scratch ticket.
    - The art asset includes yellow squares that we want used as the scratch areas.
    - The ticket is intended to be a "Goblin Gold" themed ticket with a fantasy theme.
- We would like to see a working implementation of the ticket in the web app that uses core mechanics.
- Sound effects should be treated as a separate game asset and NOT integrated in any way with individual ticket logic, but should be used to enhance the gameplay experience.
    - This means that (in the future) multiple tickets can share the same sound effects without duplicating code or assets. But we do want to have other groups of tickets that may use different sound effects.


# Requirements
1. **Implement Ticket Layout Logic**: Create a ticket layout configuration for the "Goblin Gold" ticket using core mechanics.
    - Define scratch areas based on the yellow squares in the provided ticket asset.
    - Set up win conditions and prize assignments for the ticket.
2. **Integrate Ticket into Web App**: Modify the web application to include the "Goblin Gold" ticket as a selectable option.
    - Ensure the ticket can be created, displayed, and interacted with using existing scratcher mechanics.
    - Verify that the ticket behaves correctly (scratching, revealing prizes, win detection).
3. **Add Sound Effects**: Integrate appropriate sound effects for scratching and winning using core sound mechanics.
    - Use or create sound effects that fit the fantasy theme of the ticket.
    - Ensure sound effects play at the correct times during gameplay.
4. **Documentation**: Update documentation to explain how the ticket layout was implemented and how it integrates with core mechanics.
    - Include details on how to add new ticket layouts in the future.

# Definition of Done
- [x] "Goblin Gold" ticket layout implemented in core game logic
- [x] Ticket integrated and functional in the web app
- [x] Sound effects added and functioning correctly (using existing sound mechanics)
- [x] Documentation updated with implementation details

# Implementation Summary

## Goblin Gold Ticket Implementation

The Goblin Gold ticket has been successfully implemented as a working example of how game assets and logic integrate with core mechanics.

### Key Implementation Details

**Ticket Layout Configuration** (`core/game-logic/tickets/basic-goblinGold/goblinGoldLayout.ts`)
- Created a `TicketLayout` configuration with 10 scratch areas
- Areas are positioned to align with the yellow/golden squares in the ticket artwork
- Configured as a 2x5 grid (2 rows, 5 columns)
- Uses `match-three` reveal mechanic with `match-symbols` win condition
- Background image: `basic-goblinGold-ticketAsset.png` (1024 x 1536 pixels)

**Scratch Area Positioning**
- Calculated positions based on the 1024x1536 pixel artwork
- Row 1: Areas at ~44.47% from top
- Row 2: Areas at ~58.46% from top
- Each area: 127px wide × 130px tall (~12.7% × 8.46% of ticket)
- Horizontal spacing maintains proper alignment with artwork

**Integration Points**
1. Added `backgroundImage` property to `TicketLayout` interface in `core/mechanics/ticketLayouts.ts`
2. Registered Goblin Gold ticket in `TICKET_LAYOUTS` registry
3. Updated `ScratchTicketCSS` component to support background images
4. Added CSS styles for tickets with background artwork
5. Maintains proper aspect ratio (2:3) for the ticket display

**Sound Effects**
- Uses existing `soundManager` from `core/mechanics/sounds.ts`
- Scratch sounds play during scratching interaction
- Win sound plays when match condition is met
- No ticket-specific sound implementation needed (as per requirements)

### How It Works

1. **Selection**: User selects "Goblin Gold" from the ticket layout dropdown
2. **Display**: Component renders the goblin artwork as background with 10 scratch areas overlaid on the golden squares
3. **Interaction**: User scratches areas to reveal prize symbols
4. **Win Condition**: When three matching symbols are revealed, the player wins
5. **Feedback**: Sound effects enhance the gameplay experience

### Adding Future Tickets

To add new tickets following this pattern:

1. Create artwork with clearly defined scratch areas (recommended: use contrasting colors)
2. Measure scratch area positions in pixels and convert to percentages
3. Create a `TicketLayout` configuration in `core/game-logic/tickets/[ticket-name]/`
4. Set appropriate `revealMechanic` and `winCondition` for gameplay style
5. Add `backgroundImage` path to the configuration
6. Register in `TICKET_LAYOUTS` in `core/mechanics/ticketLayouts.ts`

The ticket will automatically appear in the dropdown and work with all existing scratchers.