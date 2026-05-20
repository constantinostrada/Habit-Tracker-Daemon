/**
 * HealthController
 *
 * Layer: Interfaces
 * Responsibility: Exposes liveness and readiness endpoints for Docker/k8s.
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PostgresClient } from '../../../infrastructure/database/PostgresClient';

export class HealthController {
  constructor(private readonly db: PostgresClient) {}

  /** GET /health/live — always 200 while the process is running */
  liveness = (_req: Request, res: Response): void => {
    res.status(StatusCodes.OK).json({ status: 'ok' });
  };

  /** GET /health/ready — 200 only if DB is reachable */
  readiness = async (_req: Request, res: Response): Promise<void> => {
    const dbOk = await this.db.healthCheck();
    if (dbOk) {
      res.status(StatusCodes.OK).json({ status: 'ok', db: 'connected' });
    } else {
      res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ status: 'degraded', db: 'unreachable' });
    }
  };
}
