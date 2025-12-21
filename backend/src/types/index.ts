/**
 * Shared type definitions for backend storage.
 * 
 * This module exports all DynamoDB data models and conversion utilities.
 */

export * from './prize';
export * from './scratcher';
export * from './ticket';
export * from './store';

/**
 * Union type of all entity types stored in the DynamoDB table.
 */
export type EntityType = 'Prize' | 'Scratcher' | 'Ticket' | 'Store';

/**
 * Base interface for all DynamoDB items.
 */
export interface BaseDynamoDBItem {
  PK: string;
  SK: string;
  entityType: EntityType;
  createdAt: string;
  updatedAt: string;
  version: number;
}
