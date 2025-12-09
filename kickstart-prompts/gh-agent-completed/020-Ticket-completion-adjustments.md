# Overview
With recent updates to enable the Hand game mechanic and opening up player testing, we have noticed a few quality-of-life improvements that can be made to the ticket completion experience. As a user is scratching off their ticket a winning reveal properly displays the buttons to either "Add to Hand" or "Cash Out" depending on the game mode and feels really good. However, if a ticket has been fully scratched off and does NOT result in a win condition (based on the current rules), the user is left with no clear next step.

# Desired Behavior
When a user fully scratches off a ticket and does not win a prize, we would like to implement the following behavior:
- After the final scratch is revealed and it is determined that the ticket is a non-winning ticket
    - Display a message indicating that the ticket did not win a prize (e.g., "Sorry, this ticket did not win. Better luck next time!")
    - Provide a quick set of buttons to guide the user on what to do next:
        - If the user has another copy of the same ticket in their inventory, provide a button to "Scratch Another [Ticket Name]" that immediately takes them to scratch another ticket of the same type.
        - Always provide a button to "Return to Inventory" that takes the user back to their inventory page.

# Technical Details
To implement the desired behavior for non-winning tickets, we will need to make the following changes to the existing codebase:
1. **Ticket Scratch Logic**: Update the ticket scratch logic to check for non-winning conditions after the final scratch is revealed.
2. **User Interface**: Design and implement UI components to display the non-winning message and the appropriate buttons based on the user's inventory.
3. **Navigation Logic**: Implement navigation logic for the "Scratch Another [Ticket Name]" and "Return to Inventory" buttons to ensure they function correctly.
4. **Testing**: Thoroughly test the new non-winning ticket behavior to ensure it works as intended and does not introduce any bugs into the existing game flow.

# Requirements
1. Update ticket scratch logic to detect non-winning tickets.
2. Design and implement a non-winning message UI component.
3. Implement "Scratch Another [Ticket Name]" button functionality if the user has another copy of the same ticket.
4. Implement "Return to Inventory" button functionality.
5. Ensure proper navigation for both buttons.
6. Conduct thorough testing to ensure the non-winning ticket behavior functions correctly.

# Out of Scope
- Changes to winning ticket behavior or UI.
- Backend integration for user accounts or persistent storage.
- Advanced UI/UX design and styling beyond basic functionality.

# Definition of Done
- [ ] Ticket scratch logic is updated to detect non-winning tickets.
- [ ] Non-winning message UI component is designed and implemented.
- [ ] "Scratch Another [Ticket Name]" button is implemented and functional.
- [ ] "Return to Inventory" button is implemented and functional.
- [ ] Proper navigation for both buttons is ensured.
- [ ] Complete end-to-end testing of the non-winning ticket behavior with no critical bugs.