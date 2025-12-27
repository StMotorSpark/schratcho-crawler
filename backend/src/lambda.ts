import serverless from 'serverless-http';
import app from './index';

// Export Lambda handler using serverless-http to wrap the Express app
// This provides full Express functionality including all middleware (CORS, routing, etc.)
export const handler = serverless(app);
