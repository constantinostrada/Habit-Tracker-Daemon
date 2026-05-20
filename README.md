# Habit-Tracker-Daemon

A production-ready habit tracking backend built with **TypeScript**, **Node.js (Express)**, **Python (FastAPI)**, and **PostgreSQL**, following strict **Clean Architecture** principles.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Clean Architecture Layers](#clean-architecture-layers)
- [API Reference](#api-reference)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Local Development (without Docker)](#local-development-without-docker)
  - [Docker Development](#docker-development)
  - [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Linting & Formatting](#linting--formatting)
- [Database Migrations](#database-migrations)

---

## Overview

Habit-Tracker-Daemon is a dual-service backend system:

| Service | Language | Framework | Port | Responsibility |
|---|---|---|---|---|
| **Node API** | TypeScript | Express | 3000 | Core habit CRUD, auth, streak tracking |
| **Analytics** | Python | FastAPI | 8000 | Read-only analytics, heatmaps, summaries |

Both services share the same PostgreSQL database and use the same JWT secret for token verification, allowing the analytics service to validate tokens issued by the Node API.

---

## Tech Stack

- **TypeScript 5** — strongly-typed Node.js backend
- **Node.js 20** — runtime for the primary API
- **Express 4** — HTTP framework for the Node API
- **Python 3.11** — analytics service runtime
- **FastAPI** — async Python web framework for analytics
- **PostgreSQL 16** — shared relational database
- **Docker + Docker Compose** — containerised development and deployment
- **Jest** — TypeScript unit testing
- **Pytest** — Python unit testing
- **ESLint + Prettier** — TypeScript linting and formatting
- **Ruff + mypy** — Python linting and type-checking

---

## Project Structure

```
habit-tracker-daemon/
│
├── src/                          # TypeScript source (Clean Architecture)
│   ├── domain/                   # ① Entities, Value Objects, Interfaces
│   │   ├── entities/
│   │   │   ├── Habit.ts
│   │   │   ├── HabitLog.ts
│   │   │   └── User.ts
│   │   ├── value-objects/
│   │   │   ├── HabitId.ts
│   │   │   ├── HabitLogId.ts
│   │   │   ├── UserId.ts
│   │   │   ├── Email.ts
│   │   │   └── HabitFrequency.ts
│   │   ├── repositories/         # Interfaces only — no implementation
│   │   │   ├── IHabitRepository.ts
│   │   │   ├── IHabitLogRepository.ts
│   │   │   └── IUserRepository.ts
│   │   ├── services/
│   │   │   └── StreakCalculatorService.ts
│   │   └── exceptions/
│   │       ├── DomainValidationError.ts
│   │       ├── DomainNotFoundError.ts
│   │       └── DomainConflictError.ts
│   │
│   ├── application/              # ② Use Cases, DTOs, Port Interfaces
│   │   ├── use-cases/
│   │   │   ├── habit/
│   │   │   │   ├── CreateHabitUseCase.ts
│   │   │   │   ├── GetHabitUseCase.ts
│   │   │   │   ├── ListHabitsUseCase.ts
│   │   │   │   ├── UpdateHabitUseCase.ts
│   │   │   │   └── ArchiveHabitUseCase.ts
│   │   │   ├── habit-log/
│   │   │   │   ├── LogHabitCompletionUseCase.ts
│   │   │   │   └── GetHabitStatsUseCase.ts
│   │   │   └── user/
│   │   │       ├── RegisterUserUseCase.ts
│   │   │       └── AuthenticateUserUseCase.ts
│   │   ├── dtos/
│   │   │   ├── HabitDto.ts
│   │   │   ├── HabitLogDto.ts
│   │   │   └── UserDto.ts
│   │   ├── mappers/
│   │   │   ├── HabitMapper.ts
│   │   │   ├── HabitLogMapper.ts
│   │   │   └── UserMapper.ts
│   │   └── ports/
│   │       ├── IPasswordHasher.ts
│   │       ├── ITokenService.ts
│   │       └── IIdGenerator.ts
│   │
│   ├── infrastructure/           # ③ DB, security, identity, logging
│   │   ├── database/
│   │   │   ├── PostgresClient.ts
│   │   │   ├── migrate.ts
│   │   │   └── migrations/
│   │   │       ├── 001_create_users.sql
│   │   │       ├── 002_create_habits.sql
│   │   │       └── 003_create_habit_logs.sql
│   │   ├── repositories/
│   │   │   ├── PostgresHabitRepository.ts
│   │   │   ├── PostgresHabitLogRepository.ts
│   │   │   └── PostgresUserRepository.ts
│   │   ├── security/
│   │   │   ├── BcryptPasswordHasher.ts
│   │   │   └── JwtTokenService.ts
│   │   ├── identity/
│   │   │   └── UuidIdGenerator.ts
│   │   ├── logging/
│   │   │   └── WinstonLogger.ts
│   │   └── container/
│   │       └── Container.ts      # Composition root (DI wiring)
│   │
│   └── interfaces/               # ④ Controllers, Routes, Middleware
│       └── http/
│           ├── app.ts            # Express app factory
│           ├── server.ts         # Process entry point
│           ├── controllers/
│           │   ├── HabitController.ts
│           │   ├── UserController.ts
│           │   └── HealthController.ts
│           ├── routes/
│           │   ├── habitRoutes.ts
│           │   ├── authRoutes.ts
│           │   └── healthRoutes.ts
│           └── middleware/
│               ├── errorHandler.ts
│               ├── authMiddleware.ts
│               └── requestLogger.ts
│
├── services/
│   └── analytics/                # Python FastAPI analytics service
│       ├── app/
│       │   ├── main.py           # FastAPI entry point
│       │   ├── config.py         # Pydantic settings
│       │   ├── database.py       # asyncpg pool
│       │   ├── auth.py           # JWT verification
│       │   ├── schemas.py        # Pydantic request/response models
│       │   └── routers/
│       │       ├── analytics.py  # Analytics endpoints
│       │       └── health.py     # Health probes
│       ├── tests/
│       ├── requirements.txt
│       └── pyproject.toml
│
├── tests/                        # TypeScript tests
│   ├── domain/
│   └── application/
│
├── Dockerfile.node               # Node.js multi-stage build
├── Dockerfile.python             # Python multi-stage build
├── docker-compose.yml            # Production compose
├── docker-compose.dev.yml        # Dev overrides (hot reload)
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Clean Architecture Layers

This project enforces the **Dependency Rule**: source code dependencies point only inward. Outer layers know about inner layers; inner layers know nothing about outer layers.

```
┌────────────────────────────────────────┐
│           interfaces/                  │  HTTP controllers, routes, middleware
│  (Express, FastAPI — framework I/O)    │
├────────────────────────────────────────┤
│         infrastructure/                │  PostgreSQL, bcrypt, JWT, UUID
│  (DB clients, security, adapters)      │
├────────────────────────────────────────┤
│          application/                  │  Use cases, DTOs, port interfaces
│  (orchestration — WHAT, not HOW)       │
├────────────────────────────────────────┤
│            domain/                     │  Entities, value objects, domain services
│  (pure business rules — zero deps)     │
└────────────────────────────────────────┘
```

### ① `src/domain/` — The Core

The heart of the application. **Zero** third-party dependencies.

- **Entities** (`Habit`, `HabitLog`, `User`) — objects with identity that protect their own invariants. All validation lives in the entity constructor/factory.
- **Value Objects** (`Email`, `HabitId`, `HabitFrequency`, …) — immutable, equality by value, self-validating.
- **Repository Interfaces** (`IHabitRepository`, …) — describe _what_ persistence operations exist using domain language. No SQL, no ORM.
- **Domain Services** (`StreakCalculatorService`) — logic that operates on multiple entities or doesn't belong to a single one.
- **Domain Exceptions** — `DomainValidationError`, `DomainNotFoundError`, `DomainConflictError`.

### ② `src/application/` — Orchestration

Knows _what_ to do, not _how_. Imports only from `domain/`.

- **Use Cases** — one class per use case, one `execute(dto)` method. Receives all dependencies via constructor (DI).
- **DTOs** — plain data transfer objects for use case input/output. Domain entities are never returned directly.
- **Mappers** — convert domain entities → DTOs.
- **Port Interfaces** — `IPasswordHasher`, `ITokenService`, `IIdGenerator` — abstractions for infrastructure needs.

### ③ `src/infrastructure/` — Adapters & Drivers

Implements the interfaces defined in domain/application. All I/O lives here.

- **Repository Implementations** — `PostgresHabitRepository` etc. Map DB rows ↔ domain entities. Zero business logic.
- **Security** — `BcryptPasswordHasher`, `JwtTokenService` — implement application port interfaces.
- **`Container.ts`** — the composition root. The **only** place where concrete classes are wired to their abstractions.

### ④ `src/interfaces/` — Entry Points

Translates external input into use case calls, use case output into HTTP responses.

- **Controllers** — thin: validate schema → call use case → serialize response.
- **Middleware** — `authMiddleware` (JWT extraction), `errorHandler` (domain errors → HTTP status codes), `requestLogger`.
- **Routes** — map URLs and HTTP verbs to controller methods.

---

## API Reference

### Node.js API (port 3000)

#### Auth
| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user | ❌ |
| `POST` | `/api/v1/auth/login` | Authenticate and receive a JWT | ❌ |

#### Habits
| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/habits` | Create a habit | ✅ |
| `GET` | `/api/v1/habits` | List habits (paginated) | ✅ |
| `GET` | `/api/v1/habits/:id` | Get a single habit | ✅ |
| `PUT` | `/api/v1/habits/:id` | Update a habit | ✅ |
| `DELETE` | `/api/v1/habits/:id` | Archive a habit | ✅ |
| `POST` | `/api/v1/habits/:id/logs` | Log a completion | ✅ |
| `GET` | `/api/v1/habits/:id/stats` | Get streak stats | ✅ |

#### Health
| Method | Path | Description |
|---|---|---|
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (checks DB) |

### Python Analytics API (port 8000)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/v1/analytics/summary` | User-level stats summary | ✅ |
| `GET` | `/api/v1/analytics/habits/:id/heatmap` | Daily completions heatmap | ✅ |
| `GET` | `/api/v1/analytics/top-habits` | Top habits by streak | ✅ |
| `GET` | `/health/live` | Liveness probe | ❌ |
| `GET` | `/health/ready` | Readiness probe | ❌ |

Interactive docs available at `http://localhost:8000/docs` (Swagger UI).

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **PostgreSQL** ≥ 14  _OR_ **Docker Desktop**
- **npm** ≥ 9

---

### Local Development (without Docker)

#### 1. Clone and install Node dependencies

```bash
git clone <repo-url>
cd habit-tracker-daemon
npm install
```

#### 2. Set up Python virtual environment

```bash
cd services/analytics
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

#### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and a strong JWT_SECRET
```

#### 4. Run database migrations

```bash
npm run migrate:dev
```

#### 5. Start the Node.js API

```bash
npm run dev
# → http://localhost:3000
```

#### 6. Start the Python analytics service

```bash
cd services/analytics
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

### Docker Development

```bash
# Copy and configure env
cp .env.example .env

# Start all services with hot-reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Run migrations inside the Node container
docker compose exec node-api npm run migrate:dev
```

---

### Production Deployment

```bash
# Build and start production containers
docker compose up --build -d

# Run migrations
docker compose exec node-api node dist/infrastructure/database/migrate.js

# View logs
docker compose logs -f
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Node environment | `development` |
| `PORT` | Node API port | `3000` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | Database name | `habit_tracker` |
| `POSTGRES_USER` | DB user | `postgres` |
| `POSTGRES_PASSWORD` | DB password | `postgres` |
| `JWT_SECRET` | **Secret for signing JWTs — must be the same for both services** | — |
| `JWT_EXPIRES_IN` | Token TTL | `7d` |
| `BCRYPT_ROUNDS` | Bcrypt cost factor | `12` |
| `LOG_LEVEL` | Winston log level | `info` |
| `CORS_ORIGINS` | Comma-separated allowed origins | — |

---

## Running Tests

### TypeScript (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

### Python (pytest)

```bash
cd services/analytics
source .venv/bin/activate
pytest
pytest --cov=app tests/          # with coverage
```

---

## Linting & Formatting

### TypeScript

```bash
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format
npm run format:check  # Prettier check (CI)
npm run typecheck     # tsc --noEmit
```

### Python

```bash
cd services/analytics
ruff check app/       # Lint
ruff format app/      # Format
mypy app/             # Type check
```

---

## Database Migrations

SQL migration files live in `src/infrastructure/database/migrations/`.
They are applied in alphabetical order and tracked in a `_migrations` table.

```bash
# Development (ts-node)
npm run migrate:dev

# Production (compiled JS)
npm run migrate
```

To add a new migration, create a file following the naming convention:
```
004_add_habit_tags.sql
```
