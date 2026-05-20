/**
 * CreateHabitUseCase
 *
 * Layer: Application
 * Responsibility: Orchestrates the creation of a new habit.
 *
 * Flow:
 *   1. Validate that the user exists.
 *   2. Build domain value objects (HabitId, UserId, HabitFrequency).
 *   3. Create the Habit entity (domain validates invariants).
 *   4. Persist via repository.
 *   5. Return a DTO — never the raw entity.
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Habit } from '../../../domain/entities/Habit';
import { HabitId } from '../../../domain/value-objects/HabitId';
import { UserId } from '../../../domain/value-objects/UserId';
import { HabitFrequency } from '../../../domain/value-objects/HabitFrequency';
import { DomainNotFoundError } from '../../../domain/exceptions/DomainNotFoundError';
import { CreateHabitDto, HabitResponseDto } from '../../dtos/HabitDto';
import { HabitMapper } from '../../mappers/HabitMapper';
import { IIdGenerator } from '../../ports/IIdGenerator';

export class CreateHabitUseCase {
  constructor(
    private readonly habitRepository: IHabitRepository,
    private readonly userRepository: IUserRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: CreateHabitDto): Promise<HabitResponseDto> {
    // 1. Verify user exists
    const userId = UserId.from(dto.userId);
    const userExists = await this.userRepository.exists(userId);
    if (!userExists) {
      throw new DomainNotFoundError('User', dto.userId);
    }

    // 2. Build domain objects
    const habitId = HabitId.from(this.idGenerator.generate());
    const frequency = HabitFrequency.create({
      type: dto.frequencyType,
      timesPerWeek: dto.timesPerWeek,
    });

    // 3. Create entity (invariants validated inside Habit.create)
    const habit = Habit.create({
      id: habitId,
      userId,
      name: dto.name,
      description: dto.description,
      frequency,
      targetCount: dto.targetCount,
    });

    // 4. Persist
    await this.habitRepository.save(habit);

    // 5. Return DTO
    return HabitMapper.toDto(habit);
  }
}
