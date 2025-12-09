/**
 * Odds Calculation System
 * 
 * This module provides utilities for calculating and displaying odds information
 * for scratch ticket layouts. It takes into account:
 * - Prize weights and probabilities
 * - Scratch area count
 * - Win conditions (match-2, match-3, etc.)
 */

import type { PrizeConfig } from './prizes';
import type { TicketLayout, WinCondition } from './ticketLayouts';
import { getPrizeById } from './prizes';

/**
 * Represents the odds information for a single prize
 */
export interface PrizeOdds {
  /** Prize ID */
  prizeId: string;
  /** Prize name */
  name: string;
  /** Prize emoji */
  emoji: string;
  /** Prize value display string */
  value: string;
  /** Probability as a decimal (0-1) */
  probability: number;
  /** Formatted percentage string */
  percentageStr: string;
  /** Formatted "1 in X" odds string */
  oddsStr: string;
  /** Original weight */
  weight: number;
}

/**
 * Represents the complete odds information for a ticket layout
 */
export interface TicketOdds {
  /** Array of prize odds */
  prizes: PrizeOdds[];
  /** Total weight of all prizes */
  totalWeight: number;
  /** Number of scratch areas */
  scratchAreaCount: number;
  /** Win condition type */
  winCondition: WinCondition;
  /** Approximate probability of winning (0-1) */
  winProbability: number;
  /** Formatted win probability string */
  winProbabilityStr: string;
  /** Human-readable explanation of win condition */
  winConditionExplanation: string;
}

/**
 * Calculate the probability for each prize based on weights
 */
export function calculatePrizeProbabilities(prizeConfigs: PrizeConfig[]): PrizeOdds[] {
  // Filter out invalid prizes and calculate total weight
  const validConfigs = prizeConfigs.filter(config => {
    const prize = getPrizeById(config.prizeId);
    return prize && config.weight > 0;
  });

  if (validConfigs.length === 0) {
    return [];
  }

  const totalWeight = validConfigs.reduce((sum, config) => sum + config.weight, 0);

  return validConfigs.map(config => {
    const prize = getPrizeById(config.prizeId)!;
    const probability = config.weight / totalWeight;
    
    return {
      prizeId: config.prizeId,
      name: prize.name,
      emoji: prize.emoji,
      value: prize.value,
      probability,
      percentageStr: formatPercentage(probability),
      oddsStr: formatOdds(probability),
      weight: config.weight,
    };
  });
}

/**
 * Format a probability as a percentage string
 */
export function formatPercentage(probability: number): string {
  const percent = probability * 100;
  if (percent >= 10) {
    return `${percent.toFixed(1)}%`;
  } else if (percent >= 1) {
    return `${percent.toFixed(2)}%`;
  } else if (percent >= 0.1) {
    return `${percent.toFixed(3)}%`;
  } else {
    return `${percent.toFixed(4)}%`;
  }
}

/**
 * Format a probability as "1 in X" odds string
 */
export function formatOdds(probability: number): string {
  if (probability <= 0) {
    return 'N/A';
  }
  
  const oneIn = 1 / probability;
  
  if (oneIn < 2) {
    return '~1 in 1';
  } else if (oneIn < 100) {
    return `1 in ${Math.round(oneIn)}`;
  } else if (oneIn < 1000) {
    return `1 in ${Math.round(oneIn / 10) * 10}`;
  } else {
    return `1 in ${Math.round(oneIn / 100) * 100}`;
  }
}

/**
 * Get a human-readable explanation of the win condition
 */
export function getWinConditionExplanation(winCondition: WinCondition, scratchAreaCount: number): string {
  switch (winCondition) {
    case 'no-win-condition':
      return 'Every ticket is a winner! Scratch to reveal your prize.';
    case 'match-two':
      return `Match 2 identical symbols out of ${scratchAreaCount} areas to win.`;
    case 'match-three':
      return `Match 3 identical symbols out of ${scratchAreaCount} areas to win.`;
    case 'match-all':
      return `All ${scratchAreaCount} areas must show the same symbol to win (Jackpot!).`;
    case 'find-one':
      return 'Find the target prize in any scratch area to win.';
    case 'find-one-dynamic':
      return 'Reveal the winning symbol area first, then find that symbol in another area to win.';
    case 'total-value-threshold':
      return 'Combined value of revealed prizes must exceed the threshold to win.';
    case 'reveal-all-areas':
      return `Reveal all ${scratchAreaCount} areas to win.`;
    case 'reveal-any-area':
      return 'Reveal any scratch area to win.';
    case 'match-symbols':
      return 'Match the required number of symbols to win.';
    case 'progressive-reveal':
      return 'Reveal areas in order to unlock the final prize.';
    default:
      return 'Scratch to reveal your prizes!';
  }
}

/**
 * Calculate the approximate probability of winning based on win condition
 * 
 * This is a simplification that assumes independent random selection for each area.
 * For match conditions, we calculate the probability of getting N matching symbols.
 */
export function calculateWinProbability(
  prizeConfigs: PrizeConfig[],
  winCondition: WinCondition,
  scratchAreaCount: number
): number {
  const prizeOdds = calculatePrizeProbabilities(prizeConfigs);
  
  if (prizeOdds.length === 0) {
    return 0;
  }

  switch (winCondition) {
    case 'no-win-condition':
    case 'reveal-any-area':
      // Always wins
      return 1;

    case 'reveal-all-areas':
    case 'progressive-reveal':
      // Just need to scratch all areas - always possible
      return 1;

    case 'match-two':
      return calculateMatchProbability(prizeOdds, scratchAreaCount, 2);

    case 'match-three':
      return calculateMatchProbability(prizeOdds, scratchAreaCount, 3);

    case 'match-all':
      return calculateMatchProbability(prizeOdds, scratchAreaCount, scratchAreaCount);

    case 'find-one':
      // Probability depends on target prize - assume it's configured correctly
      // Return probability of finding at least one target prize
      // For simplicity, assume each area has the same chance
      // This would need the targetPrizeId to be accurate
      return 0.5; // Placeholder - would need targetPrizeId

    case 'find-one-dynamic':
      // Player must match the symbol from the winning symbol area with at least one other area
      // For each prize type with probability p:
      // - Winning symbol area shows this prize: p
      // - At least one of (N-1) other areas matches: 1 - (1-p)^(N-1)
      // - Combined: p × [1 - (1-p)^(N-1)]
      // Sum across all prize types
      if (scratchAreaCount < 2) return 0;
      return calculateFindOneDynamicProbability(prizeOdds, scratchAreaCount);

    case 'total-value-threshold':
      // This depends on prize values and threshold - complex calculation
      // Return a placeholder estimate
      return 0.3; // Placeholder

    case 'match-symbols':
      // Legacy - treat as match-three
      return calculateMatchProbability(prizeOdds, scratchAreaCount, 3);

    default:
      return 0;
  }
}

/**
 * Calculate the probability of winning with find-one-dynamic condition.
 * 
 * The winning symbol area reveals a random prize, and the player must find
 * at least one matching prize in the remaining areas.
 * 
 * For each prize type with probability p:
 * - Probability winning symbol area shows this prize: p
 * - Probability at least one of (N-1) other areas matches: 1 - (1-p)^(N-1)
 * - Combined: p × [1 - (1-p)^(N-1)]
 * 
 * Sum this across all prize types.
 */
function calculateFindOneDynamicProbability(
  prizeOdds: PrizeOdds[],
  scratchAreaCount: number
): number {
  if (scratchAreaCount < 2) return 0;
  
  const otherAreasCount = scratchAreaCount - 1;
  let totalProbability = 0;
  
  for (const prize of prizeOdds) {
    const p = prize.probability;
    // Probability that winning symbol area shows this prize
    const pWinningSymbol = p;
    // Probability at least one of the other areas also shows this prize
    const pAtLeastOneMatch = 1 - Math.pow(1 - p, otherAreasCount);
    // Combined probability of winning with this prize type
    totalProbability += pWinningSymbol * pAtLeastOneMatch;
  }
  
  return totalProbability;
}

/**
 * Calculate the probability of matching exactly N symbols in K scratch areas.
 * 
 * Uses the formula for probability of at least N matching prizes
 * when each area independently selects a prize from the same distribution.
 */
function calculateMatchProbability(
  prizeOdds: PrizeOdds[],
  numAreas: number,
  requiredMatches: number
): number {
  if (numAreas < requiredMatches) {
    return 0;
  }

  if (requiredMatches <= 1) {
    return 1; // At least 1 match is guaranteed
  }

  // For each prize type, calculate the probability that at least
  // requiredMatches areas will show that prize
  let totalProbability = 0;

  for (const prize of prizeOdds) {
    const p = prize.probability;
    
    // Probability of exactly k successes in n trials (binomial)
    // P(X >= requiredMatches) = sum of P(X = k) for k from requiredMatches to numAreas
    let prizeWinProb = 0;
    
    for (let k = requiredMatches; k <= numAreas; k++) {
      prizeWinProb += binomialProbability(numAreas, k, p);
    }
    
    totalProbability += prizeWinProb;
  }

  // Clamp to [0, 1] since we're adding probabilities of non-mutually exclusive events
  // This is an approximation - for exact calculation we'd need inclusion-exclusion
  return Math.min(1, totalProbability);
}

/**
 * Calculate binomial probability P(X = k) for n trials with probability p
 */
function binomialProbability(n: number, k: number, p: number): number {
  return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/**
 * Calculate binomial coefficient "n choose k"
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  // Use the smaller of k and n-k for efficiency
  if (k > n - k) {
    k = n - k;
  }
  
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  
  return Math.round(result);
}

/**
 * Calculate complete odds information for a ticket layout
 */
export function calculateTicketOdds(layout: TicketLayout): TicketOdds {
  const prizeConfigs = layout.prizeConfigs || [];
  const prizes = calculatePrizeProbabilities(prizeConfigs);
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  const winProbability = calculateWinProbability(
    prizeConfigs,
    layout.winCondition,
    layout.scratchAreas.length
  );

  return {
    prizes,
    totalWeight,
    scratchAreaCount: layout.scratchAreas.length,
    winCondition: layout.winCondition,
    winProbability,
    winProbabilityStr: formatPercentage(winProbability),
    winConditionExplanation: getWinConditionExplanation(
      layout.winCondition,
      layout.scratchAreas.length
    ),
  };
}
