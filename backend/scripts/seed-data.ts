/**
 * Data Seeding Script for DynamoDB
 * 
 * This script seeds the DynamoDB table with initial game data from the core mechanics.
 * It reads data from core/mechanics and transforms it to DynamoDB items.
 * 
 * This should be run ONCE after initial deployment to populate the database.
 * 
 * Usage:
 *   npm run seed-data
 * 
 * Environment Variables:
 *   - AWS_REGION: AWS region (default: us-east-1)
 *   - GAME_DATA_TABLE_NAME: DynamoDB table name (default: schratcho-game-data)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { getAllPrizes } from '../../core/mechanics/prizes.js';
import { getScratchers } from '../../core/mechanics/scratchers.js';
import { TICKET_LAYOUTS } from '../../core/mechanics/ticketLayouts.js';
import { DEFAULT_STORES } from '../../core/mechanics/stores.js';
import { prizeToDBItem } from '../src/types/prize.js';
import { scratcherToDBItem } from '../src/types/scratcher.js';
import { ticketToDBItem } from '../src/types/ticket.js';
import { storeToDBItem } from '../src/types/store.js';

// Configuration
const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.GAME_DATA_TABLE_NAME || 'schratcho-game-data';
const BATCH_SIZE = 25; // DynamoDB BatchWrite limit

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Split array into chunks of specified size
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Batch write items to DynamoDB
 */
async function batchWriteItems(items: any[], entityType: string): Promise<void> {
  const batches = chunk(items, BATCH_SIZE);
  
  console.log(`Writing ${items.length} ${entityType} items in ${batches.length} batch(es)...`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const putRequests = batch.map(item => ({
      PutRequest: {
        Item: item
      }
    }));
    
    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: putRequests
        }
      }));
      console.log(`  Batch ${i + 1}/${batches.length} written successfully`);
    } catch (error) {
      console.error(`  Error writing batch ${i + 1}/${batches.length}:`, error);
      throw error;
    }
  }
}

/**
 * Main seeding function
 */
async function seedData(): Promise<void> {
  console.log('=== Schratcho Crawler Data Seeding ===');
  console.log(`Region: ${REGION}`);
  console.log(`Table: ${TABLE_NAME}`);
  console.log('');

  try {
    // Seed Prizes
    console.log('1. Seeding Prizes...');
    const prizes = getAllPrizes();
    const prizeItems = prizes.map(prizeToDBItem);
    await batchWriteItems(prizeItems, 'Prize');
    console.log(`✓ ${prizes.length} prizes seeded successfully\n`);

    // Seed Scratchers
    console.log('2. Seeding Scratchers...');
    const scratchers = getScratchers();
    const scratcherItems = scratchers.map(scratcherToDBItem);
    await batchWriteItems(scratcherItems, 'Scratcher');
    console.log(`✓ ${scratchers.length} scratchers seeded successfully\n`);

    // Seed Tickets
    console.log('3. Seeding Ticket Layouts...');
    const tickets = Object.values(TICKET_LAYOUTS);
    const ticketItems = tickets.map(ticketToDBItem);
    await batchWriteItems(ticketItems, 'Ticket');
    console.log(`✓ ${tickets.length} ticket layouts seeded successfully\n`);

    // Seed Stores
    console.log('4. Seeding Stores...');
    const stores = DEFAULT_STORES;
    const storeItems = stores.map(storeToDBItem);
    await batchWriteItems(storeItems, 'Store');
    console.log(`✓ ${stores.length} stores seeded successfully\n`);

    console.log('=== Data Seeding Complete ===');
    console.log('Total items seeded:');
    console.log(`  - Prizes: ${prizes.length}`);
    console.log(`  - Scratchers: ${scratchers.length}`);
    console.log(`  - Ticket Layouts: ${tickets.length}`);
    console.log(`  - Stores: ${stores.length}`);
    console.log(`  - Total: ${prizes.length + scratchers.length + tickets.length + stores.length}`);
    
  } catch (error) {
    console.error('\n❌ Error during data seeding:', error);
    process.exit(1);
  }
}

// Run the seeding script
seedData()
  .then(() => {
    console.log('\n✓ Seeding script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding script failed:', error);
    process.exit(1);
  });
