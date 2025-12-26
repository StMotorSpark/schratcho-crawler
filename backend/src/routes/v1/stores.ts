/**
 * Store API Routes (v1)
 * 
 * RESTful endpoints for Store CRUD operations.
 */

import { Router, type Request, type Response } from 'express';
import { getItem, getItemsByEntityType, putItem, updateItem, deleteItem } from '../../db/dynamodb';
import { validateStore, validatePartialUpdate, ValidationError } from '../../utils/validation';
import { storeToDBItem, dbItemToStore, type StoreDynamoDBItem } from '../../types/store';
import type { Store } from '../../../../core/mechanics/stores';

const router = Router();

/**
 * GET /v1/stores
 * Get all stores
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await getItemsByEntityType('Store');
    const stores = items.map((item) => dbItemToStore(item as StoreDynamoDBItem));
    return res.status(200).json({
      success: true,
      data: stores,
      count: stores.length
    });
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stores',
      message: error.message
    });
  }
});

/**
 * GET /v1/stores/:id
 * Get a single store by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `STORE#${id}`;
    const sk = `STORE#${id}`;
    
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: `No store found with id: ${id}`
      });
    }
    
    const store = dbItemToStore(item as StoreDynamoDBItem);
    return res.status(200).json({
      success: true,
      data: store
    });
  } catch (error: any) {
    console.error('Error fetching store:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch store',
      message: error.message
    });
  }
});

/**
 * POST /v1/stores
 * Create a new store
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const storeData = req.body;
    
    // Validate the store data
    validateStore(storeData);
    
    // Check if store already exists
    const pk = `STORE#${storeData.id}`;
    const sk = `STORE#${storeData.id}`;
    const existing = await getItem(pk, sk);
    
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Store already exists',
        message: `A store with id '${storeData.id}' already exists`
      });
    }
    
    // Convert to DynamoDB item and save
    const dbItem = storeToDBItem(storeData);
    await putItem(dbItem);
    
    const createdStore = dbItemToStore(dbItem);
    return res.status(201).json({
      success: true,
      data: createdStore,
      message: 'Store created successfully'
    });
  } catch (error: any) {
    console.error('Error creating store:', error);
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create store',
      message: error.message
    });
  }
});

/**
 * PUT /v1/stores/:id
 * Update an existing store
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate partial update data
    const validatedUpdates = validatePartialUpdate<Store>(updates, validateStore);
    
    // Verify ID in body matches ID in URL (if provided)
    if (validatedUpdates.id && validatedUpdates.id !== id) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Store ID in body does not match URL parameter'
      });
    }
    
    const pk = `STORE#${id}`;
    const sk = `STORE#${id}`;
    
    // Get current item
    const currentItem = await getItem(pk, sk);
    
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: `No store found with id: ${id}`
      });
    }
    
    const currentStore = currentItem as StoreDynamoDBItem;
    
    // Update with optimistic locking
    const updatedItem = await updateItem(pk, sk, validatedUpdates, currentStore.version);
    const updatedStore = dbItemToStore(updatedItem as StoreDynamoDBItem);
    
    return res.status(200).json({
      success: true,
      data: updatedStore,
      message: 'Store updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating store:', error);
    
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
        message: 'Store was modified by another request. Please retry.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to update store',
      message: error.message
    });
  }
});

/**
 * DELETE /v1/stores/:id
 * Delete a store
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pk = `STORE#${id}`;
    const sk = `STORE#${id}`;
    
    // Check if store exists
    const item = await getItem(pk, sk);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: `No store found with id: ${id}`
      });
    }
    
    await deleteItem(pk, sk);
    
    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting store:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete store',
      message: error.message
    });
  }
});

export default router;
