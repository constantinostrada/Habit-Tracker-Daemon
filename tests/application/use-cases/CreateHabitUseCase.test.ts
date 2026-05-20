/**
 * CreateHabitUseCase Tests
 *
 * Uses in-memory stubs for all dependencies — no DB, no network.
 */

import { CreateHabitUseCase } from '../../../src/application/use-cases/habit/CreateHabitUseCase';
import { IHabitRepository } from '../../../src/domain/repositories/IHabitRepository';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { IIdGenerator } from '../../../src/application/ports/IIdGenerator';
import { DomainNotFoundError } from '../../../src/domain/exceptions/DomainNotFoundError';
import { DomainValidationError } from '../../../src/domain/exceptions/DomainValidationError';
import { Habit } from '../../../src/domain/entities/Habit';
import { User } from '../../../src/domain/entities/User';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { HabitId } from '../../../src/domain/value-objects/HabitId';
import { Email } from '../../../src/domain/value-objects/Email';
import { HabitFrequency } from '../../../src/domain/value-objects/HabitFrequency';
import { FindHabitsOptions } from '../../../src/domain/repositories/IHabitRepository';
import { FindLogsOptions } from '../../../src/domain/repositories/IHabitLogRepository';

// ─── In-memory stubs ─────────────────────────────────────────────────────────

class InMemoryHabitRepository implements IHabitRepository {
  private habits: Habit[] = [];
  async save(habit: Habit): Promise<void> { this.habits.push(habit); }
  async update(habit: Habit): Promise<void> {
    const idx = this.habits.findIndex((h) => h.id.equals(habit.id));
    if (idx >= 0) this.habits[idx] = habit;
  }
  async findById(id: HabitId): Promise<Habit | null> {
    return this.habits.find((h) => h.id.equals(id)) ?? null;
  }
  async findAllByUserId(userId: UserId, _options?: FindHabitsOptions): Promise<Habit[]> {
    return this.habits.filter((h) => h.userId.equals(userId));
  }
  async countByUserId(userId: UserId, _options?: Pick<FindHabitsOptions, 'status'>): Promise<number> {
    return this.habits.filter((h) => h.userId.equals(userId)).length;
  }
  async delete(id: HabitId): Promise<void> {
    this.habits = this.habits.filter((h) => !h.id.equals(id));
  }
  async exists(id: HabitId): Promise<boolean> {
    return this.habits.some((h) => h.id.equals(id));
  }
}

class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  async save(user: User): Promise<void> { this.users.push(user); }
  async update(user: User): Promise<void> {
    const idx = this.users.findIndex((u) => u.id.equals(user.id));
    if (idx >= 0) this.users[idx] = user;
  }
  async findById(id: UserId): Promise<User | null> {
    return this.users.find((u) => u.id.equals(id)) ?? null;
  }
  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((u) => u.email.equals(email)) ?? null;
  }
  async exists(id: UserId): Promise<boolean> {
    return this.users.some((u) => u.id.equals(id));
  }
  async existsByEmail(email: Email): Promise<boolean> {
    return this.users.some((u) => u.email.equals(email));
  }
  async delete(id: UserId): Promise<void> {
    this.users = this.users.filter((u) => !u.id.equals(id));
  }
}

class StubIdGenerator implements IIdGenerator {
  private idx = 0;
  private ids = [
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440011',
  ];
  generate(): string {
    return this.ids[this.idx++ % this.ids.length]!;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

function buildSut() {
  const habitRepo = new InMemoryHabitRepository();
  const userRepo = new InMemoryUserRepository();
  const idGen = new StubIdGenerator();

  // Pre-seed a user
  const user = User.create({
    id: UserId.from(USER_ID),
    email: Email.from('alice@example.com'),
    displayName: 'Alice',
    passwordHash: '$2b$12$hashedpassword',
  });
  void userRepo.save(user);

  const useCase = new CreateHabitUseCase(habitRepo, userRepo, idGen);
  return { useCase, habitRepo };
}

describe('CreateHabitUseCase', () => {
  it('creates and persists a habit, returning a DTO', async () => {
    const { useCase } = buildSut();
    const result = await useCase.execute({
      userId: USER_ID,
      name: 'Morning Run',
      description: 'Run 5 km',
      frequencyType: 'daily',
      targetCount: 1,
    });

    expect(result.name).toBe('Morning Run');
    expect(result.status).toBe('active');
    expect(result.streakCount).toBe(0);
    expect(typeof result.id).toBe('string');
  });

  it('throws DomainNotFoundError when user does not exist', async () => {
    const { useCase } = buildSut();
    await expect(
      useCase.execute({
        userId: '550e8400-e29b-41d4-a716-000000000000',
        name: 'Ghost Habit',
        description: '',
        frequencyType: 'daily',
        targetCount: 1,
      }),
    ).rejects.toThrow(DomainNotFoundError);
  });

  it('propagates DomainValidationError from entity for invalid name', async () => {
    const { useCase } = buildSut();
    await expect(
      useCase.execute({
        userId: USER_ID,
        name: '',
        description: '',
        frequencyType: 'daily',
        targetCount: 1,
      }),
    ).rejects.toThrow(DomainValidationError);
  });
});
