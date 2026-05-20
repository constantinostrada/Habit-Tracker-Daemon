/**
 * Express Application Factory
 *
 * Layer: Interfaces
 * Responsibility: Assemble the Express app with all middleware and routes.
 * Kept separate from server.ts so it can be imported in tests without
 * binding to a port.
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';

import { AppContainer } from '../../infrastructure/container/Container';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

// Controllers
import { HabitController } from './controllers/HabitController';
import { UserController } from './controllers/UserController';
import { HealthController } from './controllers/HealthController';

// Routes
import { createHabitRouter } from './routes/habitRoutes';
import { createAuthRouter } from './routes/authRoutes';
import { createHealthRouter } from './routes/healthRoutes';

export function createApp(container: AppContainer): Application {
  const app = express();

  // ── Global middleware ──────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: (process.env['CORS_ORIGINS'] ?? '').split(',').filter(Boolean),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // ── Controllers ────────────────────────────────────────────────────────────
  const habitController = new HabitController(
    container.createHabitUseCase,
    container.getHabitUseCase,
    container.listHabitsUseCase,
    container.updateHabitUseCase,
    container.archiveHabitUseCase,
    container.logHabitCompletionUseCase,
    container.getHabitStatsUseCase,
  );

  const userController = new UserController(
    container.registerUserUseCase,
    container.authenticateUserUseCase,
  );

  const healthController = new HealthController(container.db);

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/v1/habits', createHabitRouter(habitController, container.tokenService));
  app.use('/api/v1/auth', createAuthRouter(userController));
  app.use('/health', createHealthRouter(healthController));

  // Root ping
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Habit-Tracker-Daemon',
      version: '1.0.0',
      status: 'running',
    });
  });

  // 404 handler — must come after all routes
  app.use((_req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'NotFound',
      message: 'The requested endpoint does not exist.',
      statusCode: StatusCodes.NOT_FOUND,
    });
  });

  // Global error handler — must be last
  app.use(errorHandler);

  return app;
}
