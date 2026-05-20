/**
 * ListHabitsUseCase
 *
 * Layer: Application
 * Responsibility: Return a paginated list of habits for a given user.
 */

import { IHabitRepository } from '../../../domain/repositories/IHabitRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { ListHabitsDto, PaginatedHabitsDto } from '../../dtos/HabitDto';
import { HabitMapper } from '../../mappers/HabitMapper';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class ListHabitsUseCase {
  constructor(private readonly habitRepository: IHabitRepository) {}

  async execute(dto: ListHabitsDto): Promise<PaginatedHabitsDto> {
    const userId = UserId.from(dto.userId);
    const page = Math.max(1, dto.page ?? DEFAULT_PAGE);
    const pageSize = Math.min(dto.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = (page - 1) * pageSize;

    const [habits, total] = await Promise.all([
      this.habitRepository.findAllByUserId(userId, {
        status: dto.status,
        limit: pageSize,
        offset,
      }),
      this.habitRepository.countByUserId(userId, { status: dto.status }),
    ]);

    return {
      items: HabitMapper.toDtoList(habits),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
