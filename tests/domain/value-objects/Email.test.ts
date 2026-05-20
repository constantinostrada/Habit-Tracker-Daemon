/**
 * Email Value Object Tests
 */

import { Email } from '../../../src/domain/value-objects/Email';
import { DomainValidationError } from '../../../src/domain/exceptions/DomainValidationError';

describe('Email value object', () => {
  it('creates a valid email and normalises to lowercase', () => {
    const email = Email.from('User@Example.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('throws for an email without @', () => {
    expect(() => Email.from('notanemail')).toThrow(DomainValidationError);
  });

  it('throws for an email without domain', () => {
    expect(() => Email.from('user@')).toThrow(DomainValidationError);
  });

  it('throws for an email that is too long', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    expect(() => Email.from(longEmail)).toThrow(DomainValidationError);
  });

  it('implements value equality', () => {
    const a = Email.from('alice@example.com');
    const b = Email.from('ALICE@EXAMPLE.COM');
    expect(a.equals(b)).toBe(true);
  });

  it('is not equal to a different email', () => {
    const a = Email.from('alice@example.com');
    const b = Email.from('bob@example.com');
    expect(a.equals(b)).toBe(false);
  });
});
