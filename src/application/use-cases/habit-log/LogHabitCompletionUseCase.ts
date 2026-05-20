/**
 * LogHabitCompletionUseCase
 *
 * Layer: Application
 * Responsibility: Record that a user completed a habit on a given date.
 *
 * Business rules enforced here (in coordination with domain):
 *   - Habit must be active and owned by the user.
 *   - A habit cannot be logged more than once on the same calendar day
 *     (idempotency guard delegated to repository query).
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { IHabitLogRepository } from '../../../domain/repositories/IHabitLogRepository';
import { HabitLog } from '../../../domain/entities/HabitLog';
import { HabitId } from '../../../domain/value-objects/HabitId';
import { HabitLogId } from '../../../domain/value-objects/HabitLogId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { DomainValidationError } from '../../../domain/exceptions/DomainValidationError';
import { DomainConflictError } from '../../../domain/exceptions/DomainConflictError';
import { LogHabitCompletionDto, HabitLogResponseDto } from '../../dtos/HabitLogDto';
import { HabitLogMapper } from '../../mappers/HabitLogMapper';
import { IIdGenerator } from '../../ports/IIdGenerator';

export class LogHabitCompletionUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly habitLogRepository: IHabitLogRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: LogHabitCompletionDto): Promise<HabitLogResponseDto> {
    const habitId = HabitId.from(dto.habitId);
    const userId = UserId.from(dto.userId);

    // Resolve completion date (default to now)
    const completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();
    if (isNaN(completedAt.getTime())) {
      throw new DomainValidationError(`Invalid completedAt date: '${dto.completedAt}'.`);
    }

    // Verify habit exists and is owned by the user
    const habit = await this.habitRepository.findById(habitId);
    if (!habit || !habit.isOwnedBy(userId)) {
      throw new DomainNotFoundError('Habit', dto.habitId);
    }

    // Guard: habit must be active
    if (!habit.isActive()) {
      throw new DomainValidationError(
        `Habit '${habit.name}' is not active and cannot be logged.`,
      );
    }

    // Guard: prevent duplicate log on the same calendar day
    const alreadyLogged = await this.habitLogRepository.existsForDate(habitId, completedAt);
    if (alreadyLogged) {
      throw new DomainConflictError(
        `Habit '${habit.name}' has already been logged for ${completedAt.toISOString().slice(0, 10)}.`,
      );
    }

    // Create log entity (domain validates count and note)
    const log = HabitLog.create({
      id: HabitLogId.from(this.idGenerator.generate()),
      habitId,
      userId,
      completedAt,
      note: dto.note ?? '',
      count: dto.count ?? 1,
    });

    // Advance streak on the habit aggregate
    habit.recordCompletion();

    // Persist both in a logical unit (real transaction managed by infra)
    await this.habitLogRepository.save(log);
    await this.habitRepository.update(habit);

    return HabitLogMapper.toDto(log);
  }
}
