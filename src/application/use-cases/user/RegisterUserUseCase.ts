/**
 * RegisterUserUseCase
 *
 * Layer: Application
 * Responsibility: Register a new user account.
 *
 * Flow:
 *   1. Check email uniqueness.
 *   2. Hash password via port abstraction.
 *   3. Create User entity (domain validates invariants).
 *   4. Persist.
 *   5. Return DTO.
 */

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { DomainConflictError } from '../../../domain/exceptions/DomainConflictError';
import { RegisterUserDto, UserResponseDto } from '../../dtos/UserDto';
import { UserMapper } from '../../mappers/UserMapper';
import { IPasswordHasher } from '../../ports/IPasswordHasher';
import { IIdGenerator } from '../../ports/IIdGenerator';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    const email = Email.from(dto.email);

    const emailTaken = await this.userRepository.existsByEmail(email);
    if (emailTaken) {
      throw new DomainConflictError(`The email address '${email.value}' is already registered.`);
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user = User.create({
      id: UserId.from(this.idGenerator.generate()),
      email,
      displayName: dto.displayName,
      passwordHash,
    });

    await this.userRepository.save(user);

    return UserMapper.toDto(user);
  }
}
