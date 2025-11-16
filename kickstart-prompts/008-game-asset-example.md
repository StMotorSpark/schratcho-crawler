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
- [ ] "Goblin Gold" ticket layout implemented in core game logic
- [ ] Ticket integrated and functional in the web app
- [ ] Sound effects added and functioning correctly
- [ ] Documentation updated with implementation details