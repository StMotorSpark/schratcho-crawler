/**
 * Ticket API Routes (v1)
 * 
 * RESTful endpoints for Ticket CRUD operations.
 */

import { Router, type Request, type Response } from 'express';
import { getItem, getItemsByEntityType, putItem, updateItem, deleteItem } from '../../db/dynamodb';
import { validateTicket, validatePartialUpdate, ValidationError } from '../../utils/validation';
import { ticketToDBItem, dbItemToTicket, type TicketDynamoDBItem } from '../../types/ticket';
import type { TicketLayout } from '../../../../core/mechanics/ticketLayouts';

const router = Router();

/**
 * GET /v1/tickets
 * Get all tickets
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await getItemsByEntityType('Ticket');
    const tickets = items.map((item) => dbItemToTicket(item as TicketDynamoDBItem));
    return res.status(200).json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch tickets',
      message: error.message
    });
  }
});

/**
 * GET /v1/tickets/:id
 * Get a single ticket by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `TICKET#${id}`;
    const sk = `TICKET#${id}`;
    
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with id: ${id}`
      });
    }
    
    const ticket = dbItemToTicket(item as TicketDynamoDBItem);
    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch ticket',
      message: error.message
    });
  }
});

/**
 * POST /v1/tickets
 * Create a new ticket
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const ticketData = req.body;
    
    // Validate the ticket data
    validateTicket(ticketData);
    
    // Check if ticket already exists
    const pk = `TICKET#${ticketData.id}`;
    const sk = `TICKET#${ticketData.id}`;
    const existing = await getItem(pk, sk);
    
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Ticket already exists',
        message: `A ticket with id '${ticketData.id}' already exists`
      });
    }
    
    // Convert to DynamoDB item and save
    const dbItem = ticketToDBItem(ticketData);
    await putItem(dbItem);
    
    const createdTicket = dbItemToTicket(dbItem);
    return res.status(201).json({
      success: true,
      data: createdTicket,
      message: 'Ticket created successfully'
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create ticket',
      message: error.message
    });
  }
});

/**
 * PUT /v1/tickets/:id
 * Update an existing ticket
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate partial update data
    const validatedUpdates = validatePartialUpdate<TicketLayout>(updates, validateTicket);
    
    // Verify ID in body matches ID in URL (if provided)
    if (validatedUpdates.id && validatedUpdates.id !== id) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Ticket ID in body does not match URL parameter'
      });
    }
    
    const pk = `TICKET#${id}`;
    const sk = `TICKET#${id}`;
    
    // Get current item
    const currentItem = await getItem(pk, sk);
    
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with id: ${id}`
      });
    }
    
    const currentTicket = currentItem as TicketDynamoDBItem;
    
    // Update with optimistic locking
    const updatedItem = await updateItem(pk, sk, validatedUpdates, currentTicket.version);
    const updatedTicket = dbItemToTicket(updatedItem as TicketDynamoDBItem);
    
    return res.status(200).json({
      success: true,
      data: updatedTicket,
      message: 'Ticket updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Ticket was modified by another request. Please retry.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update ticket',
      message: error.message
    });
  }
});

/**
 * DELETE /v1/tickets/:id
 * Delete a ticket
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `TICKET#${id}`;
    const sk = `TICKET#${id}`;
    
    // Check if ticket exists
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found',
        message: `No ticket found with id: ${id}`
      });
    }
    
    await deleteItem(pk, sk);
    
    return res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete ticket',
      message: error.message
    });
  }
});

export default router;
