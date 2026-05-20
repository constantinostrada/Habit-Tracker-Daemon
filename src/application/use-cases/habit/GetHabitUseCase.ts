/**
 * GetHabitUseCase
 *
 * Layer: Application
 * Responsibility: Retrieve a single habit by ID, enforcing ownership.
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { HabitId } from '../../../domain/value-objects/HabitId';
import { UserId } from '../../../domain/value-objects/UserId';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { DomainValidationError } from '../../../domain/exceptions/DomainValidationError';
import { GetHabitDto, HabitResponseDto } from '../../dtos/HabitDto';
import { HabitMapper } from '../../mappers/HabitMapper';

export class GetHabitUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(dto: GetHabitDto): Promise<HabitResponseDto> {
    const habitId = HabitId.from(dto.habitId);
    const userId = UserId.from(dto.userId);

    const habit = await this.habitRepository.findById(habitId);
    if (!habit) {
      throw new DomainNotFoundError('Habit', dto.habitId);
    }

    if (!habit.isOwnedBy(userId)) {
      // Return not-found to avoid leaking existence to unauthorised callers
      throw new DomainNotFoundError('Habit', dto.habitId);
    }

    return HabitMapper.toDto(habit);
  }
}
