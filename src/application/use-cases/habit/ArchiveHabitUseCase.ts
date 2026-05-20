/**
 * ArchiveHabitUseCase
 *
 * Layer: Application
 * Responsibility: Soft-delete a habit by moving it to 'archived' status.
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { HabitId } from '../../../domain/value-objects/HabitId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { ArchiveHabitDto, HabitResponseDto } from '../../dtos/HabitDto';
import { HabitMapper } from '../../mappers/HabitMapper';

export class ArchiveHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(dto: ArchiveHabitDto): Promise<HabitResponseDto> {
    const habitId = HabitId.from(dto.habitId);
    const userId = UserId.from(dto.userId);

    const habit = await this.habitRepository.findById(habitId);
    if (!habit || !habit.isOwnedBy(userId)) {
      throw new DomainNotFoundError('Habit', dto.habitId);
    }

    habit.archive();

    await this.habitRepository.update(habit);

    return HabitMapper.toDto(habit);
  }
}
