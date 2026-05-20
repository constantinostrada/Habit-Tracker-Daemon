/**
 * HabitFrequency Value Object
 *
 * Layer: Domain
 * Responsibility: Encapsulates how often a habit should be performed.
 * Supports daily, weekly, and custom (N days per week) cadences.
 */

import { DomainValidationError } from '../exceptions/DomainValidationError';

export type FrequencyType = 'daily' | 'weekly' | 'custom';

export interface HabitFrequencyProps {
  type: FrequencyType;
  /** For 'custom': how many times per week (1–7). Ignored for daily/weekly. */
  timesPerWeek?: number;
}

export class HabitFrequency {
  private readonly _type: FrequencyType;
  private readonly _timesPerWeek: number;

  private constructor(type: FrequencyType, timesPerWeek: number) {
    this._type = type;
    this._timesPerWeek = timesPerWeek;
  }

  static create(props: HabitFrequencyProps): HabitFrequency {
    switch (props.type) {
      case 'daily':
        return new HabitFrequency('daily', 7);
      case 'weekly':
        return new HabitFrequency('weekly', 1);
      case 'custom': {
        const times = props.timesPerWeek ?? 0;
        if (!Number.isInteger(times) || times < 1 || times > 7) {
          throw new DomainValidationError(
            'Custom frequency timesPerWeek must be an integer between 1 and 7.',
          );
        }
        return new HabitFrequency('custom', times);
      }
      default:
        throw new DomainValidationError(`Unknown frequency type: '${String(props.type)}'.`);
    }
  }

  get type(): FrequencyType {
    return this._type;
  }

  get timesPerWeek(): number {
    return this._timesPerWeek;
  }

  equals(other: HabitFrequency): boolean {
    return this._type === other._type && this._timesPerWeek === other._timesPerWeek;
  }

  toString(): string {
    if (this._type === 'custom') {
      return `custom(${this._timesPerWeek}x/week)`;
    }
    return this._type;
  }
}
