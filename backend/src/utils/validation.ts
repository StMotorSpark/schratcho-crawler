/**
 * Validation Utilities
 * 
 * Provides validation functions for API request data.
 */

import type { Prize } from '../../../core/mechanics/prizes';
import type { Scratcher } from '../../../core/mechanics/scratchers';
import type { TicketLayout } from '../../../core/mechanics/ticketLayouts';
import type { Store } from '../../../core/mechanics/stores';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate Prize data
 */
export function validatePrize(data: any): asserts data is Prize {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Prize data must be an object');
  }

  if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
    throw new ValidationError('Prize must have a valid id (non-empty string)');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new ValidationError('Prize must have a valid name (non-empty string)');
  }

  if (!data.value || typeof data.value !== 'string' || data.value.trim() === '') {
    throw new ValidationError('Prize must have a valid value (non-empty string)');
  }

  if (!data.emoji || typeof data.emoji !== 'string' || data.emoji.trim() === '') {
    throw new ValidationError('Prize must have a valid emoji (non-empty string)');
  }

  // effects is optional, but if provided must be an object
  if (data.effects !== undefined && (typeof data.effects !== 'object' || data.effects === null)) {
    throw new ValidationError('Prize effects must be an object if provided');
  }
}

/**
 * Validate Scratcher data
 */
export function validateScratcher(data: any): asserts data is Scratcher {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Scratcher data must be an object');
  }

  if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
    throw new ValidationError('Scratcher must have a valid id (non-empty string)');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new ValidationError('Scratcher must have a valid name (non-empty string)');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
    throw new ValidationError('Scratcher must have a valid description (non-empty string)');
  }

  if (!data.texture || typeof data.texture !== 'string' || data.texture.trim() === '') {
    throw new ValidationError('Scratcher must have a valid texture (non-empty string)');
  }

  if (!data.sound || typeof data.sound !== 'string' || data.sound.trim() === '') {
    throw new ValidationError('Scratcher must have a valid sound (non-empty string)');
  }

  // Check capabilities if provided
  if (data.capabilities !== undefined) {
    if (!Array.isArray(data.capabilities)) {
      throw new ValidationError('Scratcher capabilities must be an array if provided');
    }
  }
}

/**
 * Validate Ticket data
 */
export function validateTicket(data: any): asserts data is TicketLayout {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Ticket data must be an object');
  }

  if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
    throw new ValidationError('Ticket must have a valid id (non-empty string)');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new ValidationError('Ticket must have a valid name (non-empty string)');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
    throw new ValidationError('Ticket must have a valid description (non-empty string)');
  }

  if (typeof data.goldCost !== 'number' || data.goldCost < 0) {
    throw new ValidationError('Ticket must have a valid goldCost (non-negative number)');
  }

  if (!Array.isArray(data.scratchAreas) || data.scratchAreas.length === 0) {
    throw new ValidationError('Ticket must have at least one scratch area');
  }

  // Validate each scratch area
  data.scratchAreas.forEach((area: any, index: number) => {
    if (!area || typeof area !== 'object') {
      throw new ValidationError(`Scratch area at index ${index} must be an object`);
    }
    if (!area.id || typeof area.id !== 'string') {
      throw new ValidationError(`Scratch area at index ${index} must have a valid id`);
    }
  });
}

/**
 * Validate Store data
 */
export function validateStore(data: any): asserts data is Store {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Store data must be an object');
  }

  if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
    throw new ValidationError('Store must have a valid id (non-empty string)');
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw new ValidationError('Store must have a valid name (non-empty string)');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
    throw new ValidationError('Store must have a valid description (non-empty string)');
  }

  if (!Array.isArray(data.availableTickets)) {
    throw new ValidationError('Store must have an availableTickets array');
  }

  if (typeof data.unlockThreshold !== 'number' || data.unlockThreshold < 0) {
    throw new ValidationError('Store must have a valid unlockThreshold (non-negative number)');
  }

  if (typeof data.unlocked !== 'boolean') {
    throw new ValidationError('Store must have a valid unlocked boolean value');
  }

  if (!data.theme || typeof data.theme !== 'string' || data.theme.trim() === '') {
    throw new ValidationError('Store must have a valid theme (non-empty string)');
  }
}

/**
 * Validate partial update data
 * This allows updating only specific fields without requiring all fields.
 * 
 * **IMPORTANT LIMITATION**: This function only validates that disallowed fields 
 * (PK, SK, entityType, createdAt) are not being updated. It does NOT validate the 
 * actual values of the fields being updated. This means invalid data could be 
 * written to the database if the caller provides malformed values.
 * 
 * For production use, consider implementing field-level validation for partial updates
 * by checking each provided field against the entity's validation rules.
 * 
 * @param data - The partial update data to validate
 * @param _validatorFn - The full validator function (currently unused, but reserved for future enhancement)
 * @returns The partial data, cast to the appropriate type
 * @throws ValidationError if disallowed fields are present
 */
export function validatePartialUpdate<T>(
  data: any,
  _validatorFn: (data: any) => asserts data is T
): Partial<T> {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Update data must be an object');
  }

  // Don't allow updating PK, SK, entityType, createdAt
  const disallowedFields = ['PK', 'SK', 'entityType', 'createdAt'];
  for (const field of disallowedFields) {
    if (field in data) {
      throw new ValidationError(`Cannot update field: ${field}`);
    }
  }

  // Return the partial data
  // Note: We don't fully validate all required fields for partial updates
  return data as Partial<T>;
}
