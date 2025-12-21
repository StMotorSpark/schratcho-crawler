/**
 * Ticket Layout Data Model for DynamoDB
 * 
 * This file defines the DynamoDB schema for ticket layouts.
 * It extends the core TicketLayout type with database-specific fields.
 */

import type { TicketLayout as CoreTicketLayout } from '../../../core/mechanics/ticketLayouts';

/**
 * Ticket layout item as stored in DynamoDB.
 * Extends the core TicketLayout type with database metadata.
 */
export interface TicketDynamoDBItem extends CoreTicketLayout {
  /** Partition key: Ticket ID */
  PK: string; // Format: "TICKET#<id>"
  /** Sort key: Same as PK for single-table design */
  SK: string; // Format: "TICKET#<id>"
  /** Entity type for queries */
  entityType: 'Ticket';
  /** Timestamp when the ticket layout was created */
  createdAt: string; // ISO 8601 format
  /** Timestamp when the ticket layout was last updated */
  updatedAt: string; // ISO 8601 format
  /** Version number for optimistic locking */
  version: number;
}

/**
 * Convert a core TicketLayout to a DynamoDB item.
 */
export function ticketToDBItem(ticket: CoreTicketLayout): TicketDynamoDBItem {
  const now = new Date().toISOString();
  return {
    ...ticket,
    PK: `TICKET#${ticket.id}`,
    SK: `TICKET#${ticket.id}`,
    entityType: 'Ticket',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Convert a DynamoDB item to a core TicketLayout.
 */
export function dbItemToTicket(item: TicketDynamoDBItem): CoreTicketLayout {
  const { PK, SK, entityType, createdAt, updatedAt, version, ...ticket } = item;
  return ticket;
}
