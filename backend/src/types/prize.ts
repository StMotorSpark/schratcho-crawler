/**
 * Prize Data Model for DynamoDB
 * 
 * This file defines the DynamoDB schema for prizes.
 * It extends the core Prize type with database-specific fields.
 */

import type { Prize as CorePrize } from '../../../core/mechanics/prizes';

/**
 * Prize item as stored in DynamoDB.
 * Extends the core Prize type with database metadata.
 */
export interface PrizeDynamoDBItem extends CorePrize {
  /** Partition key: Prize ID */
  PK: string; // Format: "PRIZE#<id>"
  /** Sort key: Same as PK for single-table design */
  SK: string; // Format: "PRIZE#<id>"
  /** Entity type for queries */
  entityType: 'Prize';
  /** Timestamp when the prize was created */
  createdAt: string; // ISO 8601 format
  /** Timestamp when the prize was last updated */
  updatedAt: string; // ISO 8601 format
  /** Version number for optimistic locking */
  version: number;
}

/**
 * Convert a core Prize to a DynamoDB item.
 */
export function prizeToDBItem(prize: CorePrize): PrizeDynamoDBItem {
  const now = new Date().toISOString();
  return {
    ...prize,
    PK: `PRIZE#${prize.id}`,
    SK: `PRIZE#${prize.id}`,
    entityType: 'Prize',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Convert a DynamoDB item to a core Prize.
 */
export function dbItemToPrize(item: PrizeDynamoDBItem): CorePrize {
  const { PK, SK, entityType, createdAt, updatedAt, version, ...prize } = item;
  return prize;
}
