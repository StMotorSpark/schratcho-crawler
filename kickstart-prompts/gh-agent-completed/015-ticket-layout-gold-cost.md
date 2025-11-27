# Overview
With recent updates to track user state, including gold and ticket management, we need to ensure that the ticket layout system properly integrates with these features. Ticket layouts should be updated to allow for game devs to define the cost in gold for each ticket type. We should also update the web app to allow users to see and purchase tickets based on their current gold balance.

While we are still developing, it would also be nice to updated the web app settings gear to include a button to reset user state for testing purposes.

# Requirements
1.  **Ticket Layout Gold Cost Integration**:
    *   Update the ticket layout configuration to include a `goldCost` property for each ticket type.
    *   Ensure that the `goldCost` is displayed in the ticket layout editor within the game dev tooling.
2.  **Purchase Flow Update**:
    *   Modify the ticket purchasing flow to check the user's current gold balance before allowing a purchase.
    *   Deduct the appropriate amount of gold from the user's balance upon successful ticket purchase.
    *   Display an error message if the user does not have enough gold to purchase the selected ticket.
3.  **UI Updates**:
    *   Update the ticket purchasing UI to show the `goldCost` for each ticket type.
    *   Display the user's current gold balance prominently in the ticket purchasing interface.
    *   Add a reset user state button in the web app settings gear that allows users to clear their progress for testing purposes.
4.  **Testing and Validation**:
    *   Conduct thorough testing to ensure that the gold cost integration works correctly in all scenarios.
    *   Validate that the ticket purchasing flow correctly updates the user's gold balance and handles insufficient funds appropriately.
    *   Test the reset user state button in the web app settings gear to ensure it functions correctly.

# Out of Scope
- Changes to the core ticket layout design or functionality beyond gold cost integration.
- Backend changes or integrations related to user accounts or gold management.

# Definition of Done
- [ ] Ticket layout configuration includes a `goldCost` property for each ticket type.
- [ ] Ticket layout editor in the game dev tooling displays and allows editing of the `goldCost`.
- [ ] Ticket purchasing flow checks and deducts gold correctly.
- [ ] UI displays ticket `goldCost` and user's current gold balance.
- [ ] Thorough testing is completed, and any bugs are resolved.
- [ ] Documentation is updated to reflect changes in ticket layout and purchasing flow.
- [ ] Reset user state button in the web app settings gear functions correctly.