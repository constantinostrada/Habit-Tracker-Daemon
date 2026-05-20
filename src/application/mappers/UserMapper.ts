/**
 * UserMapper
 *
 * Layer: Application
 * Responsibility: Converts User domain entities into response DTOs.
 * NEVER exposes the password hash.
 */

import { User } from '../../domain/entities/User';
import { UserResponseDto } from '../dtos/UserDto';

export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return {
      id: user.id.value,
      email: user.email.value,
      displayName: user.displayName,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
