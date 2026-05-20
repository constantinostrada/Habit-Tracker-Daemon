/**
 * JwtTokenService
 *
 * Layer: Infrastructure
 * Responsibility: Implements ITokenService using JSON Web Tokens (jsonwebtoken).
 * JWT details (secret, algorithm, expiry) are infrastructure configuration.
 *
 * NOTE: requires `npm install jsonwebtoken @types/jsonwebtoken`
 */

import { ITokenService, TokenPayload } from '../../application/ports/ITokenService';
import { DomainValidationError } from '../../domain/exceptions/DomainValidationError';

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }
    this.secret = secret;
    this.expiresIn = process.env['JWT_EXPIRES_IN'] ?? '7d';
  }

  generate(payload: TokenPayload): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): TokenPayload {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jwt = require('jsonwebtoken') as typeof import('jsonwebtoken');
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch {
      throw new DomainValidationError('Invalid or expired access token.');
    }
  }

  getExpiresIn(): string {
    return this.expiresIn;
  }
}
