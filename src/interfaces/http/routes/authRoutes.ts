/**
 * Auth Routes
 *
 * Layer: Interfaces
 * Responsibility: Map authentication HTTP routes to UserController methods.
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export function createAuthRouter(controller: UserController): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);

  return router;
}
