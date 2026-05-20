/**
 * UpdateHabitUseCase
 *
 * Layer: Application
 * Responsibility: Update a habit's mutable fields after ownership check.
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { HabitId } from '../../../domain/value-objects/HabitId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { UpdateHabitDto, HabitResponseDto } from '../../dtos/HabitDto';
import { HabitMapper } from '../../mappers/HabitMapper';

export class UpdateHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(dto: UpdateHabitDto): Promise<HabitResponseDto> {
    const habitId = HabitId.from(dto.habitId);
    const userId = UserId.from(dto.userId);

    const habit = await this.habitRepository.findById(habitId);
    if (!habit || !habit.isOwnedBy(userId)) {
      throw new DomainNotFoundError('Habit', dto.habitId);
    }

    // Domain entity validates name and targetCount invariants
    habit.update(dto.name, dto.description, dto.targetCount);

    await this.habitRepository.update(habit);

    return HabitMapper.toDto(habit);
  }
}
