/**
 * Betting Example Ticket
 * A single-area ticket with betting enabled demonstrating the betting mechanic.
 * Uses no-win-condition for easy testing, but includes no-prize in pool to test refund mechanic.
 * 
 * This ticket showcases three bet options:
 * 1. Safe Bet (5 gold): Refundable if you lose, 2x multiplier on any win
 * 2. Medium Bet (10 gold): 3x multiplier on wins >= 100 gold
 * 3. High Roller (30 gold): 5x multiplier on wins >= 200 gold
 */

import type { TicketLayout } from '../../../mechanics/ticketLayouts';

export const BETTING_EXAMPLE_TICKET: TicketLayout = {
  id: 'betting-example',
  name: 'Betting Ticket',
  description: 'Place your bet, scratch to win - test your luck with multipliers!',
  type: 'Core',
  goldCost: 0, // Free to play, but requires a bet to scratch
  scratchAreas: [
    {
      id: 'single-area',
      topPercent: 0,
      leftPercent: 0,
      widthPercent: 1,
      heightPercent: 1,
      canvasWidth: 400,
      canvasHeight: 270,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'no-win-condition',
  ticketWidth: 500,
  ticketHeight: 300,
  // Prize pool with a good mix of values to test betting thresholds
  prizeConfigs: [
    { prizeId: 'grand-prize', weight: 1 },     // 1000 gold - Rare, tests high multipliers
    { prizeId: 'gold-coins', weight: 2 },      // 500 gold - Tests high threshold
    { prizeId: 'crown', weight: 3 },           // 200 gold - Tests medium/high threshold
    { prizeId: 'treasure-chest', weight: 4 },  // 250 gold - Tests medium/high threshold
    { prizeId: 'lucky-star', weight: 5 },      // 150 gold - Tests medium threshold
    { prizeId: 'diamond', weight: 6 },         // 100 gold - Tests low/medium threshold
    { prizeId: 'fire-sword', weight: 8 },      // 75 gold - Tests low threshold
    { prizeId: 'magic-potion', weight: 10 },   // 50 gold - Tests low threshold
    { prizeId: 'shield', weight: 12 },         // 25 gold - Common, tests safe bet
    { prizeId: 'no-prize', weight: 15 },       // No prize - Tests refund mechanic
  ],
  // Betting configuration with three options
  bettingConfig: {
    enabled: true,
    betOptions: [
      {
        order: 1,
        betAmount: 5,
        description: 'Double any win',
        minPrizeThreshold: 0, // Works on any win
        winMultiplier: 2,
        isRefundable: true,
        badge: 'Safe Bet',
      },
      {
        order: 2,
        betAmount: 10,
        description: 'Triple wins ≥ 100 gold',
        minPrizeThreshold: 100,
        winMultiplier: 3,
        isRefundable: false,
      },
      {
        order: 3,
        betAmount: 30,
        description: '5x wins ≥ 200 gold',
        minPrizeThreshold: 200,
        winMultiplier: 5,
        isRefundable: false,
        badge: 'High Roller',
      },
    ],
    insufficientFundsMessage: 'You need at least 5 gold to play this ticket!',
  },
};
