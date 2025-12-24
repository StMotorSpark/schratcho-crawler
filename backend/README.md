# Schratcho Crawler Backend

This is the backend API for the Schratcho Crawler game. It provides RESTful endpoints for game functionality and is built to be deployed on AWS using serverless architecture.

## Architecture

The backend uses the following AWS services:
- **AWS Lambda** - Serverless compute for API endpoints
- **API Gateway** - REST API management and routing
- **DynamoDB** - NoSQL database for game data storage
- **CloudFormation** - Infrastructure as Code (via AWS CDK)

## Technology Stack

- **Node.js 20.x** - Runtime environment
- **TypeScript 5.9+** - Type-safe development
- **Express.js** - Web framework (wrapped in Lambda)
- **AWS CDK** - Infrastructure as Code
- **AWS Lambda** - Serverless compute

## Project Structure

```
backend/
├── src/
│   ├── index.ts        # Express app with API endpoints
│   ├── lambda.ts       # Lambda handler wrapper
│   └── types/          # Shared type definitions for DynamoDB
│       ├── index.ts    # Exports all types
│       ├── prize.ts    # Prize data model
│       ├── scratcher.ts # Scratcher data model
│       ├── ticket.ts   # Ticket layout data model
│       └── store.ts    # Store data model
├── scripts/
│   └── seed-data.ts    # Data seeding script for DynamoDB
├── infrastructure/
│   ├── bin/
│   │   └── app.ts      # CDK app entry point
│   ├── lib/
│   │   └── backend-stack.ts  # CDK stack definition
│   └── cdk.json        # CDK configuration
├── package.json
├── tsconfig.json
├── README.md
└── STORAGE.md          # DynamoDB storage documentation
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm
- AWS CLI configured (for deployment)
- AWS CDK CLI (install with `npm install -g aws-cdk`)

### Installation

```bash
cd backend
npm install
```

### Development

Run the backend locally for development:

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

### Building

Build the TypeScript code:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory for local testing.

> **Note:** The CDK stack now bundles the Lambda handler directly from `src/lambda.ts` using `esbuild`, so running `npm install` (to ensure `esbuild` is available) is the only prerequisite before deploying.

### Linting

Run TypeScript type checking:

```bash
npm run lint
```

## API Endpoints

All API endpoints follow RESTful conventions and return JSON responses with a consistent structure:
- Success responses include `success: true` and a `data` field
- Error responses include `success: false`, `error`, and `message` fields

### Health Check

**GET** `/health`

Returns the health status of the API.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "service": "schratcho-crawler-backend"
}
```

### Root

**GET** `/`

Returns basic API information.

**Response:**
```json
{
  "message": "Schratcho Crawler Backend API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "v1": "/v1"
  }
}
```

### API v1

All v1 endpoints are prefixed with `/v1`.

**GET** `/v1`

Returns v1 API information.

**Response:**
```json
{
  "version": "v1",
  "message": "Schratcho Crawler Backend API v1",
  "endpoints": {
    "prizes": "/v1/prizes",
    "scratchers": "/v1/scratchers",
    "tickets": "/v1/tickets",
    "stores": "/v1/stores"
  }
}
```

---

### Prize Endpoints

Prizes represent rewards that players can win from scratch tickets.

#### List All Prizes

**GET** `/v1/prizes`

Retrieves all prizes from the database.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "grand-prize",
      "name": "Grand Prize",
      "value": "1000 Gold",
      "emoji": "🏆",
      "effects": { ... }
    }
  ],
  "count": 1
}
```

#### Get Prize by ID

**GET** `/v1/prizes/:id`

Retrieves a specific prize by its ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "grand-prize",
    "name": "Grand Prize",
    "value": "1000 Gold",
    "emoji": "🏆"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Prize not found",
  "message": "No prize found with id: grand-prize"
}
```

#### Create Prize

**POST** `/v1/prizes`

Creates a new prize.

**Request Body:**
```json
{
  "id": "lucky-coin",
  "name": "Lucky Coin",
  "value": "50 Gold",
  "emoji": "🪙"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "lucky-coin",
    "name": "Lucky Coin",
    "value": "50 Gold",
    "emoji": "🪙"
  },
  "message": "Prize created successfully"
}
```

**Response (409):**
```json
{
  "success": false,
  "error": "Prize already exists",
  "message": "A prize with id 'lucky-coin' already exists"
}
```

#### Update Prize

**PUT** `/v1/prizes/:id`

Updates an existing prize. Only the fields provided in the request body will be updated.

**Request Body:**
```json
{
  "value": "100 Gold"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "lucky-coin",
    "name": "Lucky Coin",
    "value": "100 Gold",
    "emoji": "🪙"
  },
  "message": "Prize updated successfully"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Prize not found",
  "message": "No prize found with id: lucky-coin"
}
```

#### Delete Prize

**DELETE** `/v1/prizes/:id`

Deletes a prize.

**Response (200):**
```json
{
  "success": true,
  "message": "Prize deleted successfully"
}
```

---

### Scratcher Endpoints

Scratchers represent tools that players use to scratch tickets.

#### List All Scratchers

**GET** `/v1/scratchers`

Retrieves all scratchers from the database.

#### Get Scratcher by ID

**GET** `/v1/scratchers/:id`

Retrieves a specific scratcher by its ID.

#### Create Scratcher

**POST** `/v1/scratchers`

Creates a new scratcher.

**Request Body:**
```json
{
  "id": "gold-coin",
  "name": "Gold Coin",
  "description": "A shiny gold coin",
  "texture": "gold-metallic",
  "sound": "coin-scratch",
  "capabilities": []
}
```

#### Update Scratcher

**PUT** `/v1/scratchers/:id`

Updates an existing scratcher.

#### Delete Scratcher

**DELETE** `/v1/scratchers/:id`

Deletes a scratcher.

---

### Ticket Endpoints

Tickets represent scratch-off tickets that players can purchase and scratch.

#### List All Tickets

**GET** `/v1/tickets`

Retrieves all ticket layouts from the database.

#### Get Ticket by ID

**GET** `/v1/tickets/:id`

Retrieves a specific ticket layout by its ID.

#### Create Ticket

**POST** `/v1/tickets`

Creates a new ticket layout.

**Request Body:**
```json
{
  "id": "classic-ticket",
  "name": "Classic Scratcher",
  "description": "A classic scratch ticket",
  "goldCost": 10,
  "scratchAreas": [
    {
      "id": "area-1",
      "position": { "x": 0, "y": 0 },
      "size": { "width": 100, "height": 100 }
    }
  ]
}
```

#### Update Ticket

**PUT** `/v1/tickets/:id`

Updates an existing ticket layout.

#### Delete Ticket

**DELETE** `/v1/tickets/:id`

Deletes a ticket layout.

---

### Store Endpoints

Stores represent in-game shops where players can purchase tickets.

#### List All Stores

**GET** `/v1/stores`

Retrieves all stores from the database.

#### Get Store by ID

**GET** `/v1/stores/:id`

Retrieves a specific store by its ID.

#### Create Store

**POST** `/v1/stores`

Creates a new store.

**Request Body:**
```json
{
  "id": "starter-shop",
  "name": "Starter Shop",
  "description": "Your first shop",
  "availableTickets": ["classic-ticket"],
  "unlockThreshold": 0,
  "unlocked": true,
  "theme": "cozy-corner"
}
```

#### Update Store

**PUT** `/v1/stores/:id`

Updates an existing store.

#### Delete Store

**DELETE** `/v1/stores/:id`

Deletes a store.

---

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request** - Validation error
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Prize must have a valid id (string)"
}
```

**404 Not Found** - Resource not found
```json
{
  "success": false,
  "error": "Prize not found",
  "message": "No prize found with id: invalid-id"
}
```

**409 Conflict** - Resource already exists or version conflict
```json
{
  "success": false,
  "error": "Prize already exists",
  "message": "A prize with id 'lucky-coin' already exists"
}
```

**500 Internal Server Error** - Server error
```json
{
  "success": false,
  "error": "Failed to fetch prize",
  "message": "Internal server error details"
}
```



## Deployment

### Prerequisites for Deployment

1. **AWS Account** - You need an AWS account
2. **AWS CLI configured** - Run `aws configure` with your credentials
3. **AWS CDK installed** - Run `npm install -g aws-cdk`
4. **Bootstrap CDK** (first time only):
   ```bash
   cd infrastructure
   cdk bootstrap
   ```

### Deploy to AWS

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Synthesize CloudFormation template:**
   ```bash
   cd infrastructure
   npm run cdk:synth
   ```

3. **Review changes (optional):**
   ```bash
   npm run cdk:diff
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

   Or from the infrastructure directory:
   ```bash
   cdk deploy
   ```

The deployment will output the API Gateway URL. You can test it with:

```bash
curl https://your-api-url.amazonaws.com/prod/health
```

### Deploy via GitHub Actions

The backend can be deployed automatically using GitHub Actions:

1. **Set up AWS credentials in GitHub:**
   - Add `AWS_ROLE_ARN` secret (for OIDC authentication)
   - Optionally add `AWS_REGION` secret (defaults to us-east-1)

2. **Trigger deployment:**
   - Go to Actions tab in GitHub
   - Select "Deploy Backend to AWS" workflow
   - Click "Run workflow"
   - Choose environment (dev/prod)

The workflow will:
- Install dependencies
- Lint the code
- Build the application
- Deploy to AWS using CDK
- Test the health endpoint
- Output the API URL

## Authentication

**Current Status:** Authentication is not yet implemented. All API endpoints are currently open.

**TODO:** Authentication needs to be implemented before production use.

Options for future implementation:
- **AWS Cognito** - User pool for authentication
- **API Keys** - Simple API key authentication
- **Custom Authorizer** - JWT or OAuth-based authentication
- **IAM** - AWS IAM-based authentication

The CDK stack (`infrastructure/lib/backend-stack.ts`) includes TODO comments indicating where authentication should be added when implemented.

## Infrastructure Details

### Lambda Function

- **Runtime:** Node.js 20.x
- **Memory:** 256 MB
- **Timeout:** 10 seconds
- **Entry:** `src/lambda.ts` (bundled with `esbuild` during `cdk deploy`)
- **Handler:** `handler`

### API Gateway

- **Type:** REST API
- **Stage:** prod
- **Throttling:** 50 requests/second, burst of 100
- **CORS:** Enabled for all origins (**not secure for production**)
  - **For production, restrict CORS to trusted origins.**  
    In your CDK stack (`infrastructure/lib/backend-stack.ts`), configure the API Gateway to allow only specific origins. For example:

    ```typescript
    // Example: Restrict CORS to a specific origin in API Gateway
    api.root.addCorsPreflight({
      allowOrigins: ['https://yourdomain.com'], // Replace with your production domain(s)
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    });
    ```
    > **Tip:** Never use `allowOrigins: ['*']` in production. Always specify trusted domains.
### CDK Stack

The infrastructure is defined in `infrastructure/lib/backend-stack.ts` and includes:
- Lambda function for API endpoints
- API Gateway REST API
- Placeholder authorizer (to be replaced)
- CloudWatch logs (automatic)
- IAM roles and permissions (managed by CDK)

## Environment Variables

The Lambda function can use environment variables defined in the CDK stack:

```typescript
environment: {
  NODE_ENV: 'production',
  // Add more as needed
}
```

## Monitoring and Logs

- **CloudWatch Logs:** Automatically created for Lambda function
- **CloudWatch Metrics:** Available for Lambda and API Gateway
- **X-Ray:** Can be enabled for tracing (not currently configured)

## Local Testing

Test the Express app locally:

```bash
npm run dev
```

Then test endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/
```

## Troubleshooting

### Build Errors

If you encounter TypeScript errors:
```bash
npm run lint
```

### Deployment Errors

If CDK deployment fails:
1. Check AWS credentials: `aws sts get-caller-identity`
2. Check CDK bootstrap: `cdk bootstrap`
3. Review CloudFormation events in AWS Console

### Lambda Errors

Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/SchratchoBackendFunction --follow
```

## Future Enhancements

- [ ] Implement proper authentication (Cognito/JWT)
- [x] Add database integration (DynamoDB) - **COMPLETED**
- [x] Add CRUD endpoints for game data (Prizes, Scratchers, Tickets, Stores) - **COMPLETED**
- [x] Add API versioning (v1) - **COMPLETED**
- [ ] Add more game-specific endpoints
- [ ] Implement monitoring and alerting
- [ ] Add automated tests
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Implement rate limiting per user
- [ ] Add logging and error tracking
- [ ] Add pagination for list endpoints

## Storage

The backend now includes DynamoDB storage for game data. See [STORAGE.md](./STORAGE.md) for detailed documentation on:
- DynamoDB table structure
- Data models for Prizes, Scratchers, Tickets, and Stores
- Data seeding process
- Type definitions shared with core mechanics

### Quick Start with Storage

1. **Deploy the CDK stack** (includes DynamoDB table):
   ```bash
   cd backend
   npm run build
   npm run deploy
   ```

2. **Seed initial data** (one-time operation):
   ```bash
   npm run seed-data
   ```

See [STORAGE.md](./STORAGE.md) for complete documentation.

## Development Workflow

1. Make changes to `src/*.ts` files
2. Run `npm run lint` to check for type errors
3. Run `npm run dev` to test locally
4. Run `npm run build` to compile
5. Deploy to AWS with `npm run deploy`

## Contributing

When adding new endpoints:
1. Add route handlers in `src/index.ts`
2. Update Lambda handler in `src/lambda.ts` if needed
3. Update CDK stack in `infrastructure/lib/backend-stack.ts` if needed
4. Update this README with new endpoint documentation
5. Run linting and build before committing

## License

ISC
