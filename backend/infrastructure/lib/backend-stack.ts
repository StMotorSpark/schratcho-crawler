import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for game data (single-table design)
    // Stores: Prizes, Scratchers, Tickets, and Stores
    const gameDataTable = new dynamodb.Table(this, 'SchratchoGameDataTable', {
      tableName: 'schratcho-game-data',
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand pricing for variable workloads
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true, // Enable point-in-time recovery for data protection
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Retain table on stack deletion to prevent data loss
      
      // Enable streams for potential future use (event processing, replication, etc.)
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Global Secondary Index for querying by entity type
    // Allows efficient queries like "get all prizes" or "get all stores"
    gameDataTable.addGlobalSecondaryIndex({
      indexName: 'EntityTypeIndex',
      partitionKey: {
        name: 'entityType',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Lambda function for the backend API
    const apiLambda = new lambdaNodejs.NodejsFunction(this, 'SchratchoBackendFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../src/lambda.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        NODE_ENV: 'production',
        GAME_DATA_TABLE_NAME: gameDataTable.tableName,
      },
      description: 'Schratcho Crawler Backend API Lambda Function',
      bundling: {
        target: 'node20',
        format: lambdaNodejs.OutputFormat.CJS,
        sourcesContent: false
      }
    });

    // Grant Lambda read/write permissions to the DynamoDB table
    gameDataTable.grantReadWriteData(apiLambda);

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'SchratchoBackendAPI', {
      restApiName: 'Schratcho Crawler Backend API',
      description: 'Backend API for Schratcho Crawler game',
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // TODO: Authentication Placeholder
    // When implementing authentication, uncomment and configure one of these options:
    // 1. AWS Cognito User Pool
    // 2. API Keys
    // 3. Custom Lambda Authorizer
    // 4. IAM Authentication
    // For now, endpoints are open (no authorizer applied)

    // Integration with Lambda
    const lambdaIntegration = new apigateway.LambdaIntegration(apiLambda, {
      proxy: true
    });

    // Add routes
    // Health check endpoint (no auth required for health checks)
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    // Root endpoint
    api.root.addMethod('GET', lambdaIntegration);

    // v1 API routes
    const v1Resource = api.root.addResource('v1');
    v1Resource.addMethod('GET', lambdaIntegration); // v1 root
    
    // v1 Prize endpoints
    const prizesResource = v1Resource.addResource('prizes');
    prizesResource.addMethod('GET', lambdaIntegration); // List all prizes
    prizesResource.addMethod('POST', lambdaIntegration); // Create prize
    const prizeResource = prizesResource.addResource('{id}');
    prizeResource.addMethod('GET', lambdaIntegration); // Get prize by ID
    prizeResource.addMethod('PUT', lambdaIntegration); // Update prize
    prizeResource.addMethod('DELETE', lambdaIntegration); // Delete prize

    // v1 Scratcher endpoints
    const scratchersResource = v1Resource.addResource('scratchers');
    scratchersResource.addMethod('GET', lambdaIntegration); // List all scratchers
    scratchersResource.addMethod('POST', lambdaIntegration); // Create scratcher
    const scratcherResource = scratchersResource.addResource('{id}');
    scratcherResource.addMethod('GET', lambdaIntegration); // Get scratcher by ID
    scratcherResource.addMethod('PUT', lambdaIntegration); // Update scratcher
    scratcherResource.addMethod('DELETE', lambdaIntegration); // Delete scratcher

    // v1 Ticket endpoints
    const ticketsResource = v1Resource.addResource('tickets');
    ticketsResource.addMethod('GET', lambdaIntegration); // List all tickets
    ticketsResource.addMethod('POST', lambdaIntegration); // Create ticket
    const ticketResource = ticketsResource.addResource('{id}');
    ticketResource.addMethod('GET', lambdaIntegration); // Get ticket by ID
    ticketResource.addMethod('PUT', lambdaIntegration); // Update ticket
    ticketResource.addMethod('DELETE', lambdaIntegration); // Delete ticket

    // v1 Store endpoints
    const storesResource = v1Resource.addResource('stores');
    storesResource.addMethod('GET', lambdaIntegration); // List all stores
    storesResource.addMethod('POST', lambdaIntegration); // Create store
    const storeResource = storesResource.addResource('{id}');
    storeResource.addMethod('GET', lambdaIntegration); // Get store by ID
    storeResource.addMethod('PUT', lambdaIntegration); // Update store
    storeResource.addMethod('DELETE', lambdaIntegration); // Delete store

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Backend API Gateway URL',
      exportName: 'SchratchoBackendApiUrl'
    });

    // Output the Lambda function name
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: apiLambda.functionName,
      description: 'Backend Lambda Function Name',
      exportName: 'SchratchoBackendLambdaName'
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'GameDataTableName', {
      value: gameDataTable.tableName,
      description: 'Game Data DynamoDB Table Name',
      exportName: 'SchratchoGameDataTableName'
    });

    // Output the DynamoDB table ARN
    new cdk.CfnOutput(this, 'GameDataTableArn', {
      value: gameDataTable.tableArn,
      description: 'Game Data DynamoDB Table ARN',
      exportName: 'SchratchoGameDataTableArn'
    });
  }
}
