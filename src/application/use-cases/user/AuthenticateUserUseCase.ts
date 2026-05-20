/**
 * AuthenticateUserUseCase
 *
 * Layer: Application
 * Responsibility: Verify credentials and issue an access token.
 */

import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { DomainValidationError } from '../../../domain/exceptions/DomainValidationError';
import { AuthenticateUserDto, AuthTokenDto } from '../../dtos/UserDto';
import { UserMapper } from '../../mappers/UserMapper';
import { IPasswordHasher } from '../../ports/IPasswordHasher';
import { ITokenService } from '../../ports/ITokenService';

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: AuthenticateUserDto): Promise<AuthTokenDto> {
    const email = Email.from(dto.email);

    const user = await this.userRepository.findByEmail(email);

    // Constant-time-friendly: always compare even if user not found
    const hashToCheck = user?.passwordHash ?? '$2b$12$invalidhashpaddingtomimicbcryptlength000';
    const passwordMatch = await this.passwordHasher.compare(dto.password, hashToCheck);

    if (!user || !passwordMatch) {
      throw new DomainValidationError('Invalid email or password.');
    }

    const token = this.tokenService.generate({
      sub: user.id.value,
      email: user.email.value,
    });

    return {
      user: UserMapper.toDto(user),
      accessToken: token,
      expiresIn: this.tokenService.getExpiresIn(),
    };
  }
}
