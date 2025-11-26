# Overview
As we have continued to develop the core game loop (ticket purchasing, scratching, and prize claiming), we have identified the need to update the ticket prize logic to better align with our vision of prize management. We would like individual tickets to support a subset of prizes instead of all tickets sharing the same prize pool. This will allow for more diverse and engaging gameplay experiences.

In addition, the ticket layout definition should also include chances for each prize associated with that ticket. This will enable game developers to create tickets with varying levels of prize rarity and excitement.

# Technical Details
Currently, the ticket prize logic is handled via `core/mechanics/prizes.ts -> getRandomPrize()` function which is used in `web/App.tsx`. Ideally, we would like to have the ticket layout define which prizes are available for that ticket, and the prize logic to be updated accordingly.

This change may require some tighter integration between the dev tools and the `/core/game-logic` folders.

# Requirements
1.  **Update Ticket Layout Schema**:
    *   Modify the ticket layout schema to include a list of prize IDs that are associated with each ticket layout.
    *   Include chances or weights for each prize to define their rarity.
2.  **Update Prize Retrieval Logic**:
    *   Update the `getRandomPrize()` function to accept a ticket layout parameter and retrieve prizes based on the associated prize IDs for that layout.
3.  **Modify Ticket Purchasing Logic**:
    *   Ensure that when a ticket is purchased, it is linked to the correct ticket layout and its associated prizes.
4.  **Update Ticket Scratching Logic**:
    *   Modify the ticket scratching logic to use the updated prize retrieval logic, ensuring that prizes are awarded based on the ticket layout.
5.  **Testing and Validation**:
    *   Conduct thorough testing to ensure that the updated prize logic functions correctly and is free of bugs.
    *   Gather feedback from game developers to validate the usability and functionality of the new prize logic.
6.  **Dev tooling updates**:
    *   Update any relevant dev tooling (e.g., ticket layout editor) to support the new prize association feature.

# Out of Scope
- Major changes to the core prize management system beyond the scope of ticket-prize associations.
- Frontend UI changes unrelated to the ticket prize logic.

# Definition of Done
- [ ] Ticket layout schema is updated to include prize associations.
- [ ] Prize retrieval logic is modified to support ticket layout-based prize selection.
- [ ] Ticket purchasing and scratching logic is updated to utilize the new prize logic.
- [ ] Thorough testing is completed, and any bugs are resolved.
- [ ] Relevant dev tooling is updated to support the new prize association feature.