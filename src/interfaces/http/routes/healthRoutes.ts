/**
 * Health Routes
 *
 * Layer: Interfaces
 * Responsibility: Expose liveness and readiness probe endpoints.
 */

import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

export function createHealthRouter(controller: HealthController): Router {
  const router = Router();

  router.get('/live', controller.liveness);
  router.get('/ready', controller.readiness);

  return router;
}
