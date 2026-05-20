/**
 * ITokenService — Port Interface
 *
 * Layer: Application
 * Responsibility: Abstracts JWT (or any token) generation and verification.
 */

export interface TokenPayload {
  sub: string; // userId
  email: string;
}

export interface ITokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
  getExpiresIn(): string;
}
