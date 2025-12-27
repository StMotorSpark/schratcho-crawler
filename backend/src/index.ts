import express, { type Request, type Response } from 'express';
import cors from 'cors';
import v1Router from './routes/v1';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in development. Tighten this for production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'schratcho-crawler-backend'
  });
});

// Mount v1 routes
app.use('/v1', v1Router);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Schratcho Crawler Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      v1: '/v1'
    }
  });
});

// Start server (only if not in Lambda environment)
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
}

export default app;
