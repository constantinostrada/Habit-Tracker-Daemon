/**
 * Habit Routes
 *
 * Layer: Interfaces
 * Responsibility: Map HTTP routes to HabitController methods.
 * All routes require authentication.
 */

import { Router } from 'express';
import { HabitController } from '../controllers/HabitController';
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { ITokenService } from '../../../application/ports/ITokenService';

export function createHabitRouter(
  controller: HabitController,
  tokenService: ITokenService,
): Router {
  const router = Router();
  const auth = createAuthMiddleware(tokenService);

  // All habit routes require authentication
  router.use(auth);

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.archive);

  // Habit log sub-routes
  router.post('/:id/logs', controller.logCompletion);
  router.get('/:id/stats', controller.getStats);

  return router;
}
