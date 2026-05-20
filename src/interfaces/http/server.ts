/**
 * HTTP Server Entry Point
 *
 * Layer: Interfaces
 * Responsibility: Bootstrap the application — load env, build the DI container,
 * create the Express app, and start listening.
 *
 * This is the process entry point for the Node.js service.
 */

import 'dotenv/config';
import { buildContainer } from '../../infrastructure/container/Container';
import { createApp } from './app';
import { logger } from '../../infrastructure/logging/WinstonLogger';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

async function bootstrap(): Promise<void> {
  const container = buildContainer();
  const app = createApp(container);

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Habit-Tracker-Daemon is running on http://localhost:${PORT}`);
    logger.info(`   Environment : ${process.env['NODE_ENV'] ?? 'development'}`);
    logger.info(`   Health      : http://localhost:${PORT}/health/live`);
    logger.info(`   API         : http://localhost:${PORT}/api/v1`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = (signal: string): void => {
    logger.info(`Received ${signal} — gracefully shutting down...`);
    server.close(async () => {
      await container.db.close();
      logger.info('Server closed. Goodbye.');
      process.exit(0);
    });

    // Force-kill after 10 s if connections don't drain
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  process.stderr.write(`Failed to start server: ${String(err)}\n`);
  process.exit(1);
});
