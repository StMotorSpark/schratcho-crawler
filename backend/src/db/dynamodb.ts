/**
 * DynamoDB Service Layer
 * 
 * Provides CRUD operations for game data stored in DynamoDB.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  DeleteCommand, 
  QueryCommand,
  UpdateCommand,
  type QueryCommandInput,
  type PutCommandInput,
  type UpdateCommandInput
} from '@aws-sdk/lib-dynamodb';
import type { 
  PrizeDynamoDBItem, 
  ScratcherDynamoDBItem, 
  TicketDynamoDBItem, 
  StoreDynamoDBItem,
  EntityType 
} from '../types';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

// Get table name from environment variable
const TABLE_NAME = process.env.GAME_DATA_TABLE_NAME || 'schratcho-game-data';

/**
 * Generic type for all DynamoDB items
 */
type DynamoDBItem = PrizeDynamoDBItem | ScratcherDynamoDBItem | TicketDynamoDBItem | StoreDynamoDBItem;

/**
 * Get an item by its PK and SK
 */
export async function getItem(pk: string, sk: string): Promise<DynamoDBItem | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk }
  });

  const response = await docClient.send(command);
  return response.Item as DynamoDBItem || null;
}

/**
 * Get all items of a specific entity type
 */
export async function getItemsByEntityType(entityType: EntityType): Promise<DynamoDBItem[]> {
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    IndexName: 'EntityTypeIndex',
    KeyConditionExpression: 'entityType = :entityType',
    ExpressionAttributeValues: {
      ':entityType': entityType
    }
  };

  const command = new QueryCommand(params);
  const response = await docClient.send(command);
  return (response.Items as DynamoDBItem[]) || [];
}

/**
 * Put (create or update) an item
 */
export async function putItem(item: DynamoDBItem): Promise<DynamoDBItem> {
  const params: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: item
  };

  const command = new PutCommand(params);
  await docClient.send(command);
  return item;
}

/**
 * Update an item with optimistic locking
 */
export async function updateItem(
  pk: string, 
  sk: string, 
  updates: Partial<DynamoDBItem>,
  currentVersion: number
): Promise<DynamoDBItem> {
  const now = new Date().toISOString();
  
  // Build update expression dynamically
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {
    ':newVersion': currentVersion + 1,
    ':currentVersion': currentVersion,
    ':updatedAt': now
  };

  // Add updatedAt and version
  updateExpressions.push('#updatedAt = :updatedAt');
  updateExpressions.push('#version = :newVersion');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeNames['#version'] = 'version';

  // Add other update fields
  Object.keys(updates).forEach((key) => {
    if (key !== 'PK' && key !== 'SK' && key !== 'entityType' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'version') {
      const placeholder = `#${key}`;
      const valuePlaceholder = `:${key}`;
      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key as keyof DynamoDBItem];
    }
  });

  const params: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ConditionExpression: '#version = :currentVersion',
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const command = new UpdateCommand(params);
  const response = await docClient.send(command);
  return response.Attributes as DynamoDBItem;
}

/**
 * Delete an item
 */
export async function deleteItem(pk: string, sk: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk }
  });

  await docClient.send(command);
}
