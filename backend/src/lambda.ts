import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import app from './index.js';

// Simple Lambda handler that converts API Gateway events to Express-compatible format
export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const path = event.path || '/';
  const method = event.httpMethod || 'GET';

  // Simple health check handling for Lambda
  if (path === '/health' && method === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'schratcho-crawler-backend'
      })
    };
  }

  // Root endpoint handling
  if (path === '/' && method === 'GET') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Schratcho Crawler Backend API',
        version: '1.0.0',
        endpoints: {
          health: '/health'
        }
      })
    };
  }

  // Default 404 response
  return {
    statusCode: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      error: 'Not Found',
      path,
      method
    })
  };
};
