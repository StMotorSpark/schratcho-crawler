/**
 * API v1 Routes Index
 * 
 * Aggregates all v1 API routes.
 */

import { Router, type Request, type Response } from 'express';
import prizesRouter from './prizes';
import scratchersRouter from './scratchers';
import ticketsRouter from './tickets';
import storesRouter from './stores';

const router = Router();

// Mount all v1 routes
router.use('/prizes', prizesRouter);
router.use('/scratchers', scratchersRouter);
router.use('/tickets', ticketsRouter);
router.use('/stores', storesRouter);

// v1 root endpoint
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    version: 'v1',
    message: 'Schratcho Crawler Backend API v1',
    endpoints: {
      prizes: '/v1/prizes',
      scratchers: '/v1/scratchers',
      tickets: '/v1/tickets',
      stores: '/v1/stores'
    }
  });
});

export default router;
