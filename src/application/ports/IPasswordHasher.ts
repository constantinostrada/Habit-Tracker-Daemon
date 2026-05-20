/**
 * IPasswordHasher — Port Interface
 *
 * Layer: Application
 * Responsibility: Abstracts password hashing so the use case never
 * knows whether bcrypt, argon2, or any other algorithm is used.
 *
 * Infrastructure provides the concrete implementation.
 */

export interface IPasswordHasher {
  hash(plaintext: string): Promise<string>;
  compare(plaintext: string, hash: string): Promise<boolean>;
}
