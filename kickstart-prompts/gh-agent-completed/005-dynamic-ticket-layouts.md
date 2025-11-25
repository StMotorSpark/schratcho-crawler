# Overview
Now that we have made some good progress on the demo, we would like to start some prep work needed for the future core game design. The future game will have a variety of tickets that will have different:
- scratch area layouts
- prize reveal mechanics
- win conditions

# Goals
- Create a flexible architecture for defining ticket layouts
- Allow easy addition of new ticket types in the future
- Maintain current demo functionality while refactoring

# Requirements
1. **Dynamic Ticket Layouts**: Implement a system to define ticket layouts dynamically
    - Ticket format should be editable via configuration (e.g., JSON or TypeScript objects)
2. **Multiple Scratch Areas**: Support tickets with varying numbers of scratch areas
    - Each scratch area should be independently defined in terms of position, size, and shape
3. **Prize Reveal Mechanics**: Allow different prize reveal mechanics (e.g., reveal all, reveal one)
    - Each mechanic should be configurable per ticket type
4. **Win Conditions**: Support different win conditions based on ticket type
    - Win conditions should be definable in the ticket configuration
5. **Maintain Current Functionality**: Ensure existing demo features remain intact
    - Preserve sound effects, haptic feedback, and completion detection
    - Existing demo should use a new ticket layout configuration
6. **Documentation**: Provide clear documentation on how to define new ticket layouts
    - Include examples of different ticket configurations

# Definition of Done
- [ ] Dynamic ticket layout system implemented
- [ ] Support for multiple scratch areas per ticket
- [ ] Configurable prize reveal mechanics
- [ ] Configurable win conditions
- [ ] Existing demo functionality verified to be intact
- [ ] Documentation created for defining new ticket layouts