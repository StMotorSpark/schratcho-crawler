/**
 * Scratcher API Routes (v1)
 * 
 * RESTful endpoints for Scratcher CRUD operations.
 */

import { Router, type Request, type Response } from 'express';
import { getItem, getItemsByEntityType, putItem, updateItem, deleteItem } from '../../db/dynamodb';
import { validateScratcher, validatePartialUpdate, ValidationError } from '../../utils/validation';
import { scratcherToDBItem, dbItemToScratcher, type ScratcherDynamoDBItem } from '../../types/scratcher';
import type { Scratcher } from '../../../../core/mechanics/scratchers';

const router = Router();

/**
 * GET /v1/scratchers
 * Get all scratchers
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await getItemsByEntityType('Scratcher');
    const scratchers = items.map((item) => dbItemToScratcher(item as ScratcherDynamoDBItem));
    return res.status(200).json({
      success: true,
      data: scratchers,
      count: scratchers.length
    });
  } catch (error: any) {
    console.error('Error fetching scratchers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scratchers',
      message: error.message
    });
  }
});

/**
 * GET /v1/scratchers/:id
 * Get a single scratcher by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `SCRATCHER#${id}`;
    const sk = `SCRATCHER#${id}`;
    
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scratcher not found',
        message: `No scratcher found with id: ${id}`
      });
    }
    
    const scratcher = dbItemToScratcher(item as ScratcherDynamoDBItem);
    return res.status(200).json({
      success: true,
      data: scratcher
    });
  } catch (error: any) {
    console.error('Error fetching scratcher:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch scratcher',
      message: error.message
    });
  }
});

/**
 * POST /v1/scratchers
 * Create a new scratcher
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const scratcherData = req.body;
    
    // Validate the scratcher data
    validateScratcher(scratcherData);
    
    // Check if scratcher already exists
    const pk = `SCRATCHER#${scratcherData.id}`;
    const sk = `SCRATCHER#${scratcherData.id}`;
    const existing = await getItem(pk, sk);
    
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Scratcher already exists',
        message: `A scratcher with id '${scratcherData.id}' already exists`
      });
    }
    
    // Convert to DynamoDB item and save
    const dbItem = scratcherToDBItem(scratcherData);
    await putItem(dbItem);
    
    const createdScratcher = dbItemToScratcher(dbItem);
    return res.status(201).json({
      success: true,
      data: createdScratcher,
      message: 'Scratcher created successfully'
    });
  } catch (error: any) {
    console.error('Error creating scratcher:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create scratcher',
      message: error.message
    });
  }
});

/**
 * PUT /v1/scratchers/:id
 * Update an existing scratcher
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate partial update data
    const validatedUpdates = validatePartialUpdate<Scratcher>(updates, validateScratcher);
    
    // Verify ID in body matches ID in URL (if provided)
    if (validatedUpdates.id && validatedUpdates.id !== id) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Scratcher ID in body does not match URL parameter'
      });
    }
    
    const pk = `SCRATCHER#${id}`;
    const sk = `SCRATCHER#${id}`;
    
    // Get current item
    const currentItem = await getItem(pk, sk);
    
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        error: 'Scratcher not found',
        message: `No scratcher found with id: ${id}`
      });
    }
    
    const currentScratcher = currentItem as ScratcherDynamoDBItem;
    
    // Update with optimistic locking
    const updatedItem = await updateItem(pk, sk, validatedUpdates, currentScratcher.version);
    const updatedScratcher = dbItemToScratcher(updatedItem as ScratcherDynamoDBItem);
    
    return res.status(200).json({
      success: true,
      data: updatedScratcher,
      message: 'Scratcher updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating scratcher:', error);
    
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
        message: 'Scratcher was modified by another request. Please retry.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update scratcher',
      message: error.message
    });
  }
});

/**
 * DELETE /v1/scratchers/:id
 * Delete a scratcher
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `SCRATCHER#${id}`;
    const sk = `SCRATCHER#${id}`;
    
    // Check if scratcher exists
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scratcher not found',
        message: `No scratcher found with id: ${id}`
      });
    }
    
    await deleteItem(pk, sk);
    
    return res.status(200).json({
      success: true,
      message: 'Scratcher deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting scratcher:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete scratcher',
      message: error.message
    });
  }
});

export default router;
