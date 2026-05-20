/**
 * UuidIdGenerator
 *
 * Layer: Infrastructure
 * Responsibility: Implements IIdGenerator using the 'uuid' library (v4).
 * The use case only depends on IIdGenerator — UUID is an infra detail.
 */

import { v4 as uuidv4 } from 'uuid';
import { IIdGenerator } from '../../application/ports/IIdGenerator';

export class UuidIdGenerator implements IIdGenerator {
  generate(): string {
    return uuidv4();
  }
}
