# DynamoDB Storage Documentation

## Overview

This document describes the DynamoDB storage solution for the Schratcho Crawler game backend. The implementation uses a single-table design to store game data including Prizes, Scratchers, Ticket Layouts, and Stores.

## Table of Contents

1. [Table Structure](#table-structure)
2. [Data Models](#data-models)
3. [Access Patterns](#access-patterns)
4. [Seeding Data](#seeding-data)
5. [Type Definitions](#type-definitions)

---

## Table Structure

### Primary Table: `schratcho-game-data`

**Billing Mode**: Pay-per-request (on-demand)  
**Encryption**: AWS Managed  
**Point-in-Time Recovery**: Enabled  
**Removal Policy**: Retain (data preserved on stack deletion)

#### Keys

- **Partition Key (PK)**: `STRING` - Entity-specific identifier
- **Sort Key (SK)**: `STRING` - Entity-specific identifier (same as PK for single items)

#### Global Secondary Index: `EntityTypeIndex`

Allows efficient queries by entity type (e.g., "get all prizes").

- **Partition Key**: `entityType` (STRING)
- **Sort Key**: `createdAt` (STRING - ISO 8601 format)
- **Projection Type**: ALL

#### Key Patterns

| Entity Type | PK Format | SK Format | Example |
|-------------|-----------|-----------|---------|
| Prize | `PRIZE#<id>` | `PRIZE#<id>` | `PRIZE#grand-prize` |
| Scratcher | `SCRATCHER#<id>` | `SCRATCHER#<id>` | `SCRATCHER#coin` |
| Ticket | `TICKET#<id>` | `TICKET#<id>` | `TICKET#classic` |
| Store | `STORE#<id>` | `STORE#<id>` | `STORE#starter-market` |

---

## Data Models

### Common Attributes

All entities include these base attributes:

```typescript
{
  PK: string;              // Partition key
  SK: string;              // Sort key
  entityType: EntityType;  // 'Prize' | 'Scratcher' | 'Ticket' | 'Store'
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
  version: number;         // For optimistic locking
}
```

### Prize

Extends the base model with prize-specific attributes:

```typescript
{
  id: string;
  name: string;
  value: string;
  emoji: string;
  effects?: PrizeEffect;
  // + common attributes
}
```

**Example**:
```json
{
  "PK": "PRIZE#grand-prize",
  "SK": "PRIZE#grand-prize",
  "entityType": "Prize",
  "id": "grand-prize",
  "name": "Grand Prize",
  "value": "1000 Gold",
  "emoji": "🏆",
  "effects": {
    "stateEffects": [
      {
        "field": "currentGold",
        "operation": "add",
        "value": 1000
      }
    ],
    "achievementId": "jackpot"
  },
  "createdAt": "2025-12-21T20:00:00.000Z",
  "updatedAt": "2025-12-21T20:00:00.000Z",
  "version": 1
}
```

### Scratcher

Extends the base model with scratcher-specific attributes:

```typescript
{
  id: string;
  name: string;
  description: string;
  symbol: string;
  scratchRadius: number;
  style?: {
    overlayColor?: string;
    overlayPattern?: string;
  };
  // + common attributes
}
```

### Ticket Layout

Extends the base model with ticket layout-specific attributes:

```typescript
{
  id: string;
  name: string;
  description: string;
  type?: 'Core' | 'Hand' | 'Crawl';
  scratchAreas: ScratchAreaConfig[];
  revealMechanic: string;
  winCondition: string;
  ticketWidth: number;
  ticketHeight: number;
  goldCost?: number;
  prizeConfigs?: PrizeConfig[];
  // + common attributes
}
```

### Store

Extends the base model with store-specific attributes:

```typescript
{
  id: string;
  name: string;
  description: string;
  unlockRequirement: number;
  ticketIds: string[];
  icon: string;
  // + common attributes
}
```

---

## Access Patterns

### 1. Get Item by ID

**Pattern**: Direct key lookup  
**Performance**: O(1) - Single item retrieval

```typescript
// Get a specific prize
PK = "PRIZE#grand-prize"
SK = "PRIZE#grand-prize"
```

### 2. List All Items of Type

**Pattern**: Query using EntityTypeIndex GSI  
**Performance**: Efficient scan with index

```typescript
// Get all prizes
Query EntityTypeIndex where:
  entityType = "Prize"
  
// Results sorted by createdAt (oldest first)
```

### 3. Query with Sort Order

```typescript
// Get all tickets ordered by creation date
Query EntityTypeIndex where:
  entityType = "Ticket"
  SortKeyCondition: createdAt > "2025-01-01T00:00:00.000Z"
```

---

## Seeding Data

### Overview

The seeding script (`scripts/seed-data.ts`) populates the DynamoDB table with initial game data from the core mechanics module. This is a **one-time operation** performed after the initial CDK deployment.

### Prerequisites

1. Deploy the CDK stack first:
   ```bash
   cd backend
   npm run build
   npm run deploy
   ```

2. Ensure AWS credentials are configured:
   ```bash
   aws configure
   # or use environment variables
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_REGION=us-east-1
   ```

### Running the Seeding Script

```bash
cd backend
npm run seed-data
```

### Environment Variables

- `AWS_REGION`: AWS region (default: `us-east-1`)
- `GAME_DATA_TABLE_NAME`: DynamoDB table name (default: `schratcho-game-data`)

### What Gets Seeded

The script seeds the following entities:

1. **Prizes** (~15 items)
   - All prizes from `core/mechanics/prizes.ts`
   - Includes effects, achievements, and hand effects

2. **Scratchers** (~6 items)
   - All scratchers from `core/mechanics/scratchers.ts`
   - Includes visual styles and scratch radius

3. **Ticket Layouts** (~8 items)
   - All ticket layouts from `core/mechanics/ticketLayouts.ts`
   - Includes scratch areas, win conditions, and prize configs

4. **Stores** (~3 items)
   - All stores from `core/mechanics/stores.ts`
   - Includes unlock requirements and available tickets

### Seeding Process

The script:

1. Reads data from core/mechanics modules
2. Transforms each item to DynamoDB format using type converters
3. Batches items in groups of 25 (DynamoDB BatchWrite limit)
4. Writes batches sequentially with error handling
5. Reports progress and final counts

### Output Example

```
=== Schratcho Crawler Data Seeding ===
Region: us-east-1
Table: schratcho-game-data

1. Seeding Prizes...
Writing 15 Prize items in 1 batch(es)...
  Batch 1/1 written successfully
✓ 15 prizes seeded successfully

2. Seeding Scratchers...
Writing 6 Scratcher items in 1 batch(es)...
  Batch 1/1 written successfully
✓ 6 scratchers seeded successfully

3. Seeding Ticket Layouts...
Writing 8 Ticket items in 1 batch(es)...
  Batch 1/1 written successfully
✓ 8 ticket layouts seeded successfully

4. Seeding Stores...
Writing 3 Store items in 1 batch(es)...
  Batch 1/1 written successfully
✓ 3 stores seeded successfully

=== Data Seeding Complete ===
Total items seeded:
  - Prizes: 15
  - Scratchers: 6
  - Ticket Layouts: 8
  - Stores: 3
  - Total: 32

✓ Seeding script completed successfully
```

### Important Notes

- **Run only once**: The script is designed for initial population. Running multiple times will overwrite existing data.
- **No duplicate checking**: The script does not check for existing items before writing.
- **Manual process**: This is intentionally a manual script to prevent accidental data overwrites.
- **Future enhancements**: Consider adding flags like `--force` or `--dry-run` for better control.

### Verifying Seeded Data

You can verify the data using AWS CLI:

```bash
# Count items by entity type
aws dynamodb query \
  --table-name schratcho-game-data \
  --index-name EntityTypeIndex \
  --key-condition-expression "entityType = :type" \
  --expression-attribute-values '{":type":{"S":"Prize"}}' \
  --select COUNT

# Get a specific item
aws dynamodb get-item \
  --table-name schratcho-game-data \
  --key '{"PK":{"S":"PRIZE#grand-prize"},"SK":{"S":"PRIZE#grand-prize"}}'
```

---

## Type Definitions

### Shared Types Location

Type definitions are shared between `core/mechanics` and `backend/src/types`:

```
core/mechanics/
  ├── prizes.ts          # Core Prize type
  ├── scratchers.ts      # Core Scratcher type
  ├── ticketLayouts.ts   # Core TicketLayout type
  └── stores.ts          # Core Store type

backend/src/types/
  ├── prize.ts           # PrizeDynamoDBItem + converters
  ├── scratcher.ts       # ScratcherDynamoDBItem + converters
  ├── ticket.ts          # TicketDynamoDBItem + converters
  ├── store.ts           # StoreDynamoDBItem + converters
  └── index.ts           # Exports all types
```

### Type Converters

Each data model file includes converter functions:

```typescript
// Convert core type to DB item
function prizeToDBItem(prize: CorePrize): PrizeDynamoDBItem

// Convert DB item to core type
function dbItemToPrize(item: PrizeDynamoDBItem): CorePrize
```

These converters:
- Add DynamoDB-specific fields (PK, SK, entityType, timestamps, version)
- Strip DynamoDB fields when converting back to core types
- Ensure type safety between core logic and database storage

### Usage Example

```typescript
import { prizeToDBItem, dbItemToPrize } from './types/prize';
import { getAllPrizes } from '../../core/mechanics/prizes';

// Convert core prizes to DB items
const prizes = getAllPrizes();
const dbItems = prizes.map(prizeToDBItem);

// Store in DynamoDB...

// Later, retrieve and convert back
const retrievedItem = /* ... from DynamoDB ... */;
const corePrize = dbItemToPrize(retrievedItem);
```

---

## Error Handling and Logging

### DynamoDB Operations

All DynamoDB operations should include:

1. **Try-catch blocks**: Wrap all AWS SDK calls
2. **Detailed error logging**: Log operation type, entity ID, and error details
3. **Retry logic**: For transient failures (implement as needed)
4. **Validation**: Validate data before writing to DynamoDB

### Example

```typescript
try {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: prizeItem
  }));
  console.log(`✓ Prize ${prizeItem.id} stored successfully`);
} catch (error) {
  console.error(`❌ Error storing prize ${prizeItem.id}:`, error);
  throw error;
}
```

---

## Future Enhancements

### Planned Features (Out of Scope for Now)

1. **CRUD Endpoints**: REST API endpoints for game data management
2. **Caching Layer**: Add caching for frequently accessed data
3. **Advanced Indexing**: Additional GSIs for complex queries
4. **Data Versioning**: Track historical changes to game objects
5. **Batch Updates**: Scripts for bulk data updates
6. **Data Validation**: Schema validation before writes
7. **Monitoring**: CloudWatch metrics and alarms for table operations

---

## Troubleshooting

### Common Issues

#### 1. "Table not found" error

**Cause**: CDK stack not deployed or table not created  
**Solution**: Deploy the stack first:
```bash
cd backend
npm run build
npm run deploy
```

#### 2. "Access Denied" error

**Cause**: AWS credentials not configured or insufficient permissions  
**Solution**: Configure AWS credentials and ensure IAM permissions include:
- `dynamodb:PutItem`
- `dynamodb:BatchWriteItem`
- `dynamodb:Query`
- `dynamodb:GetItem`

#### 3. Seeding script fails mid-batch

**Cause**: Network issue or rate limiting  
**Solution**: The script will fail fast and report the batch that failed. You can:
1. Check the error message for details
2. Re-run the script (will overwrite existing data)
3. Manually verify data using AWS Console or CLI

#### 4. Type errors during build

**Cause**: Mismatch between core types and DB types  
**Solution**: Ensure core mechanics are up to date and converter functions are properly typed

---

## References

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Single-Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
