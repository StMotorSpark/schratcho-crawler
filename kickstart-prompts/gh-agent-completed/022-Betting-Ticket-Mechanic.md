# Overview
To further add gambling options to the existing scratch off mechanic, we would like to add an additional feature that allows players to bet on the outcome of a scratch off ticket. This feature will be enabled or disabled at a ticket level. If enabled, players will be required to place a bet before they can scratch off the ticket. The ticket configuration will include a set of 3 pre-defined bet limits (ex: 5, 10, 30). The bet limits will be displayed to the player for selection (possible as buttons), and the selected bet amount will be deducted from the player's balance before the ticket is scratched off. Each of the 3 bet options will be associated with an expected outcome. For example:
- bet X (5 for example) for a winning ticket, if the ticket is a winner add 2x the bet amount to the ticket's winnings.
- bet X (10 for example) for a winning ticket above a certain threshold, if the ticket is a winner, multiple the amount won by a given multiplier (ex: 2x, 3x, etc.).
- bet X (30 for example) for a winning ticket above a certain threshold (larger than the previous threshold), if the ticket is a winner, multiple the amount won by a given multiplier (ex: 2x, 3x, etc.).

# Desired Behavior
1. **Enable/Disable Betting on Tickets**: The ticket configuration should include a flag to enable or disable betting on the ticket.
2. **Display Bet Limits**: If betting is enabled, display the 3 pre-defined bet limits to the player for selection along with the effects of the win.
3. **Deduct Bet Amount**: Deduct the selected bet amount from the player's balance before the ticket is scratched off.
4. **Determine Winning Amount**: If the ticket is a winner, calculate the winning amount based on the selected bet amount and the expected outcome.
    -  the winning amount for this type of ticket should work like any other ticket and can be cahsed out or added to the hand for the next round.
5. **Handle Non-Winning Tickets**: If the ticket is not a winner, the bet amount is lost and the ticket is scratched off.

# Implementation Steps
1. **Update Ticket Configuration**: Add a flag to the ticket configuration to enable or disable betting on the ticket.
2. **Add Bet Limits to Ticket Configuration**: Add a set of 3 pre-defined bet limits to the ticket configuration.
3. **Display Bet Limits to Player**: If betting is enabled, display the bet limits to the player for selection.
4. **Deduct Bet Amount**: Deduct the selected bet amount from the player's balance before the ticket is scratched off.
5. **Determine Winning Amount**: If the ticket is a winner, calculate the winning amount based on the selected bet amount and the expected outcome.
6. **Handle Non-Winning Tickets**: If the ticket is not a winner, the bet amount is lost and the ticket is scratched off.
7. **Allow the ticket (with updated winning amount) to standard ticket flow**: The ticket with updated winning can be cashed out or added to the hand for the next round.
8. **Test and Validate**: Test the new feature to ensure it works as expected and validate the functionality.

# Out of scope
- The implementation of the scratch off mechanic itself.
- The implementation of the player's balance management system.
- The implementation of the ticket's winning calculation for non-bet tickets.
- adjustments to the odds calculations for the scratch off tickets.

# Definition of done
- The ticket configuration includes a flag to enable or disable betting on the ticket.
- The ticket configuration includes a set of 3 limits that can be configured by the game dev.
- The bet limits are displayed to the player for selection if betting is enabled.
- The selected bet amount is deducted from the player's balance before the ticket is scratched off.
- The winning amount is calculated based on the selected bet amount and the expected outcome if the ticket is a winner.
- The bet amount is lost if the ticket is not a winner.
- The ticket with the updated winning amount can be cashed out or added to the hand for the next round.
- The new feature has been thoroughly tested and validated.
- The implementation is well-documented and follows best practices.
- An example bet ticket configuration has been created for testing purposes with example bet limits and expected outcomes.