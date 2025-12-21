/**
 * Store Data Model for DynamoDB
 * 
 * This file defines the DynamoDB schema for stores.
 * It extends the core Store type with database-specific fields.
 */

import type { Store as CoreStore } from '../../../core/mechanics/stores';

/**
 * Store item as stored in DynamoDB.
 * Extends the core Store type with database metadata.
 */
export interface StoreDynamoDBItem extends CoreStore {
  /** Partition key: Store ID */
  PK: string; // Format: "STORE#<id>"
  /** Sort key: Same as PK for single-table design */
  SK: string; // Format: "STORE#<id>"
  /** Entity type for queries */
  entityType: 'Store';
  /** Timestamp when the store was created */
  createdAt: string; // ISO 8601 format
  /** Timestamp when the store was last updated */
  updatedAt: string; // ISO 8601 format
  /** Version number for optimistic locking */
  version: number;
}

/**
 * Convert a core Store to a DynamoDB item.
 */
export function storeToDBItem(store: CoreStore): StoreDynamoDBItem {
  const now = new Date().toISOString();
  return {
    ...store,
    PK: `STORE#${store.id}`,
    SK: `STORE#${store.id}`,
    entityType: 'Store',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Convert a DynamoDB item to a core Store.
 */
export function dbItemToStore(item: StoreDynamoDBItem): CoreStore {
  const { PK, SK, entityType, createdAt, updatedAt, version, ...store } = item;
  return store;
}
