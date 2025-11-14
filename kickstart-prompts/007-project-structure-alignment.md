# Overview
The current state of the project demonstrates a technical implementation of the key gameplay mechanics:
- Dynamic Scratch off tickets
- Basic random reward generation
- Dynamic Scratcher tokens for user interaction

These are presented via a simple UI that allows quick testing of the behaviors and mechanics, but lacks a cohesive structure and alignment with the overall project goals.

To facilitate the actual game development process, we would like to do some restructuring of key components to enable easier development of the core game (using what we have built technically) and enabling repurposing core logic for the React Native mobile app.

# Requirements
1. **Adjust project structure**: Restructure the project to separate mechanics, game logic, and UI rendering.
    - Separate existing `/src/utils` to a new `/core/mechanics` folder
    - Create a new `/core/game-logic` folder for game-specific logic
    - Repurpose `/src` folder to indicate the React web app only
2. **Add React Native support**: Set up the project to support React Native development alongside the existing React web app.
    - Create a new `/mobile` folder for React Native specific components and screens
    - Ensure shared logic from `/core` can be imported into both web and mobile projects
3. **Maintain existing functionality**: Ensure that the current demo functionality remains intact after restructuring.
    - Verify that dynamic scratch tickets, reward generation, and scratcher interactions work as before in the web app
4. **Documentation**: Provide clear documentation on the new project structure and how to add new features in both web and mobile contexts.
    - Update README files to reflect changes
    - Include examples of how to use shared logic in both web and mobile projects

# Out of Scope
- React Native UI implementation for the mobile app (this is basic boiler plate and planning only)
- Full game logic development (focus is on structure and enabling future development)
- Backend integration or persistence mechanisms

# Definition of Done
- [ ] Project restructured according to requirements
- [ ] Limited React Native project setup completed
- [ ] Existing web app functionality verified to be intact
- [ ] Documentation created for new project structure and usage