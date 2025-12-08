/**
 * Hand Calculation Engine
 * 
 * This module provides the logic for calculating hand values with effects.
 * Hand effects modify how the hand value is calculated rather than directly
 * adding gold to the hand.
 */

import type {
  HandTicket,
  HandEffect,
  HandEffectTarget,
  HandEffectOperation,
  HandTicketCalculation,
} from './types';

/**
 * Calculate the total value of a hand considering all hand effects.
 * Effects are processed in order, and the final value cannot be negative.
 * 
 * @param tickets - Array of hand tickets (may contain hand effects)
 * @returns Object containing total value and updated tickets with calculation state
 */
export function calculateHandValue(
  tickets: HandTicket[]
): { totalValue: number; calculatedTickets: HandTicket[] } {
  if (tickets.length === 0) {
    return { totalValue: 0, calculatedTickets: [] };
  }

  // Clone tickets to avoid mutation
  const calculatedTickets = tickets.map((ticket) => ({ ...ticket }));

  // Initialize each ticket's calculated value with its base gold value
  const ticketValues: number[] = calculatedTickets.map((t) => t.goldValue);

  // Process each ticket's hand effect in order
  for (let i = 0; i < calculatedTickets.length; i++) {
    const ticket = calculatedTickets[i];
    const effect = ticket.handEffect;

    if (!effect) {
      // No effect - just use base gold value
      ticket.calculation = {
        complete: true,
        calculatedValue: ticket.goldValue,
      };
      continue;
    }

    // Apply the effect
    const result = applyHandEffect(effect, ticketValues, i);
    
    // Update ticket calculation state
    ticket.calculation = result.calculation;
    
    // Apply changes to ticket values array
    // Round up to ensure whole numbers (no fractional gold)
    if (result.modifiedIndex !== undefined && result.modifiedValue !== undefined) {
      ticketValues[result.modifiedIndex] = Math.max(0, Math.ceil(result.modifiedValue));
    }
  }

  // Calculate total value (sum of all ticket values, cannot be negative)
  // Round up to ensure whole numbers (no fractional gold)
  let totalValue = ticketValues.reduce((sum, value) => sum + value, 0);
  totalValue = Math.ceil(Math.max(0, totalValue));

  // Update each ticket's calculated value
  // Values are already rounded from earlier operations
  for (let i = 0; i < calculatedTickets.length; i++) {
    if (calculatedTickets[i].calculation) {
      calculatedTickets[i].calculation!.calculatedValue = ticketValues[i];
    }
  }

  return { totalValue, calculatedTickets };
}

/**
 * Special index value to represent the entire hand (not a specific ticket).
 */
const HAND_TARGET_INDEX = -1;

/**
 * Apply a single hand effect and return the result.
 */
function applyHandEffect(
  effect: HandEffect,
  ticketValues: number[],
  currentIndex: number
): {
  calculation: HandTicketCalculation;
  modifiedIndex?: number;
  modifiedValue?: number;
} {
  const operation = effect.operation;
  const target = effect.target;
  const amount = effect.amount;

  // Handle diff operation specially
  if (operation === 'diff') {
    return applyDiffEffect(effect, ticketValues, currentIndex);
  }

  // Determine the target index
  const targetIndex = resolveTargetIndex(target, currentIndex, ticketValues.length);

  if (targetIndex === undefined) {
    // Target doesn't exist (e.g., no prior/next ticket)
    return {
      calculation: {
        complete: false,
        appliedEffect: effect,
        calculatedValue: ticketValues[currentIndex],
        notes: getMissingTargetNote(target),
      },
    };
  }

  // Get current value of target
  const currentValue = targetIndex === HAND_TARGET_INDEX 
    ? ticketValues.reduce((sum, v) => sum + v, 0) // For 'hand' target, sum all values
    : ticketValues[targetIndex];

  // Apply the operation
  let newValue = currentValue;
  switch (operation) {
    case 'multiply':
      newValue = currentValue * amount;
      break;
    case 'add':
      newValue = currentValue + amount;
      break;
    case 'subtract':
      newValue = currentValue - amount;
      break;
    case 'set':
      newValue = amount;
      break;
  }

  // For 'hand' target, we need to apply proportionally to all tickets
  // Note: This intentionally mutates ticketValues array in-place for performance
  // Round up to ensure whole numbers (no fractional gold)
  if (targetIndex === HAND_TARGET_INDEX) {
    const multiplier = newValue / Math.max(currentValue, 1);
    for (let i = 0; i < ticketValues.length; i++) {
      ticketValues[i] = Math.ceil(ticketValues[i] * multiplier);
    }
    return {
      calculation: {
        complete: true,
        appliedEffect: effect,
        calculatedValue: ticketValues[currentIndex],
        notes: `Applied ${operation} to entire hand`,
      },
    };
  }

  return {
    calculation: {
      complete: true,
      appliedEffect: effect,
      calculatedValue: targetIndex === currentIndex ? newValue : ticketValues[currentIndex],
      notes: getOperationNote(operation, target, amount, currentValue, newValue),
    },
    modifiedIndex: targetIndex,
    modifiedValue: newValue,
  };
}

/**
 * Apply a diff effect with conditional logic.
 */
function applyDiffEffect(
  effect: HandEffect,
  ticketValues: number[],
  currentIndex: number
): {
  calculation: HandTicketCalculation;
  modifiedIndex?: number;
  modifiedValue?: number;
} {
  // Diff requires both prior and next
  const priorIndex = currentIndex - 1;
  const nextIndex = currentIndex + 1;

  if (priorIndex < 0 || nextIndex >= ticketValues.length) {
    return {
      calculation: {
        complete: false,
        appliedEffect: effect,
        calculatedValue: ticketValues[currentIndex],
        notes: 'Diff requires both prior and next tickets',
      },
    };
  }

  const priorValue = ticketValues[priorIndex];
  const nextValue = ticketValues[nextIndex];
  const diff = priorValue - nextValue;

  // Determine which condition applies
  let conditionMet = false;
  let appliedCondition = null;

  if (effect.conditions) {
    for (const condition of effect.conditions) {
      if (
        (condition.type === 'greater' && diff > 0) ||
        (condition.type === 'less' && diff < 0) ||
        (condition.type === 'equal' && diff === 0)
      ) {
        conditionMet = true;
        appliedCondition = condition;
        break;
      }
    }
  }

  if (!conditionMet || !appliedCondition) {
    return {
      calculation: {
        complete: true,
        appliedEffect: effect,
        calculatedValue: ticketValues[currentIndex],
        notes: `Diff: prior=${priorValue}, next=${nextValue}, no condition met`,
      },
    };
  }

  // Apply the condition's effect
  const targetIndex = resolveTargetIndex(
    appliedCondition.target,
    currentIndex,
    ticketValues.length
  );

  if (targetIndex === undefined) {
    return {
      calculation: {
        complete: false,
        appliedEffect: effect,
        calculatedValue: ticketValues[currentIndex],
        notes: `Diff condition target invalid`,
      },
    };
  }

  const targetValue = targetIndex === HAND_TARGET_INDEX
    ? ticketValues.reduce((sum, v) => sum + v, 0)
    : ticketValues[targetIndex];

  let newValue = targetValue;
  switch (appliedCondition.operation) {
    case 'multiply':
      newValue = targetValue * appliedCondition.amount;
      break;
    case 'add':
      newValue = targetValue + appliedCondition.amount;
      break;
    case 'subtract':
      newValue = targetValue - appliedCondition.amount;
      break;
    case 'set':
      newValue = appliedCondition.amount;
      break;
  }

  // For 'hand' target, apply proportionally
  // Note: This intentionally mutates ticketValues array in-place for performance
  // Round up to ensure whole numbers (no fractional gold)
  if (targetIndex === HAND_TARGET_INDEX) {
    const multiplier = newValue / Math.max(targetValue, 1);
    for (let i = 0; i < ticketValues.length; i++) {
      ticketValues[i] = Math.ceil(ticketValues[i] * multiplier);
    }
    return {
      calculation: {
        complete: true,
        appliedEffect: effect,
        calculatedValue: ticketValues[currentIndex],
        notes: `Diff: ${appliedCondition.type}, applied to hand`,
      },
    };
  }

  return {
    calculation: {
      complete: true,
      appliedEffect: effect,
      calculatedValue: targetIndex === currentIndex ? newValue : ticketValues[currentIndex],
      notes: `Diff: prior ${appliedCondition.type} next, ${appliedCondition.operation} ${appliedCondition.target}`,
    },
    modifiedIndex: targetIndex,
    modifiedValue: newValue,
  };
}

/**
 * Resolve target to an array index.
 * Returns undefined if target doesn't exist.
 * Returns HAND_TARGET_INDEX for 'hand' target (special case).
 */
function resolveTargetIndex(
  target: HandEffectTarget,
  currentIndex: number,
  arrayLength: number
): number | undefined {
  switch (target) {
    case 'self':
      return currentIndex;
    case 'prior':
      return currentIndex > 0 ? currentIndex - 1 : undefined;
    case 'next':
      return currentIndex < arrayLength - 1 ? currentIndex + 1 : undefined;
    case 'hand':
      return HAND_TARGET_INDEX; // Special case for entire hand
    default:
      return undefined;
  }
}

/**
 * Get a note about a missing target.
 */
function getMissingTargetNote(target: HandEffectTarget): string {
  switch (target) {
    case 'prior':
      return 'No prior ticket available';
    case 'next':
      return 'No next ticket available';
    default:
      return 'Target not available';
  }
}

/**
 * Get a descriptive note about an operation.
 */
function getOperationNote(
  operation: HandEffectOperation,
  target: HandEffectTarget,
  amount: number,
  oldValue: number,
  newValue: number
): string {
  const targetStr = target === 'self' ? 'this ticket' : target;
  switch (operation) {
    case 'multiply':
      return `${targetStr} × ${amount} (${oldValue} → ${newValue})`;
    case 'add':
      return `${targetStr} + ${amount} (${oldValue} → ${newValue})`;
    case 'subtract':
      return `${targetStr} - ${amount} (${oldValue} → ${newValue})`;
    case 'set':
      return `${targetStr} set to ${amount}`;
    default:
      return `Applied ${operation} to ${targetStr}`;
  }
}
