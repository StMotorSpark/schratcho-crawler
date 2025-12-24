/**
 * Prize API Routes (v1)
 * 
 * RESTful endpoints for Prize CRUD operations.
 */

import { Router, type Request, type Response } from 'express';
import { getItem, getItemsByEntityType, putItem, updateItem, deleteItem } from '../../db/dynamodb';
import { validatePrize, validatePartialUpdate, ValidationError } from '../../utils/validation';
import { prizeToDBItem, dbItemToPrize, type PrizeDynamoDBItem } from '../../types/prize';
import type { Prize } from '../../../../core/mechanics/prizes';

const router = Router();

/**
 * GET /v1/prizes
 * Get all prizes
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await getItemsByEntityType('Prize');
    const prizes = items.map((item) => dbItemToPrize(item as PrizeDynamoDBItem));
    res.status(200).json({
      success: true,
      data: prizes,
      count: prizes.length
    });
  } catch (error: any) {
    console.error('Error fetching prizes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prizes',
      message: error.message
    });
  }
});

/**
 * GET /v1/prizes/:id
 * Get a single prize by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `PRIZE#${id}`;
    const sk = `PRIZE#${id}`;
    
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Prize not found',
        message: `No prize found with id: ${id}`
      });
    }
    
    const prize = dbItemToPrize(item as PrizeDynamoDBItem);
    return res.status(200).json({
      success: true,
      data: prize
    });
  } catch (error: any) {
    console.error('Error fetching prize:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch prize',
      message: error.message
    });
  }
});

/**
 * POST /v1/prizes
 * Create a new prize
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const prizeData = req.body;
    
    // Validate the prize data
    validatePrize(prizeData);
    
    // Check if prize already exists
    const pk = `PRIZE#${prizeData.id}`;
    const sk = `PRIZE#${prizeData.id}`;
    const existing = await getItem(pk, sk);
    
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Prize already exists',
        message: `A prize with id '${prizeData.id}' already exists`
      });
    }
    
    // Convert to DynamoDB item and save
    const dbItem = prizeToDBItem(prizeData);
    await putItem(dbItem);
    
    const createdPrize = dbItemToPrize(dbItem);
    return res.status(201).json({
      success: true,
      data: createdPrize,
      message: 'Prize created successfully'
    });
  } catch (error: any) {
    console.error('Error creating prize:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create prize',
      message: error.message
    });
  }
});

/**
 * PUT /v1/prizes/:id
 * Update an existing prize
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate partial update data
    const validatedUpdates = validatePartialUpdate<Prize>(updates, validatePrize);
    
    // Verify ID in body matches ID in URL (if provided)
    if (validatedUpdates.id && validatedUpdates.id !== id) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Prize ID in body does not match URL parameter'
      });
    }
    
    const pk = `PRIZE#${id}`;
    const sk = `PRIZE#${id}`;
    
    // Get current item
    const currentItem = await getItem(pk, sk);
    
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        error: 'Prize not found',
        message: `No prize found with id: ${id}`
      });
    }
    
    const currentPrize = currentItem as PrizeDynamoDBItem;
    
    // Update with optimistic locking
    const updatedItem = await updateItem(pk, sk, validatedUpdates, currentPrize.version);
    const updatedPrize = dbItemToPrize(updatedItem as PrizeDynamoDBItem);
    
    return res.status(200).json({
      success: true,
      data: updatedPrize,
      message: 'Prize updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating prize:', error);
    
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
        message: 'Prize was modified by another request. Please retry.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update prize',
      message: error.message
    });
  }
});

/**
 * DELETE /v1/prizes/:id
 * Delete a prize
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `PRIZE#${id}`;
    const sk = `PRIZE#${id}`;
    
    // Check if prize exists
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Prize not found',
        message: `No prize found with id: ${id}`
      });
    }
    
    await deleteItem(pk, sk);
    
    return res.status(200).json({
      success: true,
      message: 'Prize deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting prize:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete prize',
      message: error.message
    });
  }
});

export default router;
