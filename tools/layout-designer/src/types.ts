/**
 * Types for the Ticket Layout Designer
 * These mirror the types from core/mechanics/ticketLayouts.ts
 */

export interface ScratchAreaConfig {
  id: string;
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
  canvasWidth: number;
  canvasHeight: number;
  revealThreshold: number;
}

export type RevealMechanic = 
  | 'reveal-all'
  | 'reveal-one'
  | 'match-three'
  | 'match-two'
  | 'progressive';

export type WinCondition = 
  | 'reveal-all-areas'
  | 'reveal-any-area'
  | 'match-symbols'
  | 'progressive-reveal';

export interface TicketLayout {
  id: string;
  name: string;
  description: string;
  scratchAreas: ScratchAreaConfig[];
  revealMechanic: RevealMechanic;
  winCondition: WinCondition;
  ticketWidth: number;
  ticketHeight: number;
  backgroundImage?: string;
}

export interface DrawingRect {
  startX: number;
  startY: number;
  width: number;
  height: number;
}
