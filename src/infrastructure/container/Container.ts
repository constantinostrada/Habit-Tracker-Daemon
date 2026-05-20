/**
 * Container (Composition Root)
 *
 * Layer: Infrastructure
 * Responsibility: Wire all dependencies together — the single place where
 * concrete implementations are paired with their abstractions.
 *
 * This is the ONLY place where infrastructure classes are instantiated.
 * The interfaces layer receives use cases, never raw infrastructure.
 */

import { PostgresClient } from '../database/PostgresClient';

// Repositories
import { PostgresHabitRepository } from '../repositories/PostgresHabitRepository';
import { PostgresHabitLogRepository } from '../repositories/PostgresHabitLogRepository';
import { PostgresUserRepository } from '../repositories/PostgresUserRepository';

// Infrastructure services
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtTokenService } from '../security/JwtTokenService';
import { UuidIdGenerator } from '../identity/UuidIdGenerator';

// Domain services
import { StreakCalculatorService } from '../../domain/services/StreakCalculatorService';

// Use cases — Habit
import { CreateHabitUseCase } from '../../application/use-cases/habit/CreateHabitUseCase';
import { GetHabitUseCase } from '../../application/use-cases/habit/GetHabitUseCase';
import { ListHabitsUseCase } from '../../application/use-cases/habit/ListHabitsUseCase';
import { UpdateHabitUseCase } from '../../application/use-cases/habit/UpdateHabitUseCase';
import { ArchiveHabitUseCase } from '../../application/use-cases/habit/ArchiveHabitUseCase';

// Use cases — HabitLog
import { LogHabitCompletionUseCase } from '../../application/use-cases/habit-log/LogHabitCompletionUseCase';
import { GetHabitStatsUseCase } from '../../application/use-cases/habit-log/GetHabitStatsUseCase';

// Use cases — User
import { RegisterUserUseCase } from '../../application/use-cases/user/RegisterUserUseCase';
import { AuthenticateUserUseCase } from '../../application/use-cases/user/AuthenticateUserUseCase';

export interface AppContainer {
  // Infrastructure
  db: PostgresClient;
  tokenService: JwtTokenService;

  // Use cases — Habits
  createHabitUseCase: CreateHabitUseCase;
  getHabitUseCase: GetHabitUseCase;
  listHabitsUseCase: ListHabitsUseCase;
  updateHabitUseCase: UpdateHabitUseCase;
  archiveHabitUseCase: ArchiveHabitUseCase;

  // Use cases — HabitLogs
  logHabitCompletionUseCase: LogHabitCompletionUseCase;
  getHabitStatsUseCase: GetHabitStatsUseCase;

  // Use cases — Users
  registerUserUseCase: RegisterUserUseCase;
  authenticateUserUseCase: AuthenticateUserUseCase;
}

export function buildContainer(): AppContainer {
  // ── Infrastructure singletons ──────────────────────────────────────────────
  const db = new PostgresClient();
  const idGenerator = new UuidIdGenerator();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  // ── Repository implementations ─────────────────────────────────────────────
  const habitRepository = new PostgresHabitRepository(db);
  const habitLogRepository = new PostgresHabitLogRepository(db);
  const userRepository = new PostgresUserRepository(db);

  // ── Domain services ────────────────────────────────────────────────────────
  const streakCalculator = new StreakCalculatorService();

  // ── Use cases — Habits ─────────────────────────────────────────────────────
  const createHabitUseCase = new CreateHabitUseCase(habitRepository, userRepository, idGenerator);
  const getHabitUseCase = new GetHabitUseCase(habitRepository);
  const listHabitsUseCase = new ListHabitsUseCase(habitRepository);
  const updateHabitUseCase = new UpdateHabitUseCase(habitRepository);
  const archiveHabitUseCase = new ArchiveHabitUseCase(habitRepository);

  // ── Use cases — HabitLogs ──────────────────────────────────────────────────
  const logHabitCompletionUseCase = new LogHabitCompletionUseCase(
    habitRepository,
    habitLogRepository,
    idGenerator,
  );
  const getHabitStatsUseCase = new GetHabitStatsUseCase(
    habitRepository,
    habitLogRepository,
    streakCalculator,
  );

  // ── Use cases — Users ──────────────────────────────────────────────────────
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher, idGenerator);
  const authenticateUserUseCase = new AuthenticateUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  return {
    db,
    tokenService,
    createHabitUseCase,
    getHabitUseCase,
    listHabitsUseCase,
    updateHabitUseCase,
    archiveHabitUseCase,
    logHabitCompletionUseCase,
    getHabitStatsUseCase,
    registerUserUseCase,
    authenticateUserUseCase,
  };
}
