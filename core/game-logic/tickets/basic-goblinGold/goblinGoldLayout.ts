/**
 * Goblin Gold Ticket Layout Configuration
 * 
 * A fantasy-themed scratch ticket featuring a goblin treasure hunter.
 * The ticket has 10 scratch areas arranged in 2 rows of 5, designed for match-3 gameplay.
 */

import type { TicketLayout } from '../../../mechanics/ticketLayouts';
import goblinGoldAsset from './basic-goblinGold-ticketAsset.png';

/**
 * Goblin Gold ticket layout - 10 areas in 2x5 grid for match-3 gameplay
 * Asset dimensions: 1024 x 1536 pixels (2:3 aspect ratio)
 */
export const GOBLIN_GOLD_TICKET: TicketLayout = {
  id: 'goblin-gold',
  name: 'Goblin Gold',
  description: 'Fantasy-themed ticket with 10 scratch areas - match three symbols to win',
  backgroundImage: goblinGoldAsset,
  scratchAreas: [
    // Row 1 - 5 areas
    {
      id: 'area-1',
      topPercent: 0.4447,
      leftPercent: 0.0684,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-2',
      topPercent: 0.4447,
      leftPercent: 0.2246,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-3',
      topPercent: 0.4447,
      leftPercent: 0.3809,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-4',
      topPercent: 0.4447,
      leftPercent: 0.5371,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-5',
      topPercent: 0.4447,
      leftPercent: 0.6934,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    // Row 2 - 5 areas
    {
      id: 'area-6',
      topPercent: 0.5846,
      leftPercent: 0.0684,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-7',
      topPercent: 0.5846,
      leftPercent: 0.2246,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-8',
      topPercent: 0.5846,
      leftPercent: 0.3809,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-9',
      topPercent: 0.5846,
      leftPercent: 0.5371,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
    {
      id: 'area-10',
      topPercent: 0.5846,
      leftPercent: 0.6934,
      widthPercent: 0.1270,
      heightPercent: 0.0846,
      canvasWidth: 130,
      canvasHeight: 130,
      revealThreshold: 50,
    },
  ],
  revealMechanic: 'match-three',
  winCondition: 'match-symbols',
  ticketWidth: 1024,
  ticketHeight: 1536,
};
