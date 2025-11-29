# Overview
We would like to implement the next key game mechnic, a Hand. The basic idea is that players can choose to cash out a ticket, or create/add it to a hand that would allow them to cash out multiple tickets at once for a higher total prize. This would add an additional layer of strategy to the game, as players would need to decide whether to cash out immediately or risk waiting for a potentially larger reward. Future facing, we also anticipate dedicated hand tickets that would be designed specifically for this mechanic with unique prizes like "multiply total hand value by 2x" or "add a bonus prize to the hand".

## Basic Hand Game Flow
- From the Inventory page a use selects a card to scratch
- After scratching the ticket, if they have won a prize, they are presented with two options:
    - Cash Out Ticket: Claim the prize immediately and add it to their inventory. (This is the current flow)
    - Add to Hand: Instead of claiming the prize immediately, the user can choose to add the ticket to their hand.
- If the user chooses to add the ticket to their hand:
    - The ticket is added to a temporary hand collection.
    - The user is returned to the inventory page where they can select another ticket
- Once a hand is created, any additional ticket scratched can ONLY be added to the hand, not cashed out individually.
- The user can view their current hand at any time useing the "🖐" button (displayed as a floating button at the bottom left) when in the inventory or scratch page
- Hands can only hold up to 5 tickets.
- When viewing the hand, the user has two options:
    - Cash Out Hand: The total prize from all tickets in the hand is calculated and awarded to the user. The hand is then cleared.
    - Continue Scratching: The user can return to the inventory to scratch more tickets and add them to the hand (up to the limit of 5 tickets).
- Once a user adds the 5th ticket to their hand, they must cash out the hand before scratching any more tickets.
- The hand should be saved in the user state so that if they navigate away from the page or refresh, their hand is preserved.

# Technical Details
To implement the hand game mechanic, we will need to make several changes to the existing codebase:
1. **Data Structure**: Create a new data structure to represent a Hand, which will hold multiple tickets and their associated prizes.
2. **Inventory Page**: scratch page modifications to allow users to add tickets to a hand instead of cashing out immediately.
3. **Hand Management**: Implement logic to manage the hand, including adding tickets, calculating total prizes, and enforcing the maximum ticket limit.
4. **User Interface**: Design and implement UI components for viewing and managing the hand, including the floating "🖐" button and the hand view modal.
5. **Prize Calculation**: Update the prize calculation logic to handle cashing out a hand, summing the prizes from all tickets in the hand.
6. **Testing**: Thoroughly test the new hand mechanic to ensure it works as intended and does not introduce any bugs into the existing game flow.

# Requirements
1. Implement a Hand data structure to hold multiple tickets and their prizes.
2. Update the Inventory and Scratch pages to allow users to add tickets to a hand.
3. Create a floating "🖐" button for accessing the hand view from the Inventory and Scratch pages.
4. Implement the hand view modal to display the current hand, allow cashing out the hand, or continuing to scratch tickets.
5. Enforce a maximum limit of 5 tickets per hand.
6. Update prize calculation logic to handle cashing out a hand.
7. Ensure the hand is saved in the user state to preserve it across navigation or page refreshes.
8. Conduct thorough testing to ensure the hand mechanic functions correctly.

# Out of Scope
- Advanced UI/UX design and styling beyond basic functionality.
- Backend integration for user accounts or persistent storage.
- Complex prize mechanics specific to dedicated hand tickets.

# Definition of Done
- [ ] Hand data structure is implemented.
- [ ] Inventory and Scratch pages are updated to support adding tickets to a hand.
- [ ] Floating "🖐" button is created and functional.
- [ ] Hand view modal is implemented with cash out and continue scratching options.
- [ ] Maximum ticket limit per hand is enforced.
- [ ] Prize calculation logic is updated for hand cash outs.
- [ ] Hand state is preserved across navigation and page refreshes.
- [ ] Complete end-to-end testing of the hand mechanic with no critical bugs.