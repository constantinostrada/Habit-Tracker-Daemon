/**
 * HabitController
 *
 * Layer: Interfaces
 * Responsibility: Thin HTTP adapter for habit-related use cases.
 * Pattern: validate input → call use case → serialize output.
 * Contains NO business logic.
 */

import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CreateHabitUseCase } from '../../../application/use-cases/habit/CreateHabitUseCase';
import { GetHabitUseCase } from '../../../application/use-cases/habit/GetHabitUseCase';
import { ListHabitsUseCase } from '../../../application/use-cases/habit/ListHabitsUseCase';
import { UpdateHabitUseCase } from '../../../application/use-cases/habit/UpdateHabitUseCase';
import { ArchiveHabitUseCase } from '../../../application/use-cases/habit/ArchiveHabitUseCase';
import { LogHabitCompletionUseCase } from '../../../application/use-cases/habit-log/LogHabitCompletionUseCase';
import { GetHabitStatsUseCase } from '../../../application/use-cases/habit-log/GetHabitStatsUseCase';

export class HabitController {
  constructor(
    private readonly createHabitUseCase: CreateHabitUseCase,
    private readonly getHabitUseCase: GetHabitUseCase,
    private readonly listHabitsUseCase: ListHabitsUseCase,
    private readonly updateHabitUseCase: UpdateHabitUseCase,
    private readonly archiveHabitUseCase: ArchiveHabitUseCase,
    private readonly logHabitCompletionUseCase: LogHabitCompletionUseCase,
    private readonly getHabitStatsUseCase: GetHabitStatsUseCase,
  ) {}

  /** POST /habits */
  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.userId!;
      const { name, description, frequencyType, timesPerWeek, targetCount } = req.body as {
        name: string;
        description: string;
        frequencyType: string;
        timesPerWeek?: number;
        targetCount: number;
      };

      const result = await this.createHabitUseCase.execute({
        userId,
        name,
        description: description ?? '',
        frequencyType: frequencyType as 'daily' | 'weekly' | 'custom',
        timesPerWeek,
        targetCount,
      });

      res.status(StatusCodes.CREATED).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** GET /habits */
  list = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.userId!;
      const { status, page, pageSize } = req.query as {
        status?: string;
        page?: string;
        pageSize?: string;
      };

      const result = await this.listHabitsUseCase.execute({
        userId,
        status: status as 'active' | 'paused' | 'archived' | undefined,
        page: page ? parseInt(page, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      });

      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** GET /habits/:id */
  getById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.getHabitUseCase.execute({
        habitId: req.params['id'] ?? '',
        userId: req.userId!,
      });
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** PUT /habits/:id */
  update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, description, targetCount } = req.body as {
        name: string;
        description: string;
        targetCount: number;
      };

      const result = await this.updateHabitUseCase.execute({
        habitId: req.params['id'] ?? '',
        userId: req.userId!,
        name,
        description: description ?? '',
        targetCount,
      });

      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /habits/:id  (soft-delete via archive) */
  archive = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.archiveHabitUseCase.execute({
        habitId: req.params['id'] ?? '',
        userId: req.userId!,
      });
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** POST /habits/:id/logs */
  logCompletion = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { completedAt, note, count } = req.body as {
        completedAt?: string;
        note?: string;
        count?: number;
      };

      const result = await this.logHabitCompletionUseCase.execute({
        habitId: req.params['id'] ?? '',
        userId: req.userId!,
        completedAt,
        note,
        count,
      });

      res.status(StatusCodes.CREATED).json({ data: result });
    } catch (err) {
      next(err);
    }
  };

  /** GET /habits/:id/stats */
  getStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.getHabitStatsUseCase.execute(
        req.params['id'] ?? '',
        req.userId!,
      );
      res.status(StatusCodes.OK).json({ data: result });
    } catch (err) {
      next(err);
    }
  };
}
