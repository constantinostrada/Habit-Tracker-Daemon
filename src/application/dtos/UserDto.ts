/**
 * User DTOs
 *
 * Layer: Application
 * Responsibility: Input/output contracts for user-related use cases.
 */

// ─── Input DTOs ───────────────────────────────────────────────────────────────

export interface RegisterUserDto {
  email: string;
  displayName: string;
  password: string;
}

export interface AuthenticateUserDto {
  email: string;
  password: string;
}

// ─── Output DTOs ─────────────────────────────────────────────────────────────

export interface UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokenDto {
  user: UserResponseDto;
  accessToken: string;
  expiresIn: string;
}
