# Overview
Currently, we allow players to purchase scratch off tickets from a single in-game store. To enhance the gaming experience and provide more variety, we would like to implement a multi-store concept. This feature will allow players to access multiple stores, each offering a unique selection of scratch off tickets with different themes, price points, and odds. Stores will allow for better organization of tickets and provide players with more choices when selecting tickets to play. Stores should also be configured with a required total gold amount to unlock access, encouraging players to engage more with the game to unlock new stores. The stores will have no direct impact to the inventory screen, but should display info on where a ticket was purchased when viewing ticket details in the inventory.

The store selection page should show the ticket price ranges available in each store, as well as any unlock requirements. Players should be able to navigate between stores and view the tickets available in each store. The multi-store concept should be designed to be easily extendable, allowing for the addition of new stores in the future. Tickets may be shared between stores, allowing for flexibility in ticket offerings.

# Desired Behavior
1. **Landing page**: The existing landing page should not change much, but it should now include a "Stores" button that takes players to the multi-store selection screen.
2. **Store Selection Screen**: Players should see a list of available stores, each with a name, description, and an unlock requirement (if applicable). Locked stores should display the required gold amount to unlock.
3. **Store Unlocking**: Players can unlock stores based on their total gold amount. Once unlocked, the store should be accessible from the store selection screen.
4. **Store-Specific Ticket Listings**: Each store should display its own selection of scratch off tickets. Players can browse and purchase tickets from the selected store.
5. **Navigation**: Players should be able to easily navigate back to the store selection screen from any store.
6. **Persistence**: The game should remember which stores the player has unlocked and display them accordingly on the store selection screen.

# Implementation Steps
1. **Update Landing Page**: Add a "Stores" button to the existing landing page.
2. **Create Store Selection Screen**: Design and implement a new screen that lists all available stores with their details and unlock requirements.
3. **Implement Store Unlocking Logic**: Add functionality to check the player's total gold amount and unlock stores accordingly.
4. **Store-Specific Ticket Listings**: Modify the ticket purchasing flow to display tickets based on the selected store.
5. **Navigation**: Implement navigation logic to allow players to move between the store selection screen and individual stores.
6. **Persistence**: Ensure that the game saves and loads the player's unlocked stores correctly.

# Out of scope
- Changes to the ticket purchasing flow beyond displaying store-specific tickets.
- Modifications to the inventory screen or ticket details view.
- Changes to the player's gold earning mechanics.

# Definition of done
- The landing page includes a "Stores" button that navigates to the store selection screen.
- The store selection screen displays all available stores with their names, descriptions, and unlock requirements.
- Players can unlock stores based on their total gold amount.
- Each store displays its own selection of scratch off tickets.
- Players can navigate between the store selection screen and individual stores.
- The game correctly saves and loads the player's unlocked stores.