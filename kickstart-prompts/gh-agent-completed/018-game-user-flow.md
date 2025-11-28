# Overview
Now that we have completed work on the core game mechanics, we need to start working on the basic game flow for users. Currently, the web application is a single page where users can purchase and scratch tickets, but there is no structured flow or navigation. We want to implement a simple multi-page flow based on the below game flow description.

## Basic Game Flow
- Users start on a "Store" page where they can see available tickets to purchase.
- Each ticket displays its layout, gold cost, and a "Purchase" button.
    - Users should be able to purchase a single ticket or a stack of 5 tickets at once.
- Purchased tickets are added to the user's inventory.
- At any time, a user can navigate to their "Inventory" page to view their owned tickets.
- From the Inventory page, users can select a ticket to "Scratch Off".
- When users go to scratch a ticket, they are taken to the "Scratch" page where they can interactively scratch off the ticket areas.
    - Currently, when a ticket "win" condition is met, the prize is automatically awarded, this should be adjusted. We would like the ticket to show the prize(s) won but not automatically add them to the user's inventory. Users will need to claim the prize(s) from the scratcher page using a "Turn In Ticket" button.
    - The turn in ticket button should only be enabled once the ticket has been fully scratched off.
- After scratching off a ticket and claiming any prizes, users are returned to their Inventory page.
- In the inventory page, users can return back to the Store to purchase more tickets.
- The header showing current gold balance should be visible on all pages.

# Technical Details
To implement this game flow, we will need to create multiple pages/components in the web application:
1. **Store Page**: Lists available tickets with purchase options.
2. **Inventory Page**: Displays owned tickets and allows selection for scratching.
3. **Scratch Page**: Interactive ticket scratching interface with prize claiming functionality.

We will also need to implement navigation between these pages and ensure that the user's gold balance and ticket inventory are properly managed across the different views.

# Requirements
1. Create a Store page that lists all available tickets with their layout, gold cost, and purchase buttons.
2. Implement functionality to purchase single tickets or stacks of 5 tickets, updating the user's gold balance and inventory accordingly.
3. Create an Inventory page that displays all owned tickets and allows users to select a ticket to scratch.
4. Develop a Scratch page where users can interactively scratch off the selected ticket.
5. Implement a "Turn In Ticket" button on the Scratch page that allows users to claim their prizes after fully scratching off the ticket.
6. Ensure proper navigation between Store, Inventory, and Scratch pages.
7. Maintain visibility of the user's current gold balance on all pages
8. Test the entire game flow to ensure a smooth user experience without bugs.

# Out of Scope
- Advanced UI/UX design and styling beyond basic functionality.
- Backend integration for user accounts or persistent storage.
- Complex prize claiming mechanics beyond the basic "Turn In Ticket" functionality.

# Definition of Done
- [ ] Store page is implemented with ticket listings and purchase functionality.
- [ ] Inventory page is created to display owned tickets and allow selection for scratching.
- [ ] Scratch page is developed with interactive scratching and prize claiming features.
- [ ] Navigation between Store, Inventory, and Scratch pages is functional.
- [ ] User's gold balance is visible and correctly updated on all pages.
- [ ] Complete end-to-end testing of the game flow with no critical bugs.