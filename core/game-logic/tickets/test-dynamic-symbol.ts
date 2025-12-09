/**
 * Test Dynamic Symbol Ticket Layout
 * 
 * This ticket demonstrates the new 'find-one-dynamic' win condition.
 * The player must first scratch the top center area to reveal the winning symbol,
 * then scratch other areas to find a matching symbol.
 * 
 * Generated for testing the find-one-dynamic win condition feature
 * Date: 2025-12-09
 */

import type { TicketLayout } from '../../mechanics/ticketLayouts';

export const TEST_DYNAMIC_SYMBOL_TICKET: TicketLayout = {
  id: 'test-dynamic-symbol',
  name: 'Dynamic Symbol Finder',
  description: 'Reveal the winning symbol, then find it in another area to win!',
  type: 'Core',
  goldCost: 8,
  scratchAreas: [
    // Top center - winning symbol area (wider to stand out)
    {
      id: 'winning-symbol',
      topPercent: 0.05,
      leftPercent: 0.25,
      widthPercent: 0.5,
      heightPercent: 0.25,
      canvasWidth: 250,
      canvasHeight: 75,
      revealThreshold: 50,
    },
    // Bottom left
    {
      id: 'area-1',
      topPercent: 0.4,
      leftPercent: 0.05,
      widthPercent: 0.27,
      heightPercent: 0.5,
      canvasWidth: 135,
      canvasHeight: 150,
      revealThreshold: 60,
    },
    // Bottom center
    {
      id: 'area-2',
      topPercent: 0.4,
      leftPercent: 0.365,
      widthPercent: 0.27,
      heightPercent: 0.5,
      canvasWidth: 135,
      canvasHeight: 150,
      revealThreshold: 60,
    },
    // Bottom right
    {
      id: 'area-3',
      topPercent: 0.4,
      leftPercent: 0.68,
      widthPercent: 0.27,
      heightPercent: 0.5,
      canvasWidth: 135,
      canvasHeight: 150,
      revealThreshold: 60,
    },
  ],
  revealMechanic: 'independent',
  winCondition: 'find-one-dynamic',
  ticketWidth: 500,
  ticketHeight: 300,
  // Winning symbol area - this is where the target symbol is revealed
  winningSymbolAreaId: 'winning-symbol',
  // Prize pool with good variety for matching
  prizeConfigs: [
    { prizeId: 'grand-prize', weight: 1 },
    { prizeId: 'gold-coins', weight: 3 },
    { prizeId: 'diamond', weight: 5 },
    { prizeId: 'treasure-chest', weight: 4 },
    { prizeId: 'magic-potion', weight: 8 },
    { prizeId: 'lucky-star', weight: 5 },
    { prizeId: 'golden-key', weight: 3 },
    { prizeId: 'fire-sword', weight: 6 },
    { prizeId: 'shield', weight: 10 },
    { prizeId: 'crown', weight: 2 },
  ],
};
