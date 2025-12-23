/**
 * Scratcher Data Model for DynamoDB
 * 
 * This file defines the DynamoDB schema for scratchers.
 * It extends the core Scratcher type with database-specific fields.
 */

import type { Scratcher as CoreScratcher } from '../../../core/mechanics/scratchers';

/**
 * Scratcher item as stored in DynamoDB.
 * Extends the core Scratcher type with database metadata.
 */
export interface ScratcherDynamoDBItem extends CoreScratcher {
  /** Partition key: Scratcher ID */
  PK: string; // Format: "SCRATCHER#<id>"
  /** Sort key: Same as PK for single-table design */
  SK: string; // Format: "SCRATCHER#<id>"
  /** Entity type for queries */
  entityType: 'Scratcher';
  /** Timestamp when the scratcher was created */
  createdAt: string; // ISO 8601 format
  /** Timestamp when the scratcher was last updated */
  updatedAt: string; // ISO 8601 format
  /** Version number for optimistic locking */
  version: number;
}

/**
 * Convert a core Scratcher to a DynamoDB item.
 */
export function scratcherToDBItem(scratcher: CoreScratcher): ScratcherDynamoDBItem {
  const now = new Date().toISOString();
  return {
    ...scratcher,
    PK: `SCRATCHER#${scratcher.id}`,
    SK: `SCRATCHER#${scratcher.id}`,
    entityType: 'Scratcher',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Convert a DynamoDB item to a core Scratcher.
 */
export function dbItemToScratcher(item: ScratcherDynamoDBItem): CoreScratcher {
  const { PK, SK, entityType, createdAt, updatedAt, version, ...scratcher } = item;
  return scratcher;
}
