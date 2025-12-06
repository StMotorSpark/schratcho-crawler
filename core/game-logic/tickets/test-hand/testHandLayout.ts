/**
 * Test Hand Ticket
 * A single scratch zone hand ticket for testing hand effects
 * 
 * This ticket type is designed to be scratched only when the player
 * has an active hand (at least one core ticket in hand).
 */

import type { TicketLayout } from '../../../mechanics/ticketLayouts';

export const TEST_HAND_TICKET: TicketLayout = {
  id: 'test-hand',
  name: 'Test Hand Ticket',
  description: 'A hand ticket with special effects - requires an active hand to scratch',
  type: 'Hand',
  goldCost: 8,
  scratchAreas: [
    {
      id: 'single-area',
      topPercent: 0.2,
      leftPercent: 0.15,
      widthPercent: 0.7,
      heightPercent: 0.6,
      canvasWidth: 350,
      canvasHeight: 180,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'no-win-condition',
  ticketWidth: 500,
  ticketHeight: 300,
  // Hand ticket prize pool - mix of standard and hand effect prizes
  prizeConfigs: [
    // Standard gold prizes (can be included in hand tickets too)
    { prizeId: 'magic-potion', weight: 5 },      // 50 Gold
    { prizeId: 'shield', weight: 8 },            // 25 Gold
    
    // Hand effect prizes
    { prizeId: 'hand-gold-boost', weight: 10 },        // +100 to hand (common)
    { prizeId: 'hand-prior-multiply', weight: 10 },    // ×1.5 prior (common)
    { prizeId: 'hand-diff-conditional', weight: 4 },   // Diff effect (uncommon)
    { prizeId: 'hand-mega-multiplier', weight: 1 },    // ×10 hand (very rare)
  ],
};
