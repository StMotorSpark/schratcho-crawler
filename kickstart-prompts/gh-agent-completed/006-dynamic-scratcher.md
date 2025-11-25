# Overview
Now that we have completed the work around dynamic ticket layouts and logic, we would like to add dynamic scratchers. Currently, the scratcher graphics and logic are hardcoded into the component. Part of the fundamental game design is to have different types of scratchers that can be swapped out based on game strategy and player progression.

# Requirements
1. **Dynamic Scratcher Types**: Implement a system to define different scratcher types dynamically
    - Scratcher types should be editable via configuration (e.g., JSON or TypeScript objects)
2. **Multiple Scratcher Designs**: Support multiple scratcher designs with different graphics and behaviors
    - Each scratcher design should be independently defined in terms of appearance and scratching mechanics
3. **User Selection**: Allow players to select their desired scratcher type before starting a new ticket
    - This is temporary and will be replaced with game logic in the future
4. **Maintain Current Functionality**: Ensure existing demo features remain intact
    - Preserve sound effects, haptic feedback, and completion detection
    - Existing demo should use a default scratcher type
5. **Documentation**: Provide clear documentation on how to define new scratcher types
    - Include examples of different scratcher configurations

# Implementation Plan
1. **Define Scratchers**: Create a configuration for different scratcher types, including their graphics, behavior, and any unique properties.
    - plan on static graphics (no animation requirements)
    - Scratchers could include different shapes, sizes, and visual styles
    - Scratchers may also adjust the size of the scratch area or the way scratching is detected
2. **Dynamic Loading**: Modify the `ScratchTicketCSS` component to accept a scratcher type prop and load the appropriate graphics and logic based on the selected type.
3. **User Interface**: Update the UI to allow players to select their desired scratcher type before starting a new ticket.
4. **Testing**: Ensure that all scratcher types function correctly and provide a fun and engaging experience for players.

By implementing dynamic scratchers, we can enhance the gameplay experience and provide players with more choices and strategies as they progress through the game.

# Out of Scope
- Full game logic for scratcher selection based on player progression
- Backend persistence of scratcher preferences
- Complex UI/UX for scratcher selection menu

# Definition of Done
- [ ] Dynamic scratcher system implemented
- [ ] Support for multiple scratcher designs
- [ ] User interface for selecting scratcher types
- [ ] Existing demo functionality verified to be intact
- [ ] Documentation created for defining new scratcher types