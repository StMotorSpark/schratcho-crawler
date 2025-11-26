# Overview
Now that we have the basics game mechanics working along with the game dev tooling in place, we need to implement user state tracking to enhance the user experience and enable features like progress saving, analytics, and personalized content.

# Requirements
1.  **User Progress Tracking**:
    *   Implement a system to track user progress through the game, including levels completed, scores, and achievements.
    *   Store this data locally (e.g., using `localStorage` or IndexedDB). In the future we may want to sync this with a backend, but for now local storage is sufficient.
2.  **Session Management**:
    *   Track user sessions to understand how often users return to the game and how long they play in each session.
    *   Implement session timeout logic (e.g., consider a session ended after 30 minutes of inactivity).
3.  **Analytics Integration**:
    *   Integrate a basic analytics system to log key user actions (e.g., level starts, level completions, in-game purchases).
    *   Ensure that analytics data is anonymized and complies with privacy regulations.
4.  **Personalized Content**:
    *   Use tracked user data to personalize the game experience, such as recommending levels based on past performance or unlocking content based on achievements.
5.  **Data Persistence**:
    *   Ensure that user state data persists across browser sessions and is resilient to page reloads.
    *   Implement data backup and restore functionality to allow users to recover their progress if needed.

# Other Details
We need the state tracking to be implemented as part of the `core` module so that it can be easily accessed and utilized by other parts of the game. The implementation should be modular and extensible to allow for future enhancements, such as backend synchronization or more advanced analytics.

User Progress Tracking should be designed to allow for additions or enhancements as the game evolves. For example, we may want to add new types of achievements or track additional metrics in the future.

## Known data to track
We want the User Progress tracking to be split into a few key areas:
- Achievements: Track which achievements the user has unlocked.
- User State: Track things like current gold, available tickets, available scratchers, etc.

## Integration into existing features
Some of the key User Progress Tracking are currently known and are something that we want to start testing. The Primary one is `userState.currentGold` which is used in the ticket purchasing flow. This will be used to purchase tickets. Tickets will also add to `userState.currentGold` when they win specific prizes. We want to ensure that this value is persisted and updated correctly as users earn or spend gold.

Because of this, it might be useful to think about how we define prizes as a way to:
- Update a given user state value (like currentGold)
- Unlock an achievement
- Define a value for the state
- Define how the value is applied (additive, set value, reduce, etc)

These prize properties also need to be integrated into the ticket resolution flow so that when a ticket is resolved, the appropriate user state updates and achievements are applied.

The prize properties also need to be added to the configuration tooling.

# Out of Scope
- Backend synchronization of user state.
- Advanced analytics dashboards or reporting.
- Social features or multiplayer aspects.

# Definition of Done
- [ ] User progress is tracked and stored locally.
- [ ] Session management is implemented with timeout logic.
- [ ] Basic analytics integration is in place, logging key user actions.
- [ ] Personalized content features are functional based on tracked data.
- [ ] Data persistence is verified across browser sessions and page reloads.
- [ ] Documentation is provided for the user state tracking system, including how to access and utilize it within the game.
- [ ] Prize properties are defined and integrated into the ticket resolution flow.
- [ ] Ticket purchasing flow correctly updates and persists `userState.currentGold`.
- [ ] Configuration tooling is updated to include prize properties.
- [ ] Unit and integration tests are written to ensure the reliability of the user state tracking system.