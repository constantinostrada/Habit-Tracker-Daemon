/**
 * BcryptPasswordHasher
 *
 * Layer: Infrastructure
 * Responsibility: Implements IPasswordHasher using the bcryptjs algorithm.
 * The application layer only sees IPasswordHasher — bcrypt is an infra detail.
 *
 * NOTE: requires `npm install bcryptjs @types/bcryptjs`
 * Using dynamic require to avoid hard dependency during scaffolding.
 */

import { IPasswordHasher } from '../../application/ports/IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly rounds: number;

  constructor() {
    this.rounds = parseInt(process.env['BCRYPT_ROUNDS'] ?? '12', 10);
  }

  async hash(plaintext: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
    const salt = await bcrypt.genSalt(this.rounds);
    return bcrypt.hash(plaintext, salt);
  }

  async compare(plaintext: string, hash: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
    return bcrypt.compare(plaintext, hash);
  }
}
